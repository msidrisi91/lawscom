from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.core.database import get_db
from app.models.models import SummaryCard
from app.schemas.schemas import SummaryCardResponse

router = APIRouter(prefix="/feed", tags=["Consumer Feed"])

@router.get("", response_model=List[SummaryCardResponse])
def get_card_feed(
    court: Optional[str] = Query(None, description="Filter by court name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search terms"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Returns published 60-word micro-cards for the consumer vertical swipe feed.
    Strictly filters only PUBLISHED cards.
    """
    query = db.query(SummaryCard).filter(SummaryCard.status == "PUBLISHED")
    
    if court:
        query = query.filter(SummaryCard.court_name.ilike(f"%{court}%"))
    if category:
        query = query.filter(SummaryCard.category.ilike(f"%{category}%"))
    if search:
        search_filter = or_(
            SummaryCard.headline.ilike(f"%{search}%"),
            SummaryCard.advocate_summary.ilike(f"%{search}%"),
            SummaryCard.citizen_summary.ilike(f"%{search}%"),
            SummaryCard.citation.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
        
    cards = query.order_by(desc(SummaryCard.published_at)).offset((page - 1) * limit).limit(limit).all()
    return cards

@router.get("/{card_id}", response_model=SummaryCardResponse)
def get_card_detail(card_id: str, db: Session = Depends(get_db)):
    card = db.query(SummaryCard).filter(SummaryCard.id == card_id, SummaryCard.status == "PUBLISHED").first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    card.views_count += 1
    db.commit()
    return card

@router.post("/{card_id}/share")
def record_card_share(card_id: str, db: Session = Depends(get_db)):
    card = db.query(SummaryCard).filter(SummaryCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    card.shares_count += 1
    db.commit()
    return {"status": "success", "shares": card.shares_count}
