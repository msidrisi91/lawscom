from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_admin_auth
from app.schemas.schemas import PushBroadcastRequest
from app.services.notification_service import notification_service

router = APIRouter(prefix="/admin/broadcast", tags=["Admin Push Broadcast"], dependencies=[Depends(verify_admin_auth)])

@router.post("")
def broadcast_push_notification(payload: PushBroadcastRequest, db: Session = Depends(get_db)):
    """
    Broadcasts custom breaking news push notifications to consumer devices.
    """
    result = notification_service.broadcast(
        db=db,
        title=payload.title,
        body=payload.body,
        card_id=payload.card_id,
        target_role=payload.target_role,
        is_breaking=payload.is_breaking
    )
    return result

@router.get("/history")
def get_broadcast_history(limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    """Returns past push dispatch audit logs with database pagination."""
    return notification_service.get_history(db=db, limit=limit, offset=offset)

