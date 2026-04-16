# backend/app/models/__init__.py

from .client import Client
from .company import Company
from .visit import Visit
from .waitlist import WaitlistLead
from .pageview import PageView
from .department import Department
from .lead import Lead

# This ensures that when we import app.models, 
# all SQLModel classes are registered with the metadata.
__all__ = [
    "Client",
    "Company",
    "Visit",
    "WaitlistLead",
    "PageView",
    "Department",
    "Lead"
]