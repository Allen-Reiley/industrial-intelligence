# backend/app/models/waitlist.py
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime, String
import sqlalchemy as sa

# Forward reference for Type Checking to avoid circular imports
if TYPE_CHECKING:
    from app.models.company import Company

def get_utc_now():
    """Industrial-grade UTC timestamp factory for POPIA compliance."""
    return datetime.now(timezone.utc)

class WaitlistLead(SQLModel, table=True):
    """
    Individuals who have provided explicit Personal Consent via form submission.
    Linked to a parent Company entity as a Secondary Entity.
    """
    __tablename__ = "waitlistlead"

    id: Optional[int] = Field(default=None, primary_key=True)
    
    # --- MULTI-TENANCY ---
    # This field now exists in the DB after the migration above
    client_id: str = Field(index=True, description="Silos waitlist to the agency owner")

    # --- ENTITY LINKAGE ---
    company_id: Optional[int] = Field(default=None, foreign_key="company.id", index=True)
    
    # --- IDENTITY (POPIA/PAIA Consented) ---
    name: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    email: str = Field(index=True) 
    
    company_name_raw: Optional[str] = Field(
        default=None, 
        sa_column=Column("company_name_raw", String, nullable=True)
    )
    
    industry: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    
    # --- B2B AUDIT & FIRMOGRAPHICS ---
    website: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    traffic: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    avg_price: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    crm: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    
    # --- PROMOTIONAL STITCHING ---
    aura_id: Optional[str] = Field(default=None, index=True) 
    
    # --- AUTOMATION STATUS ---
    welcome_email_sent: bool = Field(default=False)
    
    # --- METADATA & TIMEKEEPING ---
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), 
            nullable=False, 
            server_default=sa.func.now()
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), 
            nullable=False, 
            server_default=sa.func.now(),
            onupdate=sa.func.now()
        )
    )

    # --- RELATIONSHIPS ---
    company: Optional["Company"] = Relationship(back_populates="leads")