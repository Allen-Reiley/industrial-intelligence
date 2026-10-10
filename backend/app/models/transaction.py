# backend/app/models/transaction.py
from enum import Enum
from typing import Optional
from datetime import datetime, timezone
from uuid import UUID
from uuid6 import uuid7
from sqlmodel import SQLModel, Field, Column, DateTime
from sqlalchemy import String

class TransactionStatus(str, Enum):
    PENDING = "pending"
    SUCCESSFUL = "successful"
    FAILED = "failed"
    REFUNDED = "refunded"

class Transaction(SQLModel, table=True):
    __tablename__ = "transaction"

    id: UUID = Field(default_factory=uuid7, primary_key=True)
    client_id: UUID = Field(foreign_key="client.id", index=True, nullable=False)
    sales_rep_id: Optional[str] = Field(default=None, foreign_key="user.id", index=True, nullable=True)
    checkout_session_id: Optional[UUID] = Field(default=None, foreign_key="checkout_session.id", index=True, nullable=True)
    amount: int = Field(nullable=False)  # stored in cents
    currency: str = Field(default="ZAR", nullable=False)
    status: TransactionStatus = Field(default=TransactionStatus.PENDING, index=True)
    gateway_reference: str = Field(index=True, unique=True, nullable=False)
    payment_method_token: str = Field(nullable=False)
    error_message: Optional[str] = Field(default=None, nullable=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
