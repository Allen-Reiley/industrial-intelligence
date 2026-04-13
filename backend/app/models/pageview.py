from typing import Optional
from sqlmodel import SQLModel, Field

class PageViewBase(SQLModel):
    client_id: str = Field(description="The visitor's unique forensic ID (aura_id)")
    url: str = Field(description="The URL the visitor is exiting from")
    duration: int = Field(default=0, description="Dwell time in seconds")

class PageViewCreate(PageViewBase):
    """
    Validation schema for 'Exit' and 'Event' pings.
    Matches the payload structure in AuraWorks v3.2.1
    """
    event_type: Optional[str] = "exit"
    intent_cluster: Optional[str] = None