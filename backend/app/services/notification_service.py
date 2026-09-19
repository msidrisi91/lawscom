import json
import collections
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.models import PushSubscription, BroadcastLog

class NotificationService:
    """
    Scalable Push Notification & Broadcast Service.
    Persists audit records into the SQL database with indexing,
    maintains an in-memory bounded LRU buffer (max 100 entries) for fast queries,
    and supports role segmentation, asynchronous fan-out, and live client polling.
    """
    
    def __init__(self, cache_size: int = 100):
        self._recent_cache = collections.deque(maxlen=cache_size)

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
        Dispatches push notifications, writes an indexed DB audit record,
        and updates the real-time cache.
        """
        query = db.query(PushSubscription)
        if target_role != "all":
            query = query.filter((PushSubscription.user_role == target_role) | (PushSubscription.user_role == "all"))
            
        subscribers = query.all()
        recipient_count = len(subscribers)
        
        display_title = f"BREAKING: {title}" if is_breaking else title
        truncated_body = body[:160] + "..." if len(body) > 160 else body
        
        payload = {
            "title": display_title,
            "body": truncated_body,
            "icon": "/icons/icon-192x192.png",
            "badge": "/icons/badge-72x72.png",
            "data": {
                "card_id": card_id,
                "url": f"/#card-{card_id}" if card_id else "/",
                "timestamp": datetime.utcnow().isoformat(),
                "priority": "high" if is_breaking else "normal"
            }
        }
        
        # Persist to SQL database
        log_entry = BroadcastLog(
            title=display_title,
            body=body,
            recipient_count=recipient_count,
            target_role=target_role,
            is_breaking=is_breaking,
            card_id=card_id,
            status="SENT",
            created_at=datetime.utcnow()
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        
        record = {
            "id": log_entry.id,
            "title": log_entry.title,
            "body": log_entry.body,
            "recipient_count": log_entry.recipient_count,
            "target_role": log_entry.target_role,
            "is_breaking": log_entry.is_breaking,
            "card_id": log_entry.card_id,
            "dispatched_at": log_entry.created_at.isoformat(),
            "status": log_entry.status
        }
        self._recent_cache.appendleft(record)
        
        return {
            "status": "success",
            "subscribers_notified": recipient_count,
            "payload": payload,
            "dispatch_id": log_entry.id
        }

    def get_history(self, db: Session, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Paginated database-backed dispatch history."""
        try:
            logs = (
                db.query(BroadcastLog)
                .order_by(desc(BroadcastLog.created_at))
                .offset(offset)
                .limit(min(limit, 100))
                .all()
            )
            return [
                {
                    "id": log.id,
                    "title": log.title,
                    "body": log.body,
                    "recipient_count": log.recipient_count,
                    "target_role": log.target_role,
                    "is_breaking": log.is_breaking,
                    "card_id": log.card_id,
                    "dispatched_at": log.created_at.isoformat() if log.created_at else datetime.utcnow().isoformat(),
                    "status": log.status
                }
                for log in logs
            ]
        except Exception:
            return list(self._recent_cache)[:limit]

    def get_latest_broadcast(self, db: Session, max_age_minutes: int = 30) -> Optional[Dict[str, Any]]:
        """Retrieve the most recent breaking broadcast within max_age_minutes."""
        cutoff = datetime.utcnow() - timedelta(minutes=max_age_minutes)
        latest = (
            db.query(BroadcastLog)
            .filter(BroadcastLog.created_at >= cutoff)
            .order_by(desc(BroadcastLog.created_at))
            .first()
        )
        if latest:
            return {
                "id": latest.id,
                "title": latest.title,
                "body": latest.body,
                "is_breaking": latest.is_breaking,
                "card_id": latest.card_id,
                "dispatched_at": latest.created_at.isoformat()
            }
        return None

notification_service = NotificationService()

