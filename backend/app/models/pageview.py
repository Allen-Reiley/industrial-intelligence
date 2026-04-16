# backend/app/models/pageview.py
from typing import Optional, Union
from datetime import datetime
from pydantic import ConfigDict
from sqlmodel import SQLModel, Field, Column, DateTime
import sqlalchemy as sa

class PageViewBase(SQLModel):
    """
    Base properties shared between the API payload and the Database.
    """
    # Note: aura.js sends the visitor's aura_id in the 'client_id' field for events
    client_id: str = Field(description="The visitor's unique forensic ID (aura_id)")
    url: str = Field(description="The URL recorded")
    
    # Union handles the incoming data variations from the browser
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

class PageView(PageViewBase, table=True):
    """
    The Database Ledger for page-level interactions.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Forensic metadata
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), 
            server_default=sa.func.now(), 
            nullable=False
        )
    )

    # Adding a separate column to explicitly store the aura_id 
    # for cleaner SQL joins later
    aura_id: Optional[str] = Field(default=None, index=True)