# backend/app/models/enrichment_queue.py
from enum import Enum
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, DateTime
from sqlalchemy import JSON
from sqlalchemy.dialects.postgresql import JSONB

class QueueType(str, Enum):
    IPINFO = "ipinfo"
    APOLLO = "apollo"

class EnrichmentQueue(SQLModel, table=True):
    __tablename__ = "enrichment_queue"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    client_id: UUID = Field(foreign_key="client.id", index=True)
    visit_id: Optional[UUID] = Field(default=None, index=True, nullable=True)
    aura_id: Optional[str] = Field(default=None, index=True)
    queue_type: QueueType = Field(index=True)
    payload: dict = Field(default_factory=dict, sa_column=Column(JSONB().with_variant(JSON, "sqlite")))
    status: str = Field(default="pending", index=True)
    retry_count: int = Field(default=0, index=True)
    last_attempt_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    next_attempt_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )

class FailedEnrichment(SQLModel, table=True):
    __tablename__ = "failed_enrichment"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    client_id: UUID = Field(foreign_key="client.id", index=True)
    visit_id: Optional[UUID] = Field(default=None, index=True, nullable=True)
    aura_id: Optional[str] = Field(default=None, index=True)
    queue_type: QueueType = Field(index=True)
    payload: dict = Field(default_factory=dict, sa_column=Column(JSONB().with_variant(JSON, "sqlite")))
    failed_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    error_message: Optional[str] = Field(default=None, nullable=True)
