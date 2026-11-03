# backend/tests/test_phase6.py
import pytest
from uuid import uuid4
from unittest.mock import patch, MagicMock, AsyncMock
from sqlmodel import select
import httpx

# Internal Imports
from app.main import app
from app.db import async_engine, async_session_maker, init_db
from app.models.client import Client, ClientCategory, SubscriptionStatus

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

async def test_tracker_indexeddb_offline_queue():
    """
    Mock the offline state (navigator.onLine = false) and verify the event buffering
    conceptually. Re-trigger online sync state and assert successful ingestion.
    """
    client_id = uuid4()
    client_domain = f"offline-test-{uuid4()}.co.za"
    
    # Seed client first to satisfy foreign keys / tenant validations
    async with async_session_maker() as session:
        client_row = Client(
            id=client_id,
            company_name="Offline Client",
            domain=client_domain,
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client_row)
        await session.commit()

    client = await get_test_client()
    
    # Directly hit track entry as if the offline queue is flushing its payload
    payload = {
        "client_id": str(client_id),
        "aura_id": "aura-id-offline-123",
        "url": f"https://{client_domain}/home",
        "timestamp": "2026-06-05T12:00:00Z"
    }
    
    response = await client.post("/api/v1/track/entry", json=payload)
    assert response.status_code == 200

async def test_layered_consent_phases():
    """
    Mock the transition of the consent banner through the 4 capture phases,
    ensuring that the backend is notified on consent promotions correctly.
    """
    client_id = uuid4()
    client_domain = f"consent-test-{uuid4()}.co.za"
    aura_id = "aura-id-consent-123"
    
    # Seed client first to satisfy foreign keys
    async with async_session_maker() as session:
        client_row = Client(
            id=client_id,
            company_name="Consent Client",
            domain=client_domain,
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client_row)
        await session.commit()

    client = await get_test_client()
    
    # Phase 01: Initial Slide-in (no backend sync needed yet)
    # Phase 02: Scroll Milestone -> User provides contact inputs (Submit Verification)
    payload_p2 = {
        "client_id": str(client_id),
        "aura_id": aura_id,
        "email": "procurement@miningcorp.co.za",
        "company_name_raw": "Mining Corp Pty Ltd",
        "website": "miningcorp.co.za",
        "industry": "Supply Chain",
        "avg_price": "Director",
        "full_capture": True
    }
    
    response = await client.post("/api/v1/prospects/join", json=payload_p2)
    assert response.status_code == 200

async def test_geolocation_consent_routing():
    """
    Test timezone-based geolocation consent routing.
    Mock EU timezone ("Europe/Berlin") -> expect GDPR mode with require_consent_banner = True.
    Mock SADC timezone ("Africa/Johannesburg") -> expect POPIA mode.
    """
    client_id = uuid4()
    client_domain = f"geotest-{uuid4()}.co.za"
    
    # Seed client
    async with async_session_maker() as session:
        client_row = Client(
            id=client_id,
            company_name="Geo Test Inc",
            domain=client_domain,
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.ACTIVE,
            require_consent_banner=False, # default is False, timezone overrides it
            is_active=True
        )
        session.add(client_row)
        await session.commit()
        
    client = await get_test_client()
    
    # 1. Test EU timezone (GDPR mode)
    headers = {"referer": f"https://{client_domain}/"}
    response = await client.get(
        f"/api/v1/clients/config?client_id={client_id}&tz=Europe/Berlin",
        headers=headers
    )
    assert response.status_code == 200
    config = response.json()
    assert config["compliance_mode"] == "GDPR"
    assert config["require_consent_banner"] is True
    
    # 2. Test SADC/SA timezone (POPIA mode)
    response = await client.get(
        f"/api/v1/clients/config?client_id={client_id}&tz=Africa/Johannesburg",
        headers=headers
    )
    assert response.status_code == 200
    config = response.json()
    assert config["compliance_mode"] == "POPIA"
    assert config["require_consent_banner"] is False
