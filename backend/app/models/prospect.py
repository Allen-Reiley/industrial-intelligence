# backend/app/models/prospect.py
from typing import Optional, TYPE_CHECKING
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime

if TYPE_CHECKING:
    from app.models.company import Company

class Prospect(SQLModel, table=True):
    __tablename__ = "prospect"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    client_id: UUID = Field(foreign_key="client.id", index=True)
    company_id: Optional[UUID] = Field(default=None, foreign_key="company.id", index=True, nullable=True)
    name: Optional[str] = Field(default=None)
    email: str = Field(index=True)
    phone_encrypted: Optional[str] = Field(default=None)
    company_name_raw: Optional[str] = Field(default=None)
    department: Optional[str] = Field(default=None)
    position: Optional[str] = Field(default=None)
    industry: Optional[str] = Field(default=None)
    website: Optional[str] = Field(default=None)
    traffic: Optional[str] = Field(default=None)
    avg_price: Optional[str] = Field(default=None)
    crm: Optional[str] = Field(default=None)
    aura_id: Optional[str] = Field(default=None, index=True)
    welcome_email_sent: bool = Field(default=False)
    status: str = Field(default="demo_requested", index=True)  # demo_requested, call_booked
    calendly_event_uuid: Optional[str] = Field(default=None, index=True, nullable=True)
    vsl_completion_percentage: Optional[int] = Field(default=None, nullable=True)
    vsl_completed_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    vsl_abandoned: Optional[bool] = Field(default=False, nullable=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )

    company: Optional["Company"] = Relationship(back_populates="prospects")
