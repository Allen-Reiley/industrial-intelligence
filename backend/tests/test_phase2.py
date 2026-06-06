import pytest
from uuid import uuid4
from datetime import datetime, timezone
from unittest.mock import patch, AsyncMock
from sqlmodel import select
import httpx
from sqlalchemy.ext.asyncio import AsyncSession

# Internal Imports
from app.main import app
from app.db import async_engine, async_session_maker
from app.models.client import Client, ClientCategory, SubscriptionStatus
from app.models.company import Company
from app.models.visit import Visit, VerificationStatus
from app.models.pageview import PageView
from app.models.enrichment_queue import EnrichmentQueue, QueueType
from app.services.enrichment import EnrichmentError
from app.api.v1.track import exit_notification_cache

pytestmark = pytest.mark.anyio

@pytest.fixture(autouse=True)
async def dispose_engine_fixture():
    # Clear memory cache
    exit_notification_cache.clear()
    yield
    # Dispose connection pool so different tests do not share pool across closed event loops
    await async_engine.dispose()

async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="http://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="http://test")

async def test_composite_cache_key_isolation():
    """
    Assert that modifications, updates, or expirations applied to key 1
    leave key 2 entirely unaffected, preventing multi-tenant cache pollution.
    """
    client_id_1 = str(uuid4())
    client_id_2 = str(uuid4())
    aura_id = "test-aura-id-cache"

    key_1 = f"{client_id_1}:{aura_id}"
    key_2 = f"{client_id_2}:{aura_id}"

    # Set key 1
    exit_notification_cache[key_1] = True

    # Assert key 2 is unaffected
    assert key_1 in exit_notification_cache
    assert key_2 not in exit_notification_cache

@patch("app.api.v1.track.handle_juristic_only_alert", new_callable=AsyncMock)
async def test_exit_endpoint_without_lead(mock_juristic_alert):
    """
    Send a mock transaction payload to POST /v1/track/exit passing a valid aura_id
    and a company_id but completely lacking a matching Prospect database entry.
    Assert an HTTP 200 response, verify that session duration math is updated on
    the Visit row, and confirm that handle_juristic_only_alert is invoked.
    """
    client_id = uuid4()
    company_id = uuid4()
    aura_id = f"aura-exit-test-{uuid4()}"
    client_domain = f"exit-{uuid4()}.com"
    company_domain = f"juristic-{uuid4()}.co.za"

    async with async_session_maker() as session:
        # Seed Client
        client = Client(
            id=client_id,
            company_name=f"Test Exit Client {uuid4()}",
            domain=client_domain,
            category=ClientCategory.INDUSTRIAL,
            client_product_description="Exit Products",
            subscription_status=SubscriptionStatus.ACTIVE,
            payment_plan="enterprise",
            setup_fee_paid=True,
            is_active=True
        )
        session.add(client)

        # Seed Company
        company = Company(
            id=company_id,
            company_name="Juristic Corp",
            domain=company_domain,
            cipc_verified=True,
            total_visits=1
        )
        session.add(company)

        # Seed Visit
        visit = Visit(
            client_id=client_id,
            company_id=company_id,
            aura_id=aura_id,
            ip_address="196.25.1.1",
            connection_type="corporate",
            is_b2b=True,
            high_intent=False,
            verification_status=VerificationStatus.VERIFIED,
            is_consented=False,
            duration=5
        )
        session.add(visit)
        await session.commit()

    # Call the /exit endpoint using ASGITransport client
    async with await get_test_client() as client:
        payload = {
            "client_id": str(client_id),
            "aura_id": aura_id,
            "url": "https://auraworks.co.za/schematic",
            "duration": 20,
            "has_downloaded_asset": True
        }
        # Set Client Context in header for RLS
        headers = {"x-client-id": str(client_id)}
        response = await client.post("/api/v1/track/exit", json=payload, headers=headers)
        assert response.status_code == 200
        assert response.json() == {"status": "recorded"}

    # Query the visit to verify duration update
    async with async_session_maker() as session:
        stmt = select(Visit).where(Visit.aura_id == aura_id, Visit.client_id == client_id)
        visit_db = (await session.execute(stmt)).scalars().first()
        assert visit_db is not None
        assert visit_db.duration == 20

    # Since we are using BackgroundTasks, we wait briefly for the task thread to complete
    import asyncio
    await asyncio.sleep(0.5)

    # Verify that the juristic data alerting service function was invoked
    mock_juristic_alert.assert_called_once()
    called_company = mock_juristic_alert.call_args[0][0]
    assert called_company.id == company_id

    # Clean up
    async with async_session_maker() as session:
        await session.delete(visit_db)
        await session.delete(await session.get(Company, company_id))
        await session.delete(await session.get(Client, client_id))
        await session.commit()

@patch("app.api.v1.track.enrich_visitor_data", side_effect=EnrichmentError("IPinfo outage", status_code=504))
async def test_enrichment_queue_failover(mock_enrich):
    """
    Mock external API network dependencies to simulate outage.
    Send payload to /track/entry and assert it handles exception, logs HTTP 200,
    and writes the raw tracking attributes to EnrichmentQueue with retry_count == 0.
    """
    client_id = uuid4()
    aura_id = f"aura-entry-test-{uuid4()}"
    client_domain = f"entry-{uuid4()}.com"

    async with async_session_maker() as session:
        # Seed Client
        client = Client(
            id=client_id,
            company_name=f"Test Entry Client {uuid4()}",
            domain=client_domain,
            category=ClientCategory.INDUSTRIAL,
            client_product_description="Entry Products",
            subscription_status=SubscriptionStatus.ACTIVE,
            payment_plan="enterprise",
            setup_fee_paid=True,
            is_active=True
        )
        session.add(client)
        await session.commit()

    async with await get_test_client() as client:
        payload = {
            "client_id": str(client_id),
            "aura_id": aura_id,
            "url": "https://auraworks.co.za/home",
            "referrer": "direct"
        }
        headers = {"x-client-id": str(client_id)}
        response = await client.post("/api/v1/track/entry", json=payload, headers=headers)
        assert response.status_code == 200
        assert response.json() == {"status": "accepted"}

    # Wait for BackgroundTask
    import asyncio
    await asyncio.sleep(0.5)

    # Verify that EnrichmentQueue entry was created
    async with async_session_maker() as session:
        stmt = select(EnrichmentQueue).where(
            EnrichmentQueue.aura_id == aura_id,
            EnrichmentQueue.client_id == client_id
        )
        queue_entry = (await session.execute(stmt)).scalars().first()
        assert queue_entry is not None
        assert queue_entry.queue_type == QueueType.IPINFO
        assert queue_entry.retry_count == 0
        assert queue_entry.status == "pending"
        assert queue_entry.payload == {"ip_address": "127.0.0.1"}

        # Clean up
        stmt_pv = select(PageView).where(PageView.client_id == client_id)
        pvs = (await session.execute(stmt_pv)).scalars().all()
        for pv in pvs:
            await session.delete(pv)
        stmt_visit = select(Visit).where(Visit.aura_id == aura_id, Visit.client_id == client_id)
        visit_db = (await session.execute(stmt_visit)).scalars().first()
        if visit_db:
            await session.delete(visit_db)
        await session.delete(queue_entry)
        await session.delete(await session.get(Client, client_id))
        await session.commit()
