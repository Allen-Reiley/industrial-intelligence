# backend/app/models/calendar.py
from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Column, DateTime
from sqlalchemy import String, Boolean, ForeignKey

class CalendarEvent(SQLModel, table=True):
    __tablename__ = "calendar_event"

    id: str = Field(primary_key=True)
    title: str = Field(nullable=False)
    start_time: datetime = Field(
        sa_column=Column("start_time", DateTime(timezone=True), nullable=False)
    )
    end_time: Optional[datetime] = Field(
        default=None,
        sa_column=Column("end_time", DateTime(timezone=True), nullable=True)
    )
    all_day: bool = Field(default=False, nullable=False)
    category: str = Field(default="primary", nullable=False)  # primary, success, danger, warning, info
    user_id: str = Field(
        sa_column=Column("user_id", String, ForeignKey("user.id", ondelete="CASCADE"), index=True, nullable=False)
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("created_at", DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("updated_at", DateTime(timezone=True), nullable=False)
    )
