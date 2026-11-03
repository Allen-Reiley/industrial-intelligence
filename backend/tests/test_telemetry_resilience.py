# backend/tests/test_telemetry_resilience.py
import pytest
from uuid import uuid4
import httpx
from datetime import datetime, timezone
from sqlmodel import select

from app.main import app
from app.db import async_session_maker
from app.models.client import Client, SubscriptionStatus
from app.models.visit import Visit
from app.models.event import Event
from app.models.pageview import PageView

pytestmark = pytest.mark.anyio


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="https://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="https://test")


async def test_track_event_null_aura_id_never_404():
    """
    Task 35.1.2: Telemetry resilience on /v1/track/event.
    Asserts that track_event with null aura_id auto-provisions a synthetic session
    and returns 200 OK without raising a 404.
    """
    client_id = uuid4()

    async with async_session_maker() as session:
        client = Client(
            id=client_id,
            company_name="Event Telemetry Test",
            whitelisted_domains=["telemetry-event.co.za"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client)
        await session.commit()

    http_client = await get_test_client()

    event_payload = {
        "client_id": str(client_id),
        "aura_id": None,
        "event_type": "intent_click",
        "intent_cluster": "Industrial Automation",
        "url": "https://telemetry-event.co.za/catalogue",
        "properties": {"button_id": "download_datasheet"}
    }
    resp = await http_client.post(
        "/v1/track/event",
        json=event_payload,
        headers={"Origin": "https://telemetry-event.co.za"}
    )
    assert resp.status_code == 200
    assert resp.json() == {"status": "event_logged"}

    # Verify visit and event persisted in PostgreSQL
    async with async_session_maker() as session:
        stmt = select(Visit).where(Visit.client_id == client_id)
        visits = (await session.execute(stmt)).scalars().all()
        assert len(visits) >= 1
        created_visit = visits[0]
        assert created_visit.aura_id.startswith("aura_")

        event_stmt = select(Event).where(Event.visit_id == created_visit.id)
        events = (await session.execute(event_stmt)).scalars().all()
        assert len(events) >= 1
        assert events[0].event_type == "intent_click"


async def test_track_exit_null_aura_id_never_404():
    """
    Task 35.1.2: Telemetry resilience on /v1/track/exit.
    Asserts that track_exit with null aura_id creates or resolves a visit,
    records the exit metric, and returns 200 OK without raising a 404.
    """
    client_id = uuid4()

    async with async_session_maker() as session:
        client = Client(
            id=client_id,
            company_name="Exit Telemetry Test",
            whitelisted_domains=["telemetry-exit.co.za"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client)
        await session.commit()

    http_client = await get_test_client()

    exit_payload = {
        "client_id": str(client_id),
        "aura_id": None,
        "url": "https://telemetry-exit.co.za/solutions",
        "duration": 60
    }
    resp = await http_client.post(
        "/v1/track/exit",
        json=exit_payload,
        headers={"Origin": "https://telemetry-exit.co.za"}
    )
    assert resp.status_code == 200
    assert resp.json() == {"status": "recorded"}

    # Verify visit and pageview persisted in PostgreSQL
    async with async_session_maker() as session:
        stmt = select(Visit).where(Visit.client_id == client_id)
        visits = (await session.execute(stmt)).scalars().all()
        assert len(visits) >= 1
        created_visit = visits[0]
        assert created_visit.aura_id.startswith("aura_")
        assert created_visit.duration == 60
        assert created_visit.duration_seconds == 60
        assert created_visit.exited_at is not None
