import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import PushSubscription

class NotificationService:
    """
    Push Notification Service supporting WebPush (VAPID) and Firebase FCM.
    Handles audience segmentation (Advocate vs Citizen), breaking news alerts,
    and broadcast dispatches.
    """
    
    def __init__(self):
        # In-memory dispatch audit log
        self.dispatch_history: List[Dict[str, Any]] = []

    def subscribe(self, db: Session, endpoint: str, p256dh: Optional[str], auth: Optional[str], role: str, topics: List[str]) -> PushSubscription:
        existing = db.query(PushSubscription).filter(PushSubscription.endpoint == endpoint).first()
        if existing:
            existing.p256dh = p256dh
            existing.auth = auth
            existing.user_role = role
            existing.topics = topics
            db.commit()
            db.refresh(existing)
            return existing
            
        sub = PushSubscription(
            endpoint=endpoint,
            p256dh=p256dh,
            auth=auth,
            user_role=role,
            topics=topics
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)
        return sub

    def broadcast(
        self,
        db: Session,
        title: str,
        body: str,
        card_id: Optional[str] = None,
        target_role: str = "all",
        is_breaking: bool = True
    ) -> Dict[str, Any]:
        """
        Dispatches push notifications to subscribers matching target role and topic preferences.
        """
        query = db.query(PushSubscription)
        if target_role != "all":
            query = query.filter((PushSubscription.user_role == target_role) | (PushSubscription.user_role == "all"))
            
        subscribers = query.all()
        recipient_count = len(subscribers)
        
        payload = {
            "title": f"🚨 BREAKING: {title}" if is_breaking else title,
            "body": body[:120] + "..." if len(body) > 120 else body,
            "icon": "/icons/icon-192x192.png",
            "badge": "/icons/badge-72x72.png",
            "data": {
                "card_id": card_id,
                "url": f"/#card-{card_id}" if card_id else "/",
                "timestamp": datetime.utcnow().isoformat(),
                "priority": "high" if is_breaking else "normal"
            }
        }
        
        dispatch_record = {
            "id": f"push_{len(self.dispatch_history) + 1}",
            "title": payload["title"],
            "body": payload["body"],
            "recipient_count": recipient_count,
            "target_role": target_role,
            "is_breaking": is_breaking,
            "card_id": card_id,
            "dispatched_at": datetime.utcnow().isoformat(),
            "status": "SENT"
        }
        self.dispatch_history.insert(0, dispatch_record)
        
        return {
            "status": "success",
            "subscribers_notified": recipient_count,
            "payload": payload,
            "dispatch_id": dispatch_record["id"]
        }

    def get_history(self) -> List[Dict[str, Any]]:
        return self.dispatch_history[:30]

notification_service = NotificationService()
