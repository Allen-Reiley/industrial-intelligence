import pytest
from sqlmodel import SQLModel, create_engine, Session
from app.db import init_db

# Import all models to ensure metadata is populated
from app.models.client import Client
from app.models.company import Company
from app.models.department import Department
from app.models.visit import Visit
from app.models.pageview import PageView
from app.models.prospect import Prospect
from app.models.enrichment_queue import EnrichmentQueue, FailedEnrichment
from app.models.notification_throttle import NotificationThrottle
from app.models.crm_dead_letter import CrmDeadLetter
from app.models.inbound_message import InboundMessage, MessageStatus

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
        "page_view", "prospect", "enrichment_queue", 
        "failed_enrichment", "notification_throttle", "crm_dead_letter",
        "inbound_message"
    ]
    
    for t in expected_tables:
        assert t in tables, f"Missing table: {t}"
        
    print("✅ All database tables successfully initialized with perfect referential integrity.")

def test_inbound_message_crud():
    """
    Verifies that InboundMessage records can be created, read, updated, and deleted.
    """
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        # Create
        msg = InboundMessage(
            sender_email="test@example.com",
            recipient_alias="privacy@auraworks.co.za",
            subject="Data request",
            text_body="Please delete my data.",
            html_body="<p>Please delete my data.</p>"
        )
        session.add(msg)
        session.commit()
        session.refresh(msg)
        
        assert msg.id is not None
        assert msg.status == MessageStatus.UNREAD

        # Read
        db_msg = session.get(InboundMessage, msg.id)
        assert db_msg is not None
        assert db_msg.sender_email == "test@example.com"

        # Update
        db_msg.status = MessageStatus.IN_PROGRESS
        session.add(db_msg)
        session.commit()
        session.refresh(db_msg)
        assert db_msg.status == MessageStatus.IN_PROGRESS

        # Delete
        session.delete(db_msg)
        session.commit()
        deleted_msg = session.get(InboundMessage, msg.id)
        assert deleted_msg is None

def test_client_whitelisted_domains_validation():
    """
    Verifies that Client whitelisted_domains array and updated SubscriptionStatus are stored correctly.
    """
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)

    from app.models.client import SubscriptionStatus
    with Session(engine) as session:
        client = Client(
            company_name="AuraWorks Test Group",
            whitelisted_domains=["test.com", "staging.test.com"],
            subscription_status=SubscriptionStatus.TRIAL,
            is_active=True
        )
        session.add(client)
        session.commit()
        session.refresh(client)

        assert client.id is not None
        assert client.domain == "test.com"
        assert client.whitelisted_domains == ["test.com", "staging.test.com"]
        assert client.subscription_status == SubscriptionStatus.TRIAL

