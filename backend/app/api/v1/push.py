from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import PushSubscribeRequest
from app.services.notification_service import notification_service
from app.config import settings

router = APIRouter(prefix="/push", tags=["Push Subscriptions"])

@router.get("/vapid-public-key")
def get_vapid_public_key():
    """Returns the application VAPID public key for WebPush registration."""
    return {"vapid_public_key": settings.VAPID_PUBLIC_KEY}

@router.post("/subscribe")
def subscribe_to_push(payload: PushSubscribeRequest, db: Session = Depends(get_db)):
    """
    Subscribes consumer device (WebPush or Mobile FCM) to receive breaking alerts
    and daily legal briefs.
    """
    sub = notification_service.subscribe(
        db=db,
        endpoint=payload.endpoint,
        p256dh=payload.p256dh,
        auth=payload.auth,
        role=payload.user_role,
        topics=payload.topics
    )
    return {"status": "subscribed", "id": sub.id, "role": sub.user_role}
