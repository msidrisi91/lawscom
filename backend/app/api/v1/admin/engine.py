from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_admin_auth
from app.models.models import EngineConfig
from app.schemas.schemas import EngineConfigUpdate

router = APIRouter(prefix="/admin/engine", tags=["Admin Engine Controls"], dependencies=[Depends(verify_admin_auth)])

@router.get("")
def get_engine_status(db: Session = Depends(get_db)):
    """Returns status of AI publishing pipeline, confidence threshold, and scrapers."""
    config = db.query(EngineConfig).filter(EngineConfig.id == 1).first()
    if not config:
        config = EngineConfig(id=1, auto_publish_enabled=True, confidence_threshold=0.95)
        db.add(config)
        db.commit()
        db.refresh(config)
        
    return {
        "auto_publish_enabled": config.auto_publish_enabled,
        "confidence_threshold": config.confidence_threshold,
        "last_scraper_run": config.last_scraper_run,
        "scraper_status": config.scraper_status
    }

@router.put("")
def update_engine_config(payload: EngineConfigUpdate, db: Session = Depends(get_db)):
    """Allows administrators to toggle auto-publishing and adjust confidence threshold."""
    config = db.query(EngineConfig).filter(EngineConfig.id == 1).first()
    if not config:
        config = EngineConfig(id=1)
        db.add(config)
        
    if payload.auto_publish_enabled is not None:
        config.auto_publish_enabled = payload.auto_publish_enabled
    if payload.confidence_threshold is not None:
        config.confidence_threshold = payload.confidence_threshold
        
    db.commit()
    db.refresh(config)
    return {
        "status": "updated",
        "auto_publish_enabled": config.auto_publish_enabled,
        "confidence_threshold": config.confidence_threshold
    }
