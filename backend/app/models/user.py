# backend/app/models/user.py
from enum import Enum
from typing import Optional
from datetime import datetime, timezone
from uuid import UUID
from sqlmodel import SQLModel, Field, Column, DateTime
from sqlalchemy import String, Boolean, ForeignKey

class UserRole(str, Enum):
    ADMIN = "admin"
    SALES = "sales"

class User(SQLModel, table=True):
    __tablename__ = "user"

    id: str = Field(primary_key=True)
    name: str = Field(default="AuraWorks User", nullable=False)
    email: str = Field(unique=True, index=True, nullable=False)
    email_verified: bool = Field(
        default=False,
        sa_column=Column("emailVerified", Boolean, default=False, nullable=False)
    )
    image: Optional[str] = Field(default=None, nullable=True)
    role: UserRole = Field(
        default=UserRole.SALES,
        sa_column=Column(String, default=UserRole.SALES, index=True, nullable=False)
    )
    is_active: bool = Field(default=True, index=True, nullable=False)
    client_id: Optional[UUID] = Field(default=None, index=True, nullable=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("createdAt", DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("updatedAt", DateTime(timezone=True), nullable=False)
    )

    @property
    def is_superuser(self) -> bool:
        return self.role == UserRole.ADMIN


class Session(SQLModel, table=True):
    __tablename__ = "session"

    id: str = Field(primary_key=True)
    user_id: str = Field(
        sa_column=Column("userId", String, ForeignKey("user.id", ondelete="CASCADE"), index=True, nullable=False)
    )
    token: str = Field(unique=True, index=True, nullable=False)
    expires_at: datetime = Field(
        sa_column=Column("expiresAt", DateTime(timezone=True), nullable=False)
    )
    ip_address: Optional[str] = Field(
        default=None,
        sa_column=Column("ipAddress", String, nullable=True)
    )
    user_agent: Optional[str] = Field(
        default=None,
        sa_column=Column("userAgent", String, nullable=True)
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("createdAt", DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("updatedAt", DateTime(timezone=True), nullable=False)
    )


class Account(SQLModel, table=True):
    __tablename__ = "account"

    id: str = Field(primary_key=True)
    user_id: str = Field(
        sa_column=Column("userId", String, ForeignKey("user.id", ondelete="CASCADE"), index=True, nullable=False)
    )
    account_id: str = Field(
        sa_column=Column("accountId", String, nullable=False)
    )
    provider_id: str = Field(
        sa_column=Column("providerId", String, nullable=False)
    )
    access_token: Optional[str] = Field(
        default=None,
        sa_column=Column("accessToken", String, nullable=True)
    )
    refresh_token: Optional[str] = Field(
        default=None,
        sa_column=Column("refreshToken", String, nullable=True)
    )
    access_token_expires_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column("accessTokenExpiresAt", DateTime(timezone=True), nullable=True)
    )
    refresh_token_expires_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column("refreshTokenExpiresAt", DateTime(timezone=True), nullable=True)
    )
    scope: Optional[str] = Field(default=None, nullable=True)
    id_token: Optional[str] = Field(
        default=None,
        sa_column=Column("idToken", String, nullable=True)
    )
    password: Optional[str] = Field(default=None, nullable=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("createdAt", DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("updatedAt", DateTime(timezone=True), nullable=False)
    )


class Verification(SQLModel, table=True):
    __tablename__ = "verification"

    id: str = Field(primary_key=True)
    identifier: str = Field(index=True, nullable=False)
    value: str = Field(nullable=False)
    expires_at: datetime = Field(
        sa_column=Column("expiresAt", DateTime(timezone=True), nullable=False)
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("createdAt", DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("updatedAt", DateTime(timezone=True), nullable=False)
    )
