from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Column, DateTime, String
from typing import Optional
import sqlalchemy as sa

# Industrial-grade UTC timestamp factory
def get_utc_now():
    return datetime.now(timezone.utc)

class WaitlistLead(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Phase 01: Identity
    name: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    email: str = Field(index=True, unique=True)
    company: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    industry: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    
    # Phase 02: Audit
    website: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    traffic: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    avg_price: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    crm: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    
    # Automation Tracking
    welcome_email_sent: bool = Field(default=False)
    
    # Metadata & Timekeeping 
    # default_factory ensures Python generates the time DURING the insert.
    created_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(
            DateTime(timezone=True), 
            nullable=False
        )
    )
    updated_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(
            DateTime(timezone=True), 
            onupdate=get_utc_now,
            nullable=False
        )
    )