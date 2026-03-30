from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Column, DateTime
import sqlalchemy as sa

class VisitBase(SQLModel):
    client_id: str = Field(index=True)
    url: str
    referrer: Optional[str] = "direct"
    timestamp: Optional[str] = None 

class VisitCreate(VisitBase):
    """Schema for the incoming Entry Ping from tracker.js"""
    screen_resolution: Optional[str] = None

class Visit(SQLModel, table=True): 
    """The actual database table for visits and lead intelligence"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # --- BASIC METADATA ---
    client_id: str = Field(index=True)
    aura_id: Optional[str] = Field(default=None, index=True) # The unique browser fingerprint ID
    url: str
    referrer: Optional[str] = "direct"
    screen_resolution: Optional[str] = None
    ip_address: Optional[str] = Field(default="0.0.0.0", index=True)
    
    # --- FORENSIC IDENTITY (STITCHING) ---
    canvas_hash: Optional[str] = None
    clock_drift: Optional[float] = None
    font_list: Optional[str] = None
    webgl_renderer: Optional[str] = None
    
    # --- B2B FIRMOGRAPHICS (DE-ANONYMIZATION) ---
    company_name: Optional[str] = Field(default="Unknown", index=True)
    domain: Optional[str] = None
    is_b2b: bool = Field(default=False)
    industry: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    hq_phone: Optional[str] = None
    corp_emails: Optional[str] = None
    
    # --- WAITLIST & QUALIFICATION (CONVERTED LEADS) ---
    email: Optional[str] = Field(default=None, index=True) # Work email from form
    name: Optional[str] = None # Contact name
    website: Optional[str] = None # Their company website
    traffic: Optional[str] = None # Monthly traffic range
    avg_price: Optional[str] = None # Product price range
    crm: Optional[str] = None # Current CRM used
    is_waitlist: bool = Field(default=False, index=True)
    
    # --- BEHAVIORAL METRICS ---
    duration: int = Field(default=0)
    
    # --- AUTOMATION ---
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime(timezone=True), onupdate=sa.func.now())
    )
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