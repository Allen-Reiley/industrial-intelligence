# backend/app/models/visit.py
from enum import Enum
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime
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
    client_id: UUID = Field(foreign_key="client.id", index=True)
    company_id: Optional[UUID] = Field(default=None, foreign_key="company.id", index=True, nullable=True)
    aura_id: str = Field(index=True)
    ip_address: str = Field(index=True)
    connection_type: str = Field(default="corporate")
    is_b2b: bool = Field(default=True, index=True)
    high_intent: bool = Field(default=False, index=True)
    verification_status: VerificationStatus = Field(default=VerificationStatus.VERIFYING, index=True)
    is_consented: bool = Field(default=False, index=True)
    email: Optional[str] = Field(default=None, index=True, nullable=True)
    visitor_name: Optional[str] = Field(default=None, nullable=True)
    canvas_hash: Optional[str] = Field(default=None, nullable=True)
    webgl_renderer: Optional[str] = Field(default=None, nullable=True)
    clock_drift: Optional[str] = Field(default=None, nullable=True)
    effective_connection_type: Optional[str] = Field(default=None, nullable=True)
    downlink_speed: Optional[float] = Field(default=None, nullable=True)
    rtt: Optional[int] = Field(default=None, nullable=True)
    fingerprint_hash: Optional[str] = Field(default=None, index=True, nullable=True)
    capture_source: Optional[str] = Field(default="banner", nullable=True)
    duration: int = Field(default=0)
    vsl_completion_percentage: Optional[int] = Field(default=None, nullable=True)
    vsl_completed_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    vsl_abandoned: Optional[bool] = Field(default=False, nullable=True)
    intent_cluster: Optional[str] = Field(default=None, nullable=True, index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )

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
    url: Optional[str] = None
    duration: Optional[int] = 0
    event_type: str = "exit"
    intent_cluster: Optional[str] = None
    signature: Optional[Dict[str, Any]] = None
    has_downloaded_asset: Optional[bool] = False
    properties: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

from pydantic import model_validator

class EventCreate(BaseModel):
    client_id: UUID
    event_name: str
    aura_id: Optional[str] = None
    url: Optional[str] = None
    duration: Optional[int] = 0
    event_type: Optional[str] = None
    intent_cluster: Optional[str] = None
    timestamp: Optional[datetime] = None
    properties: Dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="before")
    @classmethod
    def fallback_event_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "event_name" not in data and "event_type" in data:
                data["event_name"] = data["event_type"]
            elif "event_type" not in data and "event_name" in data:
                data["event_type"] = data["event_name"]
        return data