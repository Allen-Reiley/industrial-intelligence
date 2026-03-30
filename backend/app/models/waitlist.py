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
    
    # Automation Tracking
    # Tracks if the Resend welcome email was successfully dispatched
    welcome_email_sent: bool = Field(default=False)
    
    # Metadata
    # Uses UTC to keep audits consistent across timezones
    created_at: datetime = Field(default_factory=datetime.utcnow)