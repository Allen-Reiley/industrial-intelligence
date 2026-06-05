# backend/app/models/department.py
from typing import Optional, TYPE_CHECKING
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.company import Company

class Department(SQLModel, table=True):
    __tablename__ = "department"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    company_id: UUID = Field(foreign_key="company.id", index=True)
    contact_name: str
    role_title: str = Field(index=True)
    email: str
    phone: Optional[str] = Field(default=None)
    linkedin_url: Optional[str] = Field(default=None)
    priority_score: int = Field(default=1, ge=1, le=5, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    company: Optional["Company"] = Relationship(back_populates="departments")