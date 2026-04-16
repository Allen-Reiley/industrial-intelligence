# backend/app/models/lead.py
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Column, DateTime
import sqlalchemy as sa

class Lead(SQLModel, table=True):
    """
    The High-Intent Ledger. 
    A Lead is a verified connection between a Visitor (Aura) and a Juristic Entity (Company).
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # --- MULTI-TENANCY ---
    client_id: str = Field(index=True) # The Agency Owner

    # --- RELATIONS ---
    company_id: Optional[int] = Field(default=None, foreign_key="company.id", index=True)
    aura_id: str = Field(index=True) # Matches the visitor's forensic ID

    # --- AGGREGATED INTELLIGENCE ---
    email: Optional[str] = Field(default=None, index=True)
    company_name: str = Field(index=True)
    domain: Optional[str] = None
    industry: Optional[str] = None
    
    # Source categorization (e.g., "Waitlist", "High-Intent Visit", "Form Blur")
    lead_source: str = Field(default="visit_match", index=True)
    
    # --- STATUS & SCORING ---
    confidence_score: float = Field(default=0.0)
    is_exported_to_airtable: bool = Field(default=False)
    
    # --- TIMEKEEPING ---
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    last_active_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now())
    )