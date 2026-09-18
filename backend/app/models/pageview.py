# backend/app/models/pageview.py
from typing import Optional, TYPE_CHECKING
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime

if TYPE_CHECKING:
    from app.models.visit import Visit

class PageView(SQLModel, table=True):
    __tablename__ = "page_view"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    client_id: UUID = Field(foreign_key="client.id", ondelete="CASCADE", index=True)
    visit_id: UUID = Field(foreign_key="visit.id", ondelete="CASCADE", index=True)
    url_path: str = Field(index=True)
    referrer: Optional[str] = Field(default=None)
    duration: int = Field(default=0)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )

    visit: Optional["Visit"] = Relationship(back_populates="page_views")