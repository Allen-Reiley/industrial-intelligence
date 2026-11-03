# backend/app/models/checkout_session.py
from enum import Enum
from typing import Optional
from datetime import datetime, timezone
from uuid import UUID
from uuid6 import uuid7
from sqlmodel import SQLModel, Field, Column, DateTime
from sqlalchemy import String

class CheckoutSessionStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    EXPIRED = "expired"

class CheckoutSession(SQLModel, table=True):
    __tablename__ = "checkout_session"

    id: UUID = Field(default_factory=uuid7, primary_key=True)
    client_id: UUID = Field(foreign_key="client.id", ondelete="CASCADE", index=True, nullable=False)
    sales_rep_id: str = Field(foreign_key="user.id", index=True, nullable=False)
    status: CheckoutSessionStatus = Field(
        default=CheckoutSessionStatus.PENDING,
        sa_column=Column(String, default=CheckoutSessionStatus.PENDING, index=True, nullable=False)
    )
    expires_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    amount: int = Field(default=1000000, nullable=False)  # stored in cents
    plan: str = Field(default="monthly", nullable=False)
    business_name: Optional[str] = Field(default=None, nullable=True)
    contact_email: Optional[str] = Field(default=None, nullable=True)
    contact_phone: Optional[str] = Field(default=None, nullable=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )

    def is_expired(self) -> bool:
        if self.status == CheckoutSessionStatus.EXPIRED:
            return True
        now = datetime.now(timezone.utc)
        exp = self.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        return exp < now

