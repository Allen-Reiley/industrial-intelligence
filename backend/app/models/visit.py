# backend/app/models/visit.py
from enum import Enum
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship
from pydantic import BaseModel

if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.pageview import PageView

class VerificationStatus(str, Enum):
    VERIFYING = "verifying"
    VERIFIED = "verified"
    ANONYMIZED_CORPORATE = "anonymized_corporate"

class Visit(SQLModel, table=True):
    __tablename__ = "visit"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    client_id: UUID = Field(index=True)
    company_id: Optional[UUID] = Field(default=None, foreign_key="company.id", index=True, nullable=True)
    aura_id: str = Field(index=True)
    ip_address: str = Field(index=True)
    connection_type: str = Field(default="corporate")
    is_b2b: bool = Field(default=True, index=True)
    high_intent: bool = Field(default=False, index=True)
    verification_status: VerificationStatus = Field(default=VerificationStatus.VERIFYING, index=True)
    is_consented: bool = Field(default=False, index=True)
    fingerprint_hash: Optional[str] = Field(default=None, index=True, nullable=True)
    duration: int = Field(default=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    company: Optional["Company"] = Relationship(back_populates="visits")
    page_views: List["PageView"] = Relationship(back_populates="visit")

class VisitCreate(BaseModel):
    client_id: UUID
    aura_id: str
    url: str
    referrer: Optional[str] = "direct"
    screen_resolution: Optional[str] = None
    effective_connection_type: Optional[str] = None
    downlink_speed: Optional[float] = None
    rtt: Optional[int] = None

class PageViewCreate(BaseModel):
    client_id: UUID
    aura_id: Optional[str] = None
    url: str
    duration: Optional[int] = 0
    event_type: str = "exit"
    intent_cluster: Optional[str] = None
    signature: Optional[Dict[str, Any]] = None