import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, Boolean, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Jurisdiction(Base):
    __tablename__ = "jurisdictions"
    
    id = Column(String(10), primary_key=True) # 'in', 'us', 'uk'
    name = Column(String(100), nullable=False)
    currency = Column(String(10), default="INR")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    courts = relationship("Court", back_populates="jurisdiction")

class Court(Base):
    __tablename__ = "courts"
    
    id = Column(String(50), primary_key=True) # 'sc_in', 'delhi_hc', 'bombay_hc'
    jurisdiction_id = Column(String(10), ForeignKey("jurisdictions.id"), nullable=False)
    name = Column(String(200), nullable=False)
    short_code = Column(String(20), nullable=False) # 'SC', 'DHC', 'BHC'
    level = Column(String(50), default="SUPREME") # 'SUPREME', 'HIGH_COURT', 'TRIBUNAL'
    website_url = Column(String(500), nullable=True)
    
    jurisdiction = relationship("Jurisdiction", back_populates="courts")
    cases = relationship("CaseDocument", back_populates="court")

class CaseDocument(Base):
    __tablename__ = "case_documents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    court_id = Column(String(50), ForeignKey("courts.id"), nullable=False)
    case_number = Column(String(100), nullable=False)
    title = Column(String(500), nullable=False)
    judgment_date = Column(String(20), nullable=False)
    bench = Column(String(300), nullable=True)
    disposition = Column(String(50), default="Allowed") # 'Allowed', 'Dismissed', 'Disposed', 'Remanded'
    pdf_url = Column(String(1000), nullable=True)
    raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    court = relationship("Court", back_populates="cases")
    card = relationship("SummaryCard", back_populates="case_document", uselist=False)

class Statute(Base):
    __tablename__ = "statutes"
    
    id = Column(String(50), primary_key=True) # 'BNS', 'BNSS', 'BSA', 'IPC', 'CrPC', 'CONST'
    act_name = Column(String(300), nullable=False)
    year = Column(Integer, nullable=False)
    short_code = Column(String(20), nullable=False)
    
    sections = relationship("StatuteSection", back_populates="statute")

class StatuteSection(Base):
    __tablename__ = "statute_sections"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    statute_id = Column(String(50), ForeignKey("statutes.id"), nullable=False)
    section_number = Column(String(50), nullable=False) # '103', '482', '21'
    title = Column(String(300), nullable=False)
    bare_act_text = Column(Text, nullable=False)
    layman_explanation = Column(Text, nullable=False)
    
    statute = relationship("Statute", back_populates="sections")

class SummaryCard(Base):
    __tablename__ = "summary_cards"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_document_id = Column(String(36), ForeignKey("case_documents.id"), nullable=True)
    court_name = Column(String(100), default="Supreme Court of India")
    category = Column(String(50), default="Criminal Law") # Criminal, Constitutional, Corporate, Taxation, Civil, Consumer
    
    headline = Column(String(300), nullable=False)
    
    # Dual-Mode Summaries
    advocate_summary = Column(Text, nullable=False) # <= 65 words dense legal ratio
    citizen_summary = Column(Text, nullable=False)  # <= 50 words plain English
    
    ratio_decidendi = Column(Text, nullable=True)
    holding = Column(String(100), default="Allowed")
    citation = Column(String(100), nullable=True) # e.g. '2026 INSC 412'
    bench = Column(String(250), nullable=True)
    
    # Statutory section pills linked on card (JSON list of objects: [{"act": "BNS", "section": "103"}])
    related_sections = Column(JSON, default=list)
    
    # Publishing & AI Metadata
    status = Column(String(20), default="PUBLISHED") # 'DRAFT', 'IN_REVIEW', 'PUBLISHED', 'REJECTED'
    publish_mode = Column(String(20), default="HITL") # 'AUTOMATED', 'HITL', 'MANUAL'
    confidence_score = Column(Float, default=0.96)
    flag_reason = Column(String(300), nullable=True)
    
    audio_url = Column(String(500), nullable=True)
    pdf_url = Column(String(1000), nullable=True)
    is_breaking = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    published_at = Column(DateTime, default=datetime.utcnow)
    
    case_document = relationship("CaseDocument", back_populates="card")

class DailyLaw(Base):
    __tablename__ = "daily_laws"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    date = Column(String(15), nullable=False) # '2026-09-19'
    topic = Column(String(100), nullable=False) # 'Tenant Rights', 'Consumer Protection', 'Police Arrest Rights'
    headline = Column(String(300), nullable=False)
    explanation = Column(Text, nullable=False) # 60 words plain explanation
    practical_tip = Column(String(300), nullable=False)
    statute_reference = Column(String(100), nullable=True) # 'BNSS Section 47'
    quiz_question = Column(String(300), nullable=True)
    quiz_options = Column(JSON, default=list)
    correct_option_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class PushSubscription(Base):
    __tablename__ = "push_subscriptions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    endpoint = Column(String(1000), unique=True, nullable=False)
    p256dh = Column(String(255), nullable=True)
    auth = Column(String(255), nullable=True)
    user_role = Column(String(50), default="all") # 'advocate', 'citizen', 'all'
    topics = Column(JSON, default=list) # ['criminal', 'corporate', 'breaking']
    created_at = Column(DateTime, default=datetime.utcnow)

class EngineConfig(Base):
    __tablename__ = "engine_config"
    
    id = Column(Integer, primary_key=True, default=1)
    auto_publish_enabled = Column(Boolean, default=True)
    confidence_threshold = Column(Float, default=0.95)
    last_scraper_run = Column(DateTime, default=datetime.utcnow)
    scraper_status = Column(JSON, default=dict)

class BroadcastLog(Base):
    __tablename__ = "broadcast_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(300), nullable=False)
    body = Column(Text, nullable=False)
    recipient_count = Column(Integer, default=0)
    target_role = Column(String(50), default="all", index=True)
    is_breaking = Column(Boolean, default=True)
    card_id = Column(String(36), ForeignKey("summary_cards.id"), nullable=True)
    status = Column(String(50), default="SENT")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

