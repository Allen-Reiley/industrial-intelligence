# backend/app/models/user.py
import uuid
from typing import List, Optional
from fastapi_users import schemas
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyBaseOAuthAccountTableUUID
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
from sqlmodel import SQLModel

class Base(DeclarativeBase):
    metadata = SQLModel.metadata

class OAuthAccount(SQLAlchemyBaseOAuthAccountTableUUID, Base):
    pass

class User(SQLAlchemyBaseUserTableUUID, Base):
    __allow_unmapped__ = True
    username: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, unique=True, index=True)
    oauth_accounts: Mapped[List[OAuthAccount]] = relationship(
        "OAuthAccount", lazy="joined", cascade="all, delete-orphan"
    )

class UserRead(schemas.BaseUser[uuid.UUID]):
    username: Optional[str] = None

class UserCreate(schemas.BaseUserCreate):
    username: Optional[str] = None

class UserUpdate(schemas.BaseUserUpdate):
    username: Optional[str] = None
