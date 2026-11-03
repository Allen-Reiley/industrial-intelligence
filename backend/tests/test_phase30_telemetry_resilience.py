import pytest
import uuid
from uuid import uuid4
import httpx
from datetime import datetime, timezone, timedelta

from app.main import app
from app.db import async_session_maker
from app.models.client import Client, SubscriptionStatus, ClientCategory
from app.models.visit import Visit
from app.models.prospect import Prospect
from app.core.security import decrypt_field
from sqlmodel import select

pytestmark = pytest.mark.anyio

async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="https://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="https://test")

async def test_event_and_exit_null_aura_id_never_404():
    """
    Asserts that /v1/track/event and /v1/track/exit with null aura_id
    intelligently resolve or auto-generate a valid visit and never return 404.
    """
    client_id = uuid4()

    async with async_session_maker() as session:
        client = Client(
            id=client_id,
            company_name="Telemetry Test Inc",
            whitelisted_domains=["telemetry-test.co.za"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client)
        await session.commit()

    http_client = await get_test_client()

    # 1. Event with null aura_id -> 200 OK (not 404)
    event_payload = {
        "client_id": str(client_id),
        "aura_id": None,
        "event_type": "scroll_milestone",
        "properties": {"percentage": 75}
    }
    resp_event = await http_client.post(
        "/v1/track/event",
        json=event_payload,
        headers={"Origin": "https://telemetry-test.co.za"}
    )
    assert resp_event.status_code == 200
    assert resp_event.json() == {"status": "event_logged"}

    # 2. Exit with null aura_id -> 200 OK (not 404)
    exit_payload = {
        "client_id": str(client_id),
        "aura_id": None,
        "url": "https://telemetry-test.co.za/catalogue",
        "duration": 45
    }
    resp_exit = await http_client.post(
        "/v1/track/exit",
        json=exit_payload,
        headers={"Origin": "https://telemetry-test.co.za"}
    )
    assert resp_exit.status_code == 200
    assert resp_exit.json() == {"status": "recorded"}

async def test_identity_preserves_phone_and_name_without_email():
    """
    Asserts that Step 1 of the banner form (capturing first_name, last_name, phone without email)
    persists a Prospect record immediately so PII is never dropped if visitor abandons at Step 2.
    """
    client_id = uuid4()
    aura_id = f"aura_step1_{uuid4().hex[:8]}"

    async with async_session_maker() as session:
        client = Client(
            id=client_id,
            company_name="Lead Recovery Corp",
            whitelisted_domains=["lead-recovery.co.za"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client)

        visit = Visit(
            client_id=client_id,
            aura_id=aura_id,
            ip_address="196.25.1.50",
            connection_type="corporate",
            is_b2b=True
        )
        session.add(visit)
        await session.commit()

    http_client = await get_test_client()

    # Submit Step 1: name + phone, email omitted
    payload = {
        "client_id": str(client_id),
        "aura_id": aura_id,
        "first_name": "Sipho",
        "last_name": "Dlamini",
        "phone": "+27821234567"
    }
    resp = await http_client.post(
        "/v1/track/identity",
        json=payload,
        headers={"Origin": "https://lead-recovery.co.za"}
    )
    assert resp.status_code == 200
    assert resp.json()["lead_captured"] is True

    # Verify that Prospect exists in DB with decrypted phone and full name
    async with async_session_maker() as session:
        stmt = select(Prospect).where(
            Prospect.client_id == client_id,
            Prospect.aura_id == aura_id
        )
        res = await session.execute(stmt)
        prospect = res.scalars().first()
        assert prospect is not None
        assert prospect.name == "Sipho Dlamini"
        assert prospect.phone_encrypted is not None
        assert decrypt_field(prospect.phone_encrypted) == "+27821234567"

async def test_telemetry_origin_security_hardening():
    """
    Asserts that unauthorized external origins are rejected with 403,
    while whitelisted tenant domains or Vercel preview regex origins are allowed.
    """
    client_id = uuid4()

    async with async_session_maker() as session:
        client = Client(
            id=client_id,
            company_name="Perimeter Client",
            whitelisted_domains=["secure-perimeter.co.za"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client)
        await session.commit()

    http_client = await get_test_client()

    # 1. Disallowed origin -> 403 Forbidden
    resp_bad = await http_client.post(
        "/v1/track/event",
        json={"client_id": str(client_id), "event_type": "click"},
        headers={"Origin": "https://malicious-spoofed-domain.com"}
    )
    assert resp_bad.status_code == 403
    assert "Origin not permitted by tenant policy" in resp_bad.json()["detail"]

    # 2. Vercel preview domain -> 200 OK
    resp_preview = await http_client.post(
        "/v1/track/event",
        json={"client_id": str(client_id), "event_type": "click"},
        headers={"Origin": "https://preview-deploy-branch-12.vercel.app"}
    )
    assert resp_preview.status_code == 200

    # 3. Whitelisted domain -> 200 OK
    resp_good = await http_client.post(
        "/v1/track/event",
        json={"client_id": str(client_id), "event_type": "click"},
        headers={"Origin": "https://secure-perimeter.co.za"}
    )
    assert resp_good.status_code == 200
