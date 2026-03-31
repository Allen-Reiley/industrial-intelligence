from datetime import datetime
from sqlmodel import SQLModel, Field, Column, DateTime, String
from typing import Optional
import sqlalchemy as sa

class WaitlistLead(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Phase 01: Identity
    name: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    email: str = Field(index=True, unique=True)
    company: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    industry: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    
    # Phase 02: Audit
    # Explicitly allowing NULL at the database level to prevent 500 errors
    website: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    traffic: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    avg_price: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    crm: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    
    # Automation Tracking
    welcome_email_sent: bool = Field(default=False)
    
    # Metadata & Timekeeping
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