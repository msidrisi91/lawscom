from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_admin_auth
from app.models.models import SummaryCard
from app.schemas.schemas import ManualCardCreateRequest, AIAssistDraftRequest
from app.agents.pipeline import pipeline
from app.services.notification_service import notification_service

router = APIRouter(prefix="/admin/manual", tags=["Admin Manual & AI Co-Pilot"], dependencies=[Depends(verify_admin_auth)])

@router.post("/create")
def create_card_manual(payload: ManualCardCreateRequest, db: Session = Depends(get_db)):
    """Allows legal editors to publish or draft a card manually."""
    card = SummaryCard(
        court_name=payload.court_name,
        category=payload.category,
        headline=payload.headline,
        advocate_summary=payload.advocate_summary,
        citizen_summary=payload.citizen_summary,
        ratio_decidendi=payload.ratio_decidendi,
        holding=payload.holding,
        citation=payload.citation,
        bench=payload.bench,
        related_sections=payload.related_sections,
        status="PUBLISHED",
        publish_mode="MANUAL",
        confidence_score=1.0,
        is_breaking=payload.is_breaking,
        published_at=datetime.utcnow()
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    
    if payload.broadcast_push:
        notification_service.broadcast(
            db=db,
            title=card.headline,
            body=card.citizen_summary[:100],
            card_id=card.id,
            target_role="all",
            is_breaking=card.is_breaking
        )
        
    return {"status": "created", "card_id": card.id}

@router.post("/ai-assist")
def ai_assist_draft(payload: AIAssistDraftRequest):
    """
    AI Co-Pilot: Accepts raw reporter notes, court orders, or unformatted text
    and returns a structured draft with Advocate & Citizen 60-word micro-summaries.
    """
    draft = pipeline.process(
        raw_text=payload.raw_text,
        court_name=payload.court_name,
        auto_publish_enabled=False # Force draft review
    )
    return draft
