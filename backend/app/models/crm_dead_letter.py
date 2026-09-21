# backend/app/models/crm_dead_letter.py
from datetime import datetime, timezone
from uuid import UUID
from uuid6 import uuid7
from typing import Optional
from sqlmodel import SQLModel, Field, Column, DateTime
from sqlalchemy import JSON
from sqlalchemy.dialects.postgresql import JSONB

class CrmDeadLetter(SQLModel, table=True):
    __tablename__ = "crm_dead_letter"
    
    id: UUID = Field(default_factory=uuid7, primary_key=True)
    client_id: UUID = Field(foreign_key="client.id", index=True)
    payload: dict = Field(
        default_factory=dict, 
        sa_column=Column(JSONB().with_variant(JSON, "sqlite"), nullable=False)
    )
    attempts: int = Field(default=0)
    last_error: Optional[str] = Field(default=None, nullable=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    failed_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
