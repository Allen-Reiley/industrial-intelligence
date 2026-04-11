from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlmodel import SQLModel, Field, Column, DateTime, Relationship, JSON
import sqlalchemy as sa

class VisitBase(SQLModel):
    client_id: str = Field(index=True)
    aura_id: str = Field(index=True)
    url: str
    referrer: Optional[str] = "direct"
    timestamp: Optional[str] = None 
    # Base attribution fields for all tracking schemas
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_content: Optional[str] = None
    utm_term: Optional[str] = None

class Visit(SQLModel, table=True): 
    """The granular ledger of every touchpoint. Multiple visits map to one Company."""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # --- RELATIONS ---
    company_id: Optional[int] = Field(default=None, foreign_key="company.id", index=True)
    
    # --- IDENTITY & CONSENT ---
    client_id: str = Field(index=True)
    aura_id: str = Field(index=True) # Browser fingerprint
    ip_address: Optional[str] = Field(default="0.0.0.0", index=True)
    is_consented: bool = Field(default=False, index=True) 
    
    # --- QUARANTINE & AUDIT (Rigid Logic v3.0) ---
    # verifying: Currently under 24hr review
    # verified: Confirmed industrial/lead match
    # unverified: Marked for Janitor deletion
    verification_status: str = Field(default="verifying", index=True)
    last_audit_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    
    # --- FORENSIC SIGNATURES (Tracker v2.4.0+) ---
    canvas_hash: Optional[str] = None
    webgl_renderer: Optional[str] = None
    clock_drift: Optional[float] = None
    
    # --- NETWORK INTELLIGENCE (For Buying Committee Detection) ---
    effective_connection_type: Optional[str] = Field(default=None, description="e.g., 4g, fiber")
    downlink_speed: Optional[float] = Field(default=None, description="Mbps")
    rtt: Optional[int] = Field(default=None, description="Round-trip time in ms")
    
    # --- BEHAVIORAL & INTENT CLUSTERING ---
    url: str
    referrer: Optional[str] = "direct"
    screen_resolution: Optional[str] = None
    duration: int = Field(default=0)
    
    # Captures specific high-intent clicks (Pricing, Audit, Features)
    intent_cluster: Optional[str] = Field(default=None, index=True)
    intent_metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # --- ATTRIBUTION (Industrial Grade) ---
    utm_source: Optional[str] = Field(default=None, index=True)
    utm_medium: Optional[str] = Field(default=None, index=True)
    utm_campaign: Optional[str] = Field(default=None, index=True)
    utm_content: Optional[str] = None
    utm_term: Optional[str] = None

    # --- TIMESTAMPS ---
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )

    company: Optional["Company"] = Relationship(back_populates="visits")

class VisitCreate(VisitBase):
    """Schema for initial ingestion via track_entry"""
    screen_resolution: Optional[str] = None
    effective_connection_type: Optional[str] = None
    downlink_speed: Optional[float] = None
    rtt: Optional[int] = None

class PageViewCreate(SQLModel):
    client_id: str
    url: str
    duration: int
    event_type: str = "exit"
    intent_cluster: Optional[str] = None