from typing import Optional
from sqlmodel import SQLModel

class PageViewBase(SQLModel):
    client_id: str
    url: str
    duration: int = 0

class PageViewCreate(PageViewBase):
    """Used for the 'Exit' ping data validation"""
    event_type: str = "exit"

# We don't necessarily need a 'table=True' for this yet 
# if you're just updating the Visit duration, but 
# track.py needs the class definition to stop crashing.