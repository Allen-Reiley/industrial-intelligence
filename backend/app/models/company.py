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
    client_id: str = Field(index=True) # Silos companies to specific agency owners
    
    # --- FIRMOGRAPHICS (Public Entity Data) ---
    name: str = Field(index=True) # Removed unique=True; different clients might track same company
    domain: str = Field(index=True)
    industry: Optional[str] = None
    hq_phone: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None # e.g., "Gauteng"
    is_b2b: bool = Field(default=True, index=True)
    
    # --- QUARANTINE & AUDIT (Rigid Logic v3.0) ---
    is_verified: bool = Field(default=False, index=True)
    
    # --- AGGREGATED INTELLIGENCE ---
    total_visits: int = Field(default=1)
    unique_visitors_count: int = Field(default=1)
    
    # DeepSeek Generated "Corporate Intent" Summary
    intent_summary: Optional[str] = None 
    
    # --- RELATIONS ---
    # String literals allow SQLAlchemy to resolve names after all models load
    visits: List["Visit"] = Relationship(back_populates="company")
    departments: List["Department"] = Relationship(back_populates="company")
    leads: List["WaitlistLead"] = Relationship(back_populates="company")

    # --- TIMEKEEPING ---
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=sa.func.now())
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now())
    )