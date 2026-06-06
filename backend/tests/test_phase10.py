# backend/tests/test_phase10.py
import pytest
import json
from uuid import uuid4
from datetime import datetime, timezone
from unittest.mock import patch, AsyncMock, MagicMock
from sqlmodel import select

# Internal Imports
from app.main import app
from app.db import async_engine, async_session_maker, init_db
from app.models import Prospect, Visit, Company
from app.models.client import Client, ClientCategory, SubscriptionStatus
from app.core.config import settings
from app.services.notifications import post_vsl_completion_to_slack
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

async def test_intent_telemetry_updates_models():
    client = await get_test_client()
    client_id = uuid4()
    company_id = uuid4()
    aura_id = f"aura-vsl-test-{uuid4()}"
    
    # 1. Seed Database with Client, Company, Visit, and Prospect
    async with async_session_maker() as session:
        client_row = Client(
            id=client_id,
            company_name="AuraWorks Test Client",
            domain=f"vsltestclient-{uuid4()}.co.za",
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client_row)

        company_row = Company(
            id=company_id,
            company_name="Apex Mining Group",
            domain="apexmining.co.za",
            industry="Mining"
        )
        session.add(company_row)

        visit_row = Visit(
            id=uuid4(),
            client_id=client_id,
            company_id=company_id,
            aura_id=aura_id,
            ip_address="196.25.1.1",
            vsl_completion_percentage=25
        )
        session.add(visit_row)

        prospect_row = Prospect(
            id=uuid4(),
            client_id=client_id,
            company_id=company_id,
            aura_id=aura_id,
            name="George Foreman",
            email="george@apexmining.co.za",
            company_name_raw="Apex Mining Group",
            vsl_completion_percentage=25
        )
        session.add(prospect_row)
        await session.commit()

    # 2. Track 50% Intent Telemetry
    payload = {
        "client_id": str(client_id),
        "aura_id": aura_id,
        "vsl_completion_percentage": 50
    }
    response = await client.post("/api/v1/track/intent", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert response.json()["percentage"] == 50

    # Verify both models updated to 50%
    async with async_session_maker() as session:
        visit_stmt = select(Visit).where(Visit.aura_id == aura_id)
        visit = (await session.execute(visit_stmt)).scalars().first()
        assert visit.vsl_completion_percentage == 50
        assert visit.vsl_completed_at is None

        prospect_stmt = select(Prospect).where(Prospect.aura_id == aura_id)
        prospect = (await session.execute(prospect_stmt)).scalars().first()
        assert prospect.vsl_completion_percentage == 50
        assert prospect.vsl_completed_at is None

    # 3. Track 100% Intent Telemetry (completes VSL)
    payload["vsl_completion_percentage"] = 100
    
    with patch("app.services.notifications.post_vsl_completion_to_slack", new_callable=AsyncMock) as mock_slack:
        response = await client.post("/api/v1/track/intent", json=payload)
        assert response.status_code == 200
        
        # Verify both models updated to 100% and completed_at is set
        async with async_session_maker() as session:
            visit_stmt = select(Visit).where(Visit.aura_id == aura_id)
            visit = (await session.execute(visit_stmt)).scalars().first()
            assert visit.vsl_completion_percentage == 100
            assert visit.vsl_completed_at is not None

            prospect_stmt = select(Prospect).where(Prospect.aura_id == aura_id)
            prospect = (await session.execute(prospect_stmt)).scalars().first()
            assert prospect.vsl_completion_percentage == 100
            assert prospect.vsl_completed_at is not None

        mock_slack.assert_called_once_with("Apex Mining Group", client_id, aura_id)

    # 4. Track Abandonment (user completed VSL but did not click CTA)
    payload["vsl_abandoned"] = True
    response = await client.post("/api/v1/track/intent", json=payload)
    assert response.status_code == 200

    async with async_session_maker() as session:
        visit_stmt = select(Visit).where(Visit.aura_id == aura_id)
        visit = (await session.execute(visit_stmt)).scalars().first()
        assert visit.vsl_abandoned is True

        prospect_stmt = select(Prospect).where(Prospect.aura_id == aura_id)
        prospect = (await session.execute(prospect_stmt)).scalars().first()
        assert prospect.vsl_abandoned is True


@patch("httpx.AsyncClient.post")
async def test_vsl_slack_alert(mock_post):
    mock_post.return_value = MagicMock(status_code=200)
    
    client_id = uuid4()
    aura_id = f"aura-lock-{uuid4()}"
    company_name = "Apex Mining Group"

    original_webhook = settings.SLACK_WEBHOOK_URL
    settings.SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/prospects-webhook"

    try:
        await post_vsl_completion_to_slack(
            company_name=company_name,
            client_id=client_id,
            aura_id=aura_id
        )
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert args[0] == "https://hooks.slack.com/services/prospects-webhook"
        payload = kwargs["json"]
        assert "VSL Completed: Apex Mining Group" in payload["text"]
        assert company_name in payload["blocks"][1]["text"]["text"]
    finally:
        settings.SLACK_WEBHOOK_URL = original_webhook
