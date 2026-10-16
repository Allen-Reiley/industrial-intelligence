# backend/app/models/event.py
from typing import Optional, Dict, Any, TYPE_CHECKING
from datetime import datetime, timezone
from uuid import UUID
from uuid6 import uuid7
from sqlmodel import SQLModel, Field, Relationship, Column, DateTime
from sqlalchemy.dialects.postgresql import JSONB
import sqlalchemy as sa

if TYPE_CHECKING:
    from app.models.visit import Visit

class Event(SQLModel, table=True):
    __tablename__ = "event"
    
    id: UUID = Field(default_factory=uuid7, primary_key=True)
    client_id: UUID = Field(foreign_key="client.id", ondelete="CASCADE", index=True)
    visit_id: UUID = Field(foreign_key="visit.id", ondelete="CASCADE", index=True)
    event_type: str = Field(index=True)
    properties: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False, index=True)
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("created_at", DateTime(timezone=True), nullable=False)
    )

    visit: Optional["Visit"] = Relationship(back_populates="events")
