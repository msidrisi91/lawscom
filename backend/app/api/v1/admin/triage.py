from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_admin_auth
from app.models.models import SummaryCard
from app.schemas.schemas import TriageCardItem, TriageActionRequest
from app.services.notification_service import notification_service

router = APIRouter(prefix="/admin/triage", tags=["Admin HITL Triage"], dependencies=[Depends(verify_admin_auth)])

@router.get("", response_model=List[TriageCardItem])
def get_triage_queue(
    status: str = Query("IN_REVIEW", description="Status filter: IN_REVIEW, DRAFT, PUBLISHED, REJECTED"),
    db: Session = Depends(get_db)
):
    """
    Returns pending cards waiting for Human-In-The-Loop review.
    """
    query = db.query(SummaryCard)
    if status != "ALL":
        query = query.filter(SummaryCard.status == status)
    return query.order_by(SummaryCard.created_at.desc()).all()

@router.post("/{card_id}/action")
def process_triage_action(
    card_id: str,
    action_data: TriageActionRequest,
    db: Session = Depends(get_db)
):
    """
    1-Click editorial action: APPROVE, UPDATE_AND_APPROVE, or REJECT.
    Optionally broadcasts a breaking push notification immediately.
    """
    card = db.query(SummaryCard).filter(SummaryCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found in triage queue")
        
    push_result = None
    
    if action_data.action in ["APPROVE", "UPDATE_AND_APPROVE"]:
        card.status = "PUBLISHED"
        card.published_at = datetime.utcnow()
        
        if action_data.headline:
            card.headline = action_data.headline
        if action_data.advocate_summary:
            card.advocate_summary = action_data.advocate_summary
        if action_data.citizen_summary:
            card.citizen_summary = action_data.citizen_summary
            
        # Broadcast push alert if selected by editor
        if action_data.broadcast_push:
            push_result = notification_service.broadcast(
                db=db,
                title=card.headline,
                body=card.citizen_summary[:100],
                card_id=card.id,
                target_role="all",
                is_breaking=card.is_breaking
            )
            
    elif action_data.action == "REJECT":
        card.status = "REJECTED"
        
    db.commit()
    db.refresh(card)
    
    return {
        "status": "success",
        "card_id": card.id,
        "new_status": card.status,
        "push_result": push_result
    }
