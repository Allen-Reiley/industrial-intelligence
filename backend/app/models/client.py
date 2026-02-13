# backend/app/models/client.py
from typing import Optional
from datetime import datetime
import uuid
from sqlmodel import SQLModel, Field

class Client(SQLModel, table=True):  # <--- This must be named 'Client'
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()), 
        primary_key=True,
        index=True
    )
    name: str = Field(index=True, unique=True)
    website_url: Optional[str] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# These helper classes are useful for the API later
class ClientCreate(SQLModel):
    name: str
    website_url: Optional[str] = None

class ClientPublic(SQLModel):
    id: str
    name: str
    is_active: bool
