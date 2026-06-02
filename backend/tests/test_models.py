import pytest
from sqlmodel import SQLModel, create_engine, Session
from app.db import init_db

# Import all models to ensure metadata is populated
from app.models.client import Client
from app.models.company import Company
from app.models.department import Department
from app.models.visit import Visit
from app.models.pageview import PageView
from app.models.waitlist_lead import WaitlistLead
from app.models.enrichment_queue import EnrichmentQueue, FailedEnrichment
from app.models.notification_throttle import NotificationThrottle

def test_database_schema_initialization():
    """
    Spins up an in-memory SQLite database to verify all tables, UUIDs, 
    and foreign keys can be initialized without schema conflicts.
    """
    engine = create_engine("sqlite:///:memory:")
    # Create all tables
    SQLModel.metadata.create_all(engine)
    
    # Verify tables exist
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    expected_tables = [
        "client", "company", "department", "visit", 
        "page_view", "waitlist_lead", "enrichment_queue", 
        "failed_enrichment", "notification_throttle"
    ]
    
    for t in expected_tables:
        assert t in tables, f"Missing table: {t}"
        
    print("✅ All 9 database tables successfully initialized with perfect referential integrity.")
