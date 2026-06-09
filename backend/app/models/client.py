# backend/app/models/client.py
from enum import Enum
from typing import Optional, List, Any
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, DateTime
from sqlalchemy import ARRAY, String, JSON
from pydantic import model_validator

class ClientCategory(str, Enum):
    INDUSTRIAL = "industrial"
    COMMERCIAL = "commercial"

class SubscriptionStatus(str, Enum):
    TRIAL = "trial"
    ACTIVE = "active"
    SUSPENDED = "suspended"

class ClientBase(SQLModel):
    company_name: str = Field(index=True)
    domain: Optional[str] = Field(default=None, index=True, nullable=True)
    whitelisted_domains: List[str] = Field(
        default=[],
        sa_column=Column(ARRAY(String).with_variant(JSON, "sqlite"), nullable=False)
    )
    category: ClientCategory = Field(default=ClientCategory.COMMERCIAL)
    client_product_description: str = Field(default="")
    subscription_status: SubscriptionStatus = Field(default=SubscriptionStatus.SUSPENDED)
    payment_plan: str = Field(default="monthly")
    setup_fee_paid: bool = Field(default=False)
    contract_signed_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    payment_provider_id: Optional[str] = Field(default=None, nullable=True)
    is_active: bool = Field(default=False)
    collect_personal_data: bool = Field(default=False)
    require_consent_banner: bool = Field(default=False)

    def __init__(self, **data: Any):
        domain = data.get("domain")
        whitelisted = data.get("whitelisted_domains")
        if domain and not whitelisted:
            data["whitelisted_domains"] = [domain]
        elif whitelisted and not domain:
            data["domain"] = whitelisted[0]
        super().__init__(**data)

class Client(ClientBase, table=True):
    __tablename__ = "client"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    auto_classified_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )

class ClientCreate(ClientBase):
    pass

class ClientPublic(ClientBase):
    id: UUID
    created_at: datetime
    auto_classified_at: Optional[datetime] = None