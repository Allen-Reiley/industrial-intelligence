# backend/app/models/client.py
from enum import Enum
from typing import Optional
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field

class ClientCategory(str, Enum):
    INDUSTRIAL = "industrial"
    COMMERCIAL = "commercial"

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    SUSPENDED = "suspended"

class Client(SQLModel, table=True):
    __tablename__ = "client"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    company_name: str = Field(index=True)
    domain: str = Field(unique=True, index=True)
    category: ClientCategory = Field(default=ClientCategory.COMMERCIAL)
    client_product_description: str = Field(default="")
    subscription_status: SubscriptionStatus = Field(default=SubscriptionStatus.SUSPENDED)
    payment_plan: str = Field(default="monthly")
    setup_fee_paid: bool = Field(default=False)
    contract_signed_at: Optional[datetime] = Field(default=None, nullable=True)
    payment_provider_id: Optional[str] = Field(default=None, nullable=True)
    is_active: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    auto_classified_at: Optional[datetime] = Field(default=None, nullable=True)