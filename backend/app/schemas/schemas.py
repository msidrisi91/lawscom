from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class RelatedSection(BaseModel):
    act: str
    section: str
    title: Optional[str] = None

# Consumer Feed Schemas
class SummaryCardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    court_name: str
    category: str
    headline: str
    advocate_summary: str
    citizen_summary: str
    ratio_decidendi: Optional[str] = None
    holding: Optional[str] = None
    citation: Optional[str] = None
    bench: Optional[str] = None
    related_sections: List[Dict[str, Any]] = []
    status: str
    confidence_score: float
    audio_url: Optional[str] = None
    pdf_url: Optional[str] = None
    is_breaking: bool
    views_count: int
    shares_count: int
    published_at: Optional[datetime] = None

class FeedFilterParams(BaseModel):
    court: Optional[str] = None
    category: Optional[str] = None
    search: Optional[str] = None
    page: int = 1
    page_size: int = 20

# Bare Act Drawer Schema
class StatuteSectionResponse(BaseModel):
    act_name: str
    short_code: str
    section_number: str
    title: str
    bare_act_text: str
    layman_explanation: str

# Daily Law Schema
class DailyLawResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    date: str
    topic: str
    headline: str
    explanation: str
    practical_tip: str
    statute_reference: Optional[str] = None
    quiz_question: Optional[str] = None
    quiz_options: List[str] = []
    correct_option_index: int

# Push Notification Schemas
class PushSubscribeRequest(BaseModel):
    endpoint: str
    p256dh: Optional[str] = None
    auth: Optional[str] = None
    user_role: str = "all" # 'advocate', 'citizen', 'all'
    topics: List[str] = ["breaking"]

class PushBroadcastRequest(BaseModel):
    title: str
    body: str # Max 60 words for notification preview
    card_id: Optional[str] = None
    target_role: str = "all" # 'advocate', 'citizen', 'all'
    is_breaking: bool = True

# Admin HITL Triage Schemas
class TriageCardItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    case_number: Optional[str] = None
    court_name: str
    category: str
    headline: str
    advocate_summary: str
    citizen_summary: str
    ratio_decidendi: Optional[str] = None
    holding: Optional[str] = None
    citation: Optional[str] = None
    bench: Optional[str] = None
    related_sections: List[Dict[str, Any]] = []
    confidence_score: float
    publish_mode: str
    status: str
    flag_reason: Optional[str] = None
    created_at: datetime

class TriageActionRequest(BaseModel):
    action: str # 'APPROVE', 'REJECT', 'UPDATE_AND_APPROVE'
    headline: Optional[str] = None
    advocate_summary: Optional[str] = None
    citizen_summary: Optional[str] = None
    broadcast_push: bool = False

class ManualCardCreateRequest(BaseModel):
    court_name: str = "Supreme Court of India"
    category: str = "Criminal Law"
    headline: str
    advocate_summary: str
    citizen_summary: str
    ratio_decidendi: Optional[str] = None
    holding: str = "Allowed"
    citation: Optional[str] = None
    bench: Optional[str] = None
    related_sections: List[Dict[str, str]] = []
    is_breaking: bool = False
    broadcast_push: bool = False

class AIAssistDraftRequest(BaseModel):
    raw_text: str
    court_name: str = "Supreme Court of India"
    category: Optional[str] = None

class EngineConfigUpdate(BaseModel):
    auto_publish_enabled: Optional[bool] = None
    confidence_threshold: Optional[float] = None
