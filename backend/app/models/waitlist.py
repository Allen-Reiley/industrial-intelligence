from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional

class WaitlistLead(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Phase 01: Identity
    name: str
    email: str = Field(index=True, unique=True)
    company: str
    industry: str
    
    # Phase 02: Audit
    website: str
    traffic: str  # Storing the range as a string (e.g., "1k-5k")
    avg_price: str
    crm: str
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

