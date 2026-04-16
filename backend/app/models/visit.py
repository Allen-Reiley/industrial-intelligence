# backend/app/models/visit.py
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlmodel import SQLModel, Field, Column, DateTime, Relationship, JSON
import sqlalchemy as sa

class VisitBase(SQLModel):
    """Shared fields between tracking schemas and the persistent database model."""
    client_id: str = Field(index=True)
    aura_id: str = Field(index=True)
    url: str
    referrer: Optional[str] = "direct"
    timestamp: Optional[str] = None 
    
    # Global attribution fields
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
    aura_id: str = Field(index=True) # Browser fingerprint/UID
    ip_address: Optional[str] = Field(default="0.0.0.0", index=True)
    is_consented: bool = Field(default=False, index=True) 
    
    # --- QUARANTINE & AUDIT (Rigid Logic v3.5) ---
    # Statuses: verifying, verified, noise, internal
    verification_status: str = Field(default="verifying", index=True)
    last_audit_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    
    # --- FORENSIC SIGNATURES (Aura.js v3.5.0) ---
    canvas_hash: Optional[str] = None
    webgl_renderer: Optional[str] = None
    clock_drift: Optional[float] = None
    
    # --- NETWORK INTELLIGENCE ---
    effective_connection_type: Optional[str] = Field(default=None)
    downlink_speed: Optional[float] = Field(default=None)
    rtt: Optional[int] = Field(default=None)
    
    # --- BEHAVIORAL & INTENT ---
    url: str
    referrer: Optional[str] = "direct"
    screen_resolution: Optional[str] = None
    duration: int = Field(default=0)
    capture_source: Optional[str] = Field(default=None, description="e.g., banner_warm_signal, authorized_blur")
    
    intent_cluster: Optional[str] = Field(default=None, index=True)
    intent_metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # --- ATTRIBUTION (Indexed for Lead Scoring) ---
    utm_source: Optional[str] = Field(default=None, index=True)
    utm_medium: Optional[str] = Field(default=None, index=True)
    utm_campaign: Optional[str] = Field(default=None, index=True)
    utm_content: Optional[str] = None
    utm_term: Optional[str] = None

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )

    company: Optional["Company"] = Relationship(back_populates="visits")

class VisitCreate(VisitBase):
    """Schema for initial ingestion via /track/entry"""
    screen_resolution: Optional[str] = None
    effective_connection_type: Optional[str] = None
    downlink_speed: Optional[float] = None
    rtt: Optional[int] = None

class PageViewCreate(SQLModel):
    """Schema for secondary tracking events like /track/exit and /track/event"""
    client_id: str
    aura_id: Optional[str] = None # Added Optional aura_id for session stitching
    url: str
    duration: Optional[int] = 0
    event_type: str = "exit"
    intent_cluster: Optional[str] = None
    signature: Optional[Dict[str, Any]] = None # For receiving forensic identity data