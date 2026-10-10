# backend/app/models/client.py
from enum import Enum
from typing import Optional, List, Any
from datetime import datetime, timezone
from uuid import UUID
from uuid6 import uuid7
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
    CANCELLATION_PENDING = "cancellation_pending"

class ClientBase(SQLModel):
    company_name: str = Field(index=True)
    contact_email: Optional[str] = Field(default=None, nullable=True)
    contact_phone: Optional[str] = Field(default=None, nullable=True)
    sales_rep_id: Optional[str] = Field(default=None, foreign_key="user.id", index=True, nullable=True)
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
    require_consent_banner: bool = Field(default=True)
    slack_webhook_url: Optional[str] = Field(default=None, nullable=True)
    crm_webhook_url: Optional[str] = Field(default=None, nullable=True)
    airtable_base_id: Optional[str] = Field(default=None, nullable=True)
    airtable_api_key: Optional[str] = Field(default=None, nullable=True)
    payment_method_token: Optional[str] = Field(default=None, nullable=True)
    custom_monthly_amount: Optional[int] = Field(default=None, nullable=True)
    billing_cycle: str = Field(default="monthly", nullable=False)
    trial_ends_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    tc_accepted_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True)
    )
    tc_accepted_ip: Optional[str] = Field(default=None, nullable=True)
    cancellation_requested: bool = Field(default=False, nullable=False)
    trial_warning_sent: bool = Field(default=False, nullable=False)
    theme_config: Optional[dict] = Field(
        default=None,
        sa_column=Column(JSON)
    )


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
    
    id: UUID = Field(default_factory=uuid7, primary_key=True)
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