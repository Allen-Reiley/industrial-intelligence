# backend/app/models/notification_throttle.py
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field

class NotificationThrottle(SQLModel, table=True):
    __tablename__ = "notification_throttle"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    client_id: UUID = Field(index=True)
    company_id: UUID = Field(index=True)
    last_notification_sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
