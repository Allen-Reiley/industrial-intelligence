from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Column, DateTime
import sqlalchemy as sa

class VisitBase(SQLModel):
    client_id: str = Field(index=True)
    url: str
    referrer: Optional[str] = "direct"
    # Change: Store as string or Optional[datetime] with default
    # This prevents 422 errors if the browser's ISO string is slightly off
    timestamp: Optional[str] = None 

class VisitCreate(VisitBase):
    """Schema for the incoming Entry Ping from tracker.js"""
    screen_resolution: Optional[str] = None

class Visit(SQLModel, table=True): # Changed to inherit directly for cleaner field mapping
    """The actual database table for visits"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Metadata from Payload
    client_id: str = Field(index=True)
    url: str
    referrer: Optional[str] = "direct"
    screen_resolution: Optional[str] = None
    
    # User Identification (Captured from Request Header)
    ip_address: Optional[str] = Field(default="0.0.0.0", index=True)
    
    # Business Intelligence
    company_name: Optional[str] = Field(default="Unknown", index=True)
    domain: Optional[str] = None
    is_b2b: bool = Field(default=False)
    industry: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    
    # New: Add these fields to match your track.py logic
    hq_phone: Optional[str] = None
    corp_emails: Optional[str] = None
    
    # Behavioral Metrics
    duration: int = Field(default=0)
    
    # Automation
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), 
            server_default=sa.func.now(), 
            nullable=False
        )
    )

class PageViewCreate(SQLModel):
    """Schema for the incoming Exit Ping from tracker.js"""
    client_id: str
    url: str
    duration: int
    event_type: str = "exit"