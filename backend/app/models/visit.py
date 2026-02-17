from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Column, DateTime
import sqlalchemy as sa

class VisitBase(SQLModel):
    client_id: str = Field(index=True)
    url: str
    referrer: Optional[str] = "direct"
    timestamp: Optional[datetime] = None

class VisitCreate(VisitBase):
    """Schema for the incoming Entry Ping from tracker.js"""
    screen_resolution: Optional[str] = None

class Visit(VisitBase, table=True):
    """The actual database table for visits"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # User Identification
    ip_address: str = Field(index=True)
    
    # Business Intelligence (The "Secret Sauce")
    company_name: Optional[str] = Field(default=None, index=True)
    domain: Optional[str] = None
    is_b2b: bool = Field(default=False)
    industry: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    
    
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