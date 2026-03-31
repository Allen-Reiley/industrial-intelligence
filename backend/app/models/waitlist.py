from datetime import datetime
from sqlmodel import SQLModel, Field, Column, DateTime
from typing import Optional
import sqlalchemy as sa

class WaitlistLead(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Phase 01: Identity
    name: Optional[str] = None
    email: str = Field(index=True, unique=True)
    company: Optional[str] = None
    industry: Optional[str] = None
    
    # Phase 02: Audit
    website: Optional[str] = None
    traffic: Optional[str] = None 
    avg_price: Optional[str] = None
    crm: Optional[str] = None
    
    # Automation Tracking
    welcome_email_sent: bool = Field(default=False)
    
    # Metadata & Timekeeping
    # FIX: Set to Optional[datetime] = Field(default=None) 
    # This forces SQLModel to omit these fields from the INSERT statement,
    # letting Postgres handle the server_default.
    created_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True), 
            server_default=sa.func.now(), 
            nullable=False
        )
    )
    updated_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True), 
            onupdate=sa.func.now(),
            server_default=sa.func.now(),
            nullable=False
        )
    )