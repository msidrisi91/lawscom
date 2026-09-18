from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import DailyLaw
from app.schemas.schemas import DailyLawResponse

router = APIRouter(prefix="/daily-law", tags=["Daily Legal Awareness"])

@router.get("/today", response_model=DailyLawResponse)
def get_today_law(db: Session = Depends(get_db)):
    """
    Returns today's daily law flashcard and micro-quiz for citizen learning.
    """
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    law = db.query(DailyLaw).filter(DailyLaw.date == today_str).first()
    if not law:
        # Get latest
        law = db.query(DailyLaw).order_by(DailyLaw.created_at.desc()).first()
        
    if not law:
        raise HTTPException(status_code=404, detail="No daily law available today")
    return law
