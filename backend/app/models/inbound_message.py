# backend/app/models/inbound_message.py
from enum import Enum
from typing import Optional
from datetime import datetime, timezone
from uuid import UUID
from uuid6 import uuid7
from sqlmodel import SQLModel, Field, Column, DateTime

class MessageStatus(str, Enum):
    UNREAD = "unread"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"

class InboundMessage(SQLModel, table=True):
    __tablename__ = "inbound_message"

    id: UUID = Field(default_factory=uuid7, primary_key=True)
    sender_email: str = Field(index=True)
    recipient_alias: str = Field(index=True)
    subject: str
    text_body: Optional[str] = Field(default=None, nullable=True)
    html_body: Optional[str] = Field(default=None, nullable=True)
    status: MessageStatus = Field(default=MessageStatus.UNREAD, index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
