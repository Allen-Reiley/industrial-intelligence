# backend/app/models/pageview.py
from typing import Optional, Union
from datetime import datetime
from pydantic import ConfigDict, field_validator
from sqlmodel import SQLModel, Field, Column, DateTime
import sqlalchemy as sa

class PageViewBase(SQLModel):
    """
    Base properties for Pydantic validation. 
    Handles messy browser data types like duration strings or floats.
    """
    client_id: str = Field(description="The visitor's unique forensic ID (aura_id)")
    url: str = Field(description="The URL recorded")
    
    # Union is strictly for Pydantic/API ingestion
    duration: Union[int, float, str] = Field(
        default=0, 
        description="Dwell time in seconds. Coerced during validation."
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
        """
        Industrial Data Cleaning: Converts messy browser inputs 
        (e.g., "12.5" or 12.5) into a clean integer for the ledger.
        """
        try:
            return int(float(v))
        except (ValueError, TypeError):
            return 0

class PageView(SQLModel, table=True):
    """
    The Database Ledger for page-level interactions.
    Explicitly defined with strict types to avoid SQLAlchemy mapping errors.
    """
    __tablename__ = "page_view"

    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Forensic Identification
    aura_id: str = Field(index=True, description="The unified forensic identifier")
    client_id: str = Field(description="The agency-side identifier")
    
    url: str = Field(description="Target URL")
    duration: int = Field(default=0, description="Cleaned dwell time in seconds")
    
    # Metadata
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), 
            server_default=sa.func.now(), 
            nullable=False
        )
    )