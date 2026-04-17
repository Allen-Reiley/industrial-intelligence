# backend/app/models/company.py
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime
import sqlalchemy as sa

# Use TYPE_CHECKING to avoid circular imports between models
if TYPE_CHECKING:
    from app.models.visit import Visit
    from app.models.department import Department
    from app.models.waitlist import WaitlistLead

class Company(SQLModel, table=True):
    """The Jurisdictive Entity record. The anchor for all B2B intelligence."""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # --- MULTI-TENANCY ---
    # Silos companies to specific agency owners/accounts
    client_id: str = Field(index=True) 
    
    # --- FIRMOGRAPHICS (National Expansion v3.5) ---
    name: str = Field(index=True) 
    domain: str = Field(index=True)
    industry: Optional[str] = None
    hq_phone: Optional[str] = None
    
    # Geographic distribution for South African Economic Zones
    city: Optional[str] = None
    region: Optional[str] = None # e.g., "Gauteng", "Western Cape", "KZN"
    
    # Identification logic
    is_b2b: bool = Field(default=True, index=True)
    
    # --- QUARANTINE & AUDIT (Rigid Logic v3.5) ---
    # set to True when a lead is captured or a corporate IP is verified
    is_verified: bool = Field(default=False, index=True)
    
    # --- AGGREGATED INTELLIGENCE ---
    total_visits: int = Field(default=1)
    unique_visitors_count: int = Field(default=1)
    
    # Clinical "Corporate Intent" Summary (Synthesized by DeepSeek)
    intent_summary: Optional[str] = None 
    
    # --- RELATIONS ---
    # Using string literals for lazy-loading to prevent circular import crashes
    visits: List["Visit"] = Relationship(back_populates="company")
    departments: List["Department"] = Relationship(back_populates="company")
    leads: List["WaitlistLead"] = Relationship(back_populates="company")

    # --- TIMEKEEPING ---
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=sa.func.now())
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), 
            server_default=sa.func.now(), 
            onupdate=sa.func.now()
        )
    )