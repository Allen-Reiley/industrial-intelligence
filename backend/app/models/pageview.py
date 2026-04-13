from typing import Optional
from typing import Union, Optional  
from sqlmodel import SQLModel, Field

class PageViewBase(SQLModel):
    client_id: str = Field(description="The visitor's unique forensic ID (aura_id)")
    url: str = Field(description="The URL the visitor is exiting from")
    
    # Change: Use Union or Optional to handle incoming data variations
    # FastAPI/Pydantic will automatically try to coerce "10" (string) to 10 (int)
    duration: Union[int, float, str] = Field(
        default=0, 
        description="Dwell time in seconds. Coerced from string if necessary."
    )

    class Config:
        # This ensures that even if a float like 10.5 comes in, it doesn't crash
        smart_union = True

class PageViewCreate(PageViewBase):
    """
    Validation schema for 'Exit' and 'Event' pings.
    Matches the payload structure in AuraWorks v3.2.1
    """
    event_type: Optional[str] = "exit"
    intent_cluster: Optional[str] = None