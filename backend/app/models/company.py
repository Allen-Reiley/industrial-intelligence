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
    
    # --- FIRMOGRAPHICS (Public Entity Data) ---
    name: str = Field(index=True, unique=True)
    domain: str = Field(index=True, unique=True)
    industry: Optional[str] = None
    hq_phone: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None # e.g., "Gauteng"
    is_b2b: bool = Field(default=True, index=True)
    
    # --- AGGREGATED INTELLIGENCE ---
    total_visits: int = Field(default=1)
    unique_visitors_count: int = Field(default=1) # Count of unique aura_ids
    
    # DeepSeek Generated "Corporate Intent" Summary
    intent_summary: Optional[str] = None 
    
    # --- RELATIONS ---
    # Unified naming to match back_populates in WaitlistLead and Visit
    visits: List["Visit"] = Relationship(back_populates="company")
    departments: List["Department"] = Relationship(back_populates="company")
    
    # UPDATED: Renamed from 'visitors' to 'leads' to fix the 500 Promotion Failure
    leads: List["WaitlistLead"] = Relationship(back_populates="company")

    # --- TIMEKEEPING ---
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=sa.func.now())
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now())
    )