import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.agents.summarizer import summarizer_agent
from app.agents.guardrail import guardrail_agent
from app.agents.pipeline import pipeline

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_consumer_feed():
    res = client.get("/api/v1/feed")
    assert res.status_code == 200
    cards = res.json()
    assert len(cards) >= 3
    
    # Check first card structure and word count budget
    card = cards[0]
    assert "advocate_summary" in card
    assert "citizen_summary" in card
    assert "headline" in card
    assert "court_name" in card
    
    adv_words = len(card["advocate_summary"].split())
    cit_words = len(card["citizen_summary"].split())
    assert adv_words <= 65, f"Advocate summary too long: {adv_words} words"
    assert cit_words <= 52, f"Citizen summary too long: {cit_words} words"

def test_bare_act_lookup():
    res = client.get("/api/v1/statutes/lookup?act=BNS&section=103")
    assert res.status_code == 200
    data = res.json()
    assert data["section_number"] == "103"
    assert "Murder" in data["title"]
    assert "bare_act_text" in data
    assert "layman_explanation" in data

def test_daily_law():
    res = client.get("/api/v1/daily-law/today")
    assert res.status_code == 200
    data = res.json()
    assert "topic" in data
    assert "practical_tip" in data
    assert "quiz_options" in data
    assert len(data["quiz_options"]) >= 2

def test_push_subscription():
    sub_payload = {
        "endpoint": "https://fcm.googleapis.com/test-endpoint-12345",
        "user_role": "advocate",
        "topics": ["breaking", "criminal"]
    }
    res = client.post("/api/v1/push/subscribe", json=sub_payload)
    assert res.status_code == 200
    assert res.json()["status"] == "subscribed"

def test_admin_auth_security():
    # Attempting to access admin triage without key MUST fail with 401
    unauth_res = client.get("/api/v1/admin/triage")
    assert unauth_res.status_code == 401
    
    # Access with valid X-Admin-Key MUST succeed
    auth_res = client.get("/api/v1/admin/triage", headers={"X-Admin-Key": settings.ADMIN_API_KEY})
    assert auth_res.status_code == 200
    items = auth_res.json()
    assert isinstance(items, list)

def test_admin_triage_approval_flow():
    # Get pending triage item
    res = client.get("/api/v1/admin/triage?status=IN_REVIEW", headers={"X-Admin-Key": settings.ADMIN_API_KEY})
    assert res.status_code == 200
    items = res.json()
    if len(items) > 0:
        target_id = items[0]["id"]
        # Approve the item with breaking push alert
        action_payload = {
            "action": "APPROVE",
            "broadcast_push": True
        }
        approve_res = client.post(
            f"/api/v1/admin/triage/{target_id}/action",
            json=action_payload,
            headers={"X-Admin-Key": settings.ADMIN_API_KEY}
        )
        assert approve_res.status_code == 200
        assert approve_res.json()["new_status"] == "PUBLISHED"

def test_ai_agents_pipeline():
    sample_text = (
        "In the Supreme Court of India. Present: Gavai J., Kant J. "
        "The appellant was prosecuted under Section 138 of the Negotiable Instruments Act. "
        "The High Court refused to quash proceedings under Section 482 CrPC. "
        "We hold that debt was time-barred and appeal is allowed."
    )
    result = pipeline.process(raw_text=sample_text, court_name="Supreme Court of India")
    assert "headline" in result
    assert "advocate_summary" in result
    assert "citizen_summary" in result
    assert result["holding"] == "Allowed"
    assert len(result["advocate_summary"].split()) <= 65
    assert len(result["citizen_summary"].split()) <= 52
