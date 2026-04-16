# backend/app/models/pageview.py
from typing import Optional, Union
from datetime import datetime
from pydantic import ConfigDict, field_validator
from sqlmodel import SQLModel, Field, Column, DateTime
import sqlalchemy as sa

class PageViewBase(SQLModel):
    """
    Base properties for Pydantic validation. 
    Handles messy browser data types.
    """
    client_id: str = Field(description="The visitor's unique forensic ID (aura_id)")
    url: str = Field(description="The URL recorded")
    
    # Union is only for the Pydantic side
    duration: Union[int, float, str] = Field(
        default=0, 
        description="Dwell time in seconds. Coerced from string if necessary."
    )

    model_config = ConfigDict(
        populate_by_name=True
    )

class PageViewCreate(PageViewBase):
    """
    Validation schema for 'Exit' and 'Event' pings.
    Matches the payload structure in AuraWorks v3.2.1
    """
    event_type: Optional[str] = "exit"
    intent_cluster: Optional[str] = None

    @field_validator("duration", mode="before")
    @classmethod
    def coerce_duration(cls, v):
        try:
            return int(float(v))
        except (ValueError, TypeError):
            return 0

class PageView(SQLModel, table=True):
    """
    The Database Ledger for page-level interactions.
    Explicitly defined to avoid Union-to-SQL mapping errors.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    aura_id: str = Field(index=True)
    client_id: str # Agency-side identifier
    url: str
    duration: int = Field(default=0)
    
    # Forensic metadata
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), 
            server_default=sa.func.now(), 
            nullable=False
        )
    )

    # Index for high-speed industrial reporting
    __tablename__ = "page_view"