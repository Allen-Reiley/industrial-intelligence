from datetime import datetime
from sqlmodel import SQLModel, Field, Column, DateTime
from typing import Optional
import sqlalchemy as sa

class WaitlistLead(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Phase 01: Identity
    # Made Optional to prevent 500 errors if the frontend payload is partial
    name: Optional[str] = None
    email: str = Field(index=True, unique=True)
    company: Optional[str] = None
    industry: Optional[str] = None
    
    # Phase 02: Audit
    website: Optional[str] = None
    traffic: Optional[str] = None  # e.g., "1k-5k"
    avg_price: Optional[str] = None
    crm: Optional[str] = None
    
    # Automation Tracking
    welcome_email_sent: bool = Field(default=False)
    
    # Metadata & Timekeeping
    # Using sa_column ensures Postgres handles the timezone and "now" logic correctly
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), 
            server_default=sa.func.now(), 
            nullable=False
        )
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(
            DateTime(timezone=True), 
            onupdate=sa.func.now(),
            server_default=sa.func.now()
        )
    )