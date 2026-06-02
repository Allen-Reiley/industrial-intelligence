# backend/tests/test_models.py
import pytest
from pydantic import ValidationError
from uuid import uuid4
from datetime import datetime, timezone

from app.models.client import Client, ClientCategory, SubscriptionStatus
from app.models.company import Company
from app.models.department import Department
from app.models.visit import Visit, VerificationStatus
from app.models.pageview import PageView
from app.models.waitlist_lead import WaitlistLead
from app.models.enrichment_queue import EnrichmentQueue, FailedEnrichment, QueueType
from app.models.notification_throttle import NotificationThrottle

def test_sqlmodel_enum_validation():
    # 1. Test ClientCategory validation
    with pytest.raises(ValidationError):
        Client.model_validate({
            "company_name": "Test Company",
            "domain": "test.com",
            "category": "INVALID_CATEGORY"  # Should be industrial or commercial
        })

    # 2. Test SubscriptionStatus validation
    with pytest.raises(ValidationError):
        Client.model_validate({
            "company_name": "Test Company",
            "domain": "test.com",
            "category": ClientCategory.INDUSTRIAL,
            "subscription_status": "INVALID_STATUS"  # Should be active, past_due, or suspended
        })

    # 3. Test VerificationStatus validation
    with pytest.raises(ValidationError):
        Visit.model_validate({
            "client_id": uuid4(),
            "aura_id": "aura123",
            "ip_address": "127.0.0.1",
            "verification_status": "INVALID_STATUS"  # Should be verifying, verified, anonymized_corporate
        })

    # 4. Test QueueType validation
    with pytest.raises(ValidationError):
        EnrichmentQueue.model_validate({
            "client_id": uuid4(),
            "queue_type": "INVALID_TYPE"  # Should be ipinfo or apollo
        })

def test_model_instantiation_defaults():
    client_id = uuid4()
    company_id = uuid4()
    
    # Check Client defaults
    client = Client(company_name="AuraWorks", domain="auraworks.co.za")
    assert client.id is not None
    assert client.category == ClientCategory.COMMERCIAL
    assert client.subscription_status == SubscriptionStatus.SUSPENDED
    assert isinstance(client.created_at, datetime)
    assert client.created_at.tzinfo == timezone.utc

    # Check Company defaults
    company = Company(company_name="Mining Corp", domain="miningcorp.co.za")
    assert company.id is not None
    assert company.is_headquarters is False
    assert company.cipc_verified is False
    assert company.created_at.tzinfo == timezone.utc

    # Check Department defaults
    dept = Department(
        company_id=company_id,
        contact_name="John Doe",
        role_title="Chief Procurement Officer",
        email="john@miningcorp.co.za"
    )
    assert dept.id is not None
    assert dept.priority_score == 1
    assert dept.created_at.tzinfo == timezone.utc

    # Check Visit defaults
    visit = Visit(
        client_id=client_id,
        aura_id="forensic_aura_1",
        ip_address="196.25.1.1"
    )
    assert visit.id is not None
    assert visit.connection_type == "corporate"
    assert visit.is_b2b is True
    assert visit.high_intent is False
    assert visit.verification_status == VerificationStatus.VERIFYING
    assert visit.is_consented is False
    assert visit.created_at.tzinfo == timezone.utc

    # Check PageView defaults
    pv = PageView(
        client_id=client_id,
        visit_id=visit.id,
        url_path="/specs/machinery"
    )
    assert pv.id is not None
    assert pv.duration == 0
    assert pv.created_at.tzinfo == timezone.utc

    # Check WaitlistLead defaults
    lead = WaitlistLead(
        client_id=client_id,
        email="lead@miningcorp.co.za"
    )
    assert lead.id is not None
    assert lead.welcome_email_sent is False
    assert lead.created_at.tzinfo == timezone.utc
    assert lead.updated_at.tzinfo == timezone.utc

    # Check EnrichmentQueue defaults
    eq = EnrichmentQueue(
        client_id=client_id,
        queue_type=QueueType.IPINFO,
        payload={"ip": "196.25.1.1"}
    )
    assert eq.id is not None
    assert eq.status == "pending"
    assert eq.retry_count == 0
    assert eq.created_at.tzinfo == timezone.utc

    # Check NotificationThrottle defaults
    throttle = NotificationThrottle(
        client_id=client_id,
        company_id=company_id
    )
    assert throttle.id is not None
    assert throttle.last_notification_sent_at.tzinfo == timezone.utc
    assert throttle.created_at.tzinfo == timezone.utc
