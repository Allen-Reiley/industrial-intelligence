from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Column, DateTime, Relationship
import sqlalchemy as sa

class VisitBase(SQLModel):
    client_id: str = Field(index=True)
    aura_id: str = Field(index=True)
    url: str
    referrer: Optional[str] = "direct"
    timestamp: Optional[str] = None 

class Visit(SQLModel, table=True): 
    """The granular ledger of every touchpoint. Multiple visits map to one Company."""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # --- RELATIONS ---
    # Links to the Jurisdictive Entity (The Company)
    company_id: Optional[int] = Field(default=None, foreign_key="company.id", index=True)
    
    # --- IDENTITY & CONSENT ---
    client_id: str = Field(index=True)
    aura_id: str = Field(index=True) # Browser fingerprint
    ip_address: Optional[str] = Field(default="0.0.0.0", index=True)
    
    # POPIA Gate: True if Banner accepted, False if anonymous technical data only
    is_consented: bool = Field(default=False, index=True) 
    
    # --- FORENSIC SIGNATURES ---
    canvas_hash: Optional[str] = None
    clock_drift: Optional[float] = None
    font_list: Optional[str] = None
    webgl_renderer: Optional[str] = None
    
    # --- BEHAVIORAL DATA ---
    url: str
    referrer: Optional[str] = "direct"
    screen_resolution: Optional[str] = None
    duration: int = Field(default=0) # Seconds spent on page
    
    # --- TIMESTAMPS ---
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )

    # Relationship back to the parent company
    company: Optional["Company"] = Relationship(back_populates="visits")

class VisitCreate(VisitBase):
    screen_resolution: Optional[str] = None

class PageViewCreate(SQLModel):
    client_id: str
    url: str
    duration: int
    event_type: str = "exit"