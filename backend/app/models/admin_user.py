# backend/app/models/admin_user.py
from datetime import datetime, timezone
from uuid import UUID
from uuid6 import uuid7
from sqlmodel import SQLModel, Field, Column, DateTime

class AdminUser(SQLModel, table=True):
    __tablename__ = "admin_user"
    
    id: UUID = Field(default_factory=uuid7, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
