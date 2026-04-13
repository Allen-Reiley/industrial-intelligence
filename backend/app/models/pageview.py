from typing import Optional
from typing import Union, Optional  
from pydantic import ConfigDict
from sqlmodel import SQLModel, Field

class PageViewBase(SQLModel):
    client_id: str = Field(description="The visitor's unique forensic ID (aura_id)")
    url: str = Field(description="The URL the visitor is exiting from")
    
    # Union handles the incoming data variations from the browser
    duration: Union[int, float, str] = Field(
        default=0, 
        description="Dwell time in seconds. Coerced from string if necessary."
    )

    # Pydantic V2 replacement for 'class Config'
    model_config = ConfigDict(
        # 'smart_union' is the default behavior in V2, but we can set 
        # extra='ignore' or other flags here if needed for industrial resilience.
        populate_by_name=True
    )

class PageViewCreate(PageViewBase):
    """
    Validation schema for 'Exit' and 'Event' pings.
    Matches the payload structure in AuraWorks v3.2.1
    """
    event_type: Optional[str] = "exit"
    intent_cluster: Optional[str] = None