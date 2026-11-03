# backend/app/models/task.py
from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Column, DateTime
from sqlalchemy import String, ForeignKey

class Task(SQLModel, table=True):
    __tablename__ = "task"

    id: str = Field(primary_key=True)
    title: str = Field(nullable=False)
    description: Optional[str] = Field(default=None, nullable=True)
    status: str = Field(default="todo", index=True, nullable=False)  # todo, in_progress, done
    priority: str = Field(default="medium", nullable=False)  # low, medium, high, urgent
    due_date: Optional[datetime] = Field(
        default=None,
        sa_column=Column("due_date", DateTime(timezone=True), nullable=True)
    )
    assigned_to_id: Optional[str] = Field(
        default=None,
        sa_column=Column("assigned_to_id", String, ForeignKey("user.id", ondelete="SET NULL"), index=True, nullable=True)
    )
    created_by_id: str = Field(
        sa_column=Column("created_by_id", String, ForeignKey("user.id", ondelete="CASCADE"), index=True, nullable=False)
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("created_at", DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("updated_at", DateTime(timezone=True), nullable=False)
    )
