# backend/app/models/company.py
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime

if TYPE_CHECKING:
    from app.models.department import Department
    from app.models.visit import Visit
    from app.models.prospect import Prospect

class Company(SQLModel, table=True):
    __tablename__ = "company"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    domain: str = Field(index=True)
    company_name: str = Field(index=True)
    industry: Optional[str] = Field(default=None, index=True)
    parent_company_id: Optional[UUID] = Field(default=None, foreign_key="company.id", nullable=True)
    is_headquarters: bool = Field(default=False)
    intent_summary: Optional[str] = Field(default=None, nullable=True)
    last_enrichment_attempt: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    cipc_verified: bool = Field(default=False)
    cipc_registration_number: Optional[str] = Field(default=None, nullable=True)
    total_visits: int = Field(default=0, index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )

    # Relationships
    departments: List["Department"] = Relationship(back_populates="company")
    visits: List["Visit"] = Relationship(back_populates="company")
    prospects: List["Prospect"] = Relationship(back_populates="company")