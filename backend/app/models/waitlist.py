from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Column, DateTime, String, Relationship
from typing import Optional
import sqlalchemy as sa

# Industrial-grade UTC timestamp factory
def get_utc_now():
    return datetime.now(timezone.utc)

class WaitlistLead(SQLModel, table=True):
    """
    Individuals who have provided explicit Personal Consent via form submission.
    Linked to a parent Company entity as a Secondary Entity.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # --- ENTITY LINKAGE ---
    # The 'Juristic Anchor' connecting the person to the jurisdictional body
    company_id: Optional[int] = Field(default=None, foreign_key="company.id", index=True)
    
    # --- IDENTITY (POPIA/PAIA Consented) ---
    name: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    email: str = Field(index=True, unique=True)
    
    # Captured raw string from form for fuzzy matching/validation
    company_name_raw: Optional[str] = Field(
        default=None, 
        sa_column=Column("company_name_raw", String, nullable=True)
    )
    industry: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    
    # --- B2B AUDIT & FIRMOGRAPHICS ---
    website: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    traffic: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    
    # UPDATED: Changed to String to accommodate dropdown ranges (e.g., "150k-500k")
    avg_price: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    
    crm: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    
    # --- PROMOTIONAL STITCHING ---
    # The forensic link used to upgrade anonymous visits to 'Consented'
    aura_id: Optional[str] = Field(default=None, index=True) 
    
    # --- AUTOMATION STATUS ---
    welcome_email_sent: bool = Field(default=False)
    
    # --- METADATA & TIMEKEEPING ---
    created_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column=Column(
            DateTime(timezone=True), 
            onupdate=get_utc_now, # Automatically updates on every save
            nullable=False
        )
    )

    # --- RELATIONSHIPS ---
    # Relationship with the Company model (back-populated from Company.leads)
    company: Optional["Company"] = Relationship(back_populates="leads")