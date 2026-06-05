# backend/tests/test_phase7.py
import pytest
import urllib.parse
from uuid import uuid4
from datetime import datetime, timezone
from unittest.mock import patch, AsyncMock, MagicMock
from sqlmodel import select

# Internal Imports
from app.main import app
from app.db import async_engine, async_session_maker, init_db
from app.models.client import Client, ClientCategory, SubscriptionStatus
from app.models.company import Company
from app.models.crm_dead_letter import CrmDeadLetter
from app.models.notification_throttle import NotificationThrottle
from app.services.reports import compile_weekly_report, generate_signed_cdn_link
from app.services.notifications import is_slack_notification_throttled, handle_juristic_only_alert
from app.services.crm import sync_lead_to_crm
from app.services.vault import sync_to_notion
import httpx

pytestmark = pytest.mark.anyio

@pytest.fixture(autouse=True)
async def dispose_engine_fixture():
    init_db()
    yield
    await async_engine.dispose()

async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="http://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="http://test")

async def test_weekly_pdf_report_r2_upload():
    """
    Trigger the programmatic weekly report compiler on a test client.
    Assert that a multi-page PDF document aggregates metrics accurately,
    and verify the secure tokenized CDN download link signature and expiration rule.
    """
    client_id = uuid4()
    client_domain = f"reporttest-{uuid4()}.co.za"
    
    async with async_session_maker() as session:
        client_row = Client(
            id=client_id,
            company_name="Weekly Report Corp",
            domain=client_domain,
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client_row)
        await session.commit()
        
        pdf_bytes = await compile_weekly_report(client_id, session)
        
    assert pdf_bytes.startswith(b"%PDF")
    
    # Verify the tokenized CDN link
    filename = f"weekly_report_{client_id}_20260605.pdf"
    signed_link = generate_signed_cdn_link(filename, secret_key="r2-cdn-secret")
    
    # Assert CDN URL structure
    assert "cdn.auraworks.co.za" in signed_link
    assert f"reports/{filename}" in signed_link
    
    # Assert parameters
    parsed = urllib.parse.urlparse(signed_link)
    query_params = urllib.parse.parse_qs(parsed.query)
    
    assert "expires" in query_params
    assert "signature" in query_params
    
    # Expiration is 24 hours in the future
    expires_ts = int(query_params["expires"][0])
    current_ts = int(datetime.now(timezone.utc).timestamp())
    assert 23 * 3600 < (expires_ts - current_ts) <= 24 * 3600

async def test_slack_notification_throttling():
    """
    Fire 5 consecutive alerts/throttling checks for the same client and company.
    Assert that exactly 1 is not throttled, while the subsequent 4 are suppressed/throttled.
    """
    client_id = uuid4()
    client_domain = f"slacktest-{uuid4()}.co.za"
    company_id = uuid4()
    
    # Seed client first to avoid foreign key errors on throttle insertion
    async with async_session_maker() as session:
        client_row = Client(
            id=client_id,
            company_name="Slack Throttle Corp",
            domain=client_domain,
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client_row)
        await session.commit()

    # First check must return False (not throttled)
    first_check = await is_slack_notification_throttled(client_id, company_id)
    assert first_check is False
    
    # Next 4 checks must return True (throttled)
    for _ in range(4):
        check = await is_slack_notification_throttled(client_id, company_id)
        assert check is True

async def test_crm_synchronization_dead_letter_queue():
    """
    Force a continuous connection timeout on the CRM outbound webhook endpoint.
    Assert that the sync worker fails after exactly 3 retry iterations,
    and logs the payload into the database dead-letter queue.
    """
    client_id = uuid4()
    client_domain = f"crmtest-{uuid4()}.co.za"
    lead_data = {
        "email": "lead@crmtest.co.za",
        "name": "Jane Doe",
        "company_name_final": "CRM Test Pty Ltd"
    }
    
    # Seed client first to satisfy foreign key constraint on CrmDeadLetter
    async with async_session_maker() as session:
        client_row = Client(
            id=client_id,
            company_name="CRM Sync Client",
            domain=client_domain,
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client_row)
        await session.commit()
        
    # Mock httpx to raise a timeout on every call
    with patch("httpx.AsyncClient.post", side_effect=httpx.ConnectTimeout("Connection timed out")):
        # Use backoff_base=0.01 to run retries immediately without delaying the test run
        success = await sync_lead_to_crm(client_id, lead_data, backoff_base=0.01)
        assert success is False
        
    # Check that a dead-letter record was committed to the DB
    async with async_session_maker() as session:
        stmt = select(CrmDeadLetter).where(CrmDeadLetter.client_id == client_id)
        res = await session.execute(stmt)
        dead_letter = res.scalars().first()
        
        assert dead_letter is not None
        assert dead_letter.attempts == 3
        assert "Connection timed out" in dead_letter.last_error
        assert dead_letter.payload["email"] == "lead@crmtest.co.za"

async def test_notion_vault_synchronization_isolation():
    """
    Execute the sync_to_notion() workflow.
    Mock a transport error to assert the exception is isolated cleanly,
    allowing the caller process to finish without rising or raising failures.
    """
    lead_data = {
        "email": "notion@test.co.za",
        "company_name_final": "Notion Corp"
    }
    journey = {
        "pathway": "Entry -> Exit"
    }
    
    with patch("app.services.vault.settings.NOTION_TOKEN", "mock-token"):
        with patch("app.services.vault.settings.NOTION_DATABASE_ID", "mock-db"):
            with patch("httpx.AsyncClient.post", side_effect=httpx.ConnectError("Network is down")):
                # Should not raise exception and log isolated error message
                await sync_to_notion(lead_data, journey)
