# backend/app/models/waitlist_lead.py
from typing import Optional, TYPE_CHECKING
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.company import Company

class WaitlistLead(SQLModel, table=True):
    __tablename__ = "waitlist_lead"
    
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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    company: Optional["Company"] = Relationship(back_populates="leads")
