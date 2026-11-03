# backend/tests/test_phase32_tenant_isolation.py
import pytest
import uuid
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock, AsyncMock
import httpx

from app.main import app
from app.core.config import settings
from app.core.security import encrypt_field, decrypt_field
from app.db import async_session_maker
from app.models.client import Client, SubscriptionStatus, ClientCategory
from app.models.user import User, Session as UserSession, UserRole
from app.models.visit import Visit
from app.models.prospect import Prospect
from app.models.pageview import PageView
from app.services.intelligence import get_visitor_journey
from app.services.notifications import (
    resolve_tenant_slack_webhook,
    post_to_slack,
    send_juristic_alert,
    send_calendly_alert,
    send_vsl_completion_alert,
    send_surge_alert,
)
from app.services.vault import sync_to_airtable, sync_to_notion
from sqlmodel import select

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


async def create_user_session(email: str, role: UserRole, client_id: uuid.UUID = None):
    async with async_session_maker() as session:
        stmt = select(User).where(User.email == email)
        res = await session.execute(stmt)
        user = res.scalars().first()
        if not user:
            user_id = f"user_{uuid4().hex[:8]}"
            user = User(
                id=user_id,
                email=email,
                name=email.split("@")[0],
                role=role,
                is_active=True,
                client_id=client_id,
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
        else:
            user.role = role
            user.client_id = client_id
            session.add(user)
            await session.commit()
            await session.refresh(user)

        session_token = f"sess_{uuid4().hex[:12]}"
        user_session = UserSession(
            id=f"sess_{uuid4().hex[:8]}",
            user_id=user.id,
            token=session_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
        session.add(user_session)
        await session.commit()
        return {"better-auth.session_token": session_token}


async def test_visitor_journey_tenant_isolation():
    """
    Task 32.1: Enforce Tenant Scoping on Visitor Journey Intelligence.
    Even when two tenants receive visits from the exact same device (aura_id)
    and IP address, get_visitor_journey must strictly isolate data by client_id.
    """
    client_a_id = uuid4()
    client_b_id = uuid4()
    shared_aura_id = f"aura_shared_{uuid4().hex[:8]}"
    shared_ip = "196.25.1.50"

    async with async_session_maker() as session:
        # Seed Clients
        client_a = Client(id=client_a_id, company_name="Client Alpha", domain="alpha.co.za")
        client_b = Client(id=client_b_id, company_name="Client Beta", domain="beta.co.za")
        session.add_all([client_a, client_b])

        # Seed 2 Visits for Client A, 1 Visit for Client B
        visit_a1 = Visit(
            id=uuid4(),
            client_id=client_a_id,
            aura_id=shared_aura_id,
            ip_address=shared_ip,
            page_path="/alpha-home",
            is_identified=False,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=10),
        )
        visit_a2 = Visit(
            id=uuid4(),
            client_id=client_a_id,
            aura_id=shared_aura_id,
            ip_address=shared_ip,
            page_path="/alpha-pricing",
            is_identified=False,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=8),
        )
        visit_b = Visit(
            id=uuid4(),
            client_id=client_b_id,
            aura_id=shared_aura_id,
            ip_address=shared_ip,
            page_path="/beta-internal-doc",
            is_identified=False,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=5),
        )
        session.add_all([visit_a1, visit_a2, visit_b])
        await session.commit()

        # Seed PageViews for each tenant
        pv_a1 = PageView(
            visit_id=visit_a1.id,
            client_id=client_a_id,
            url_path="/alpha-home",
            duration=15,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=9),
        )
        pv_a2 = PageView(
            visit_id=visit_a2.id,
            client_id=client_a_id,
            url_path="/alpha-pricing",
            duration=45,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=8),
        )
        pv_b1 = PageView(
            visit_id=visit_b.id,
            client_id=client_b_id,
            url_path="/beta-internal-doc",
            duration=60,
            created_at=datetime.now(timezone.utc) - timedelta(minutes=4),
        )
        session.add_all([pv_a1, pv_a2, pv_b1])
        await session.commit()

        # Query journey for Client A
        journey_a = await get_visitor_journey(client_a_id, shared_aura_id, session, ip_address=shared_ip)
        assert journey_a["total_touches"] == 2
        assert "beta" not in journey_a["pathway"].lower()
        assert "alpha" in journey_a["pathway"].lower()

        # Query journey for Client B
        journey_b = await get_visitor_journey(client_b_id, shared_aura_id, session, ip_address=shared_ip)
        assert journey_b["total_touches"] == 1
        assert "alpha" not in journey_b["pathway"].lower()
        assert "beta" in journey_b["pathway"].lower()


async def test_lead_intelligence_pageview_tenant_isolation():
    """
    Task 32.2: Enforce Tenant Scoping on Lead Intelligence PageViews.
    Assert that /api/v1/leads/{lead_id}/intelligence excludes pageviews
    from other tenants sharing the same device/cookie, and denies access to other tenants.
    """
    client_a_id = uuid4()
    client_b_id = uuid4()
    shared_aura_id = f"aura_lead_{uuid4().hex[:8]}"

    async with async_session_maker() as session:
        client_a = Client(id=client_a_id, company_name="Client Tenant A", domain="tenanta.co.za")
        client_b = Client(id=client_b_id, company_name="Client Tenant B", domain="tenantb.co.za")
        session.add_all([client_a, client_b])

        prospect_a = Prospect(
            id=uuid4(),
            client_id=client_a_id,
            aura_id=shared_aura_id,
            name="Alice Smith",
            email="alice@company.co.za",
        )
        session.add(prospect_a)

        # Visit & PageView for Client A
        visit_a = Visit(
            id=uuid4(),
            client_id=client_a_id,
            aura_id=shared_aura_id,
            ip_address="196.25.1.75",
            page_path="/tenanta/quote",
        )
        session.add(visit_a)
        pv_a = PageView(
            visit_id=visit_a.id,
            client_id=client_a_id,
            url_path="/tenanta/quote",
            duration=30,
            created_at=datetime.now(timezone.utc),
        )
        session.add(pv_a)

        # Visit & PageView for Client B on same aura_id
        visit_b = Visit(
            id=uuid4(),
            client_id=client_b_id,
            aura_id=shared_aura_id,
            ip_address="196.25.1.75",
            page_path="/tenantb/confidential",
        )
        session.add(visit_b)
        pv_b = PageView(
            visit_id=visit_b.id,
            client_id=client_b_id,
            url_path="/tenantb/confidential",
            duration=40,
            created_at=datetime.now(timezone.utc),
        )
        session.add(pv_b)

        await session.commit()

        # Create session cookies for User A and User B
        cookies_a = await create_user_session("user_a@tenanta.co.za", UserRole.SALES, client_id=client_a_id)
        cookies_b = await create_user_session("user_b@tenantb.co.za", UserRole.SALES, client_id=client_b_id)

    http_client = await get_test_client()

    # User A requests Lead A intelligence -> 200 OK
    resp_a = await http_client.get(
        f"/api/v1/leads/intelligence?aura_id={shared_aura_id}",
        cookies=cookies_a,
    )
    assert resp_a.status_code == 200
    data_a = resp_a.json()
    assert data_a["lead_profile"]["name"] == "Alice Smith"
    # Check that only Client A's pageviews are returned in forensic_trail
    urls = [pv["url"] for pv in data_a.get("forensic_trail", [])]
    assert any("tenanta" in u for u in urls)
    assert not any("tenantb" in u for u in urls)

    # User B attempts to access Lead A's shared aura_id -> 404 Not Found (isolated within Client B perimeter)
    resp_b = await http_client.get(
        f"/api/v1/leads/intelligence?aura_id={shared_aura_id}",
        cookies=cookies_b,
    )
    assert resp_b.status_code == 404
    assert "Lead signature not found" in resp_b.json()["detail"]

    # User without client_id attempts access -> 403 Forbidden
    cookies_unassigned = await create_user_session("unassigned@aura.co.za", UserRole.SALES, client_id=None)
    resp_unassigned = await http_client.get(
        f"/api/v1/leads/intelligence?aura_id={shared_aura_id}",
        cookies=cookies_unassigned,
    )
    assert resp_unassigned.status_code == 403
    assert "Forbidden" in resp_unassigned.json()["detail"]


async def test_tenant_slack_alert_routing():
    """
    Task 32.3: Tenant-Isolated Slack Alert Routing.
    Verifies that webhook routing resolves tenant-specific URLs
    and that alert dispatchers deliver alerts to the tenant webhook.
    """
    tenant_webhook = "https://hooks.slack.com/services/TEST/TENANT/WEBHOOK"
    client_id = uuid4()

    async with async_session_maker() as session:
        client = Client(
            id=client_id,
            company_name="Tenant Slack Test",
            domain="slacktest.co.za",
            notification_config={"slack_webhook_url": tenant_webhook},
        )
        session.add(client)
        await session.commit()

    # 1. Test resolution directly
    resolved_by_obj = await resolve_tenant_slack_webhook(client=client)
    assert resolved_by_obj == tenant_webhook

    resolved_by_id = await resolve_tenant_slack_webhook(client_id=client_id)
    assert resolved_by_id == tenant_webhook

    # 2. Test alert functions routing to tenant webhook
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_response = MagicMock(status_code=200)
        mock_response.raise_for_status = MagicMock()
        mock_post.return_value = mock_response

        # Test juristic alert
        mock_company = MagicMock(id=uuid4(), company_name="Heavy Mining SA", domain="heavymining.co.za", industry="Mining")
        journey = {"pathway": "Direct", "intent_summary": "Looking for heavy equipment"}
        await send_juristic_alert(mock_company, journey, str(client_id), client=client)

        assert mock_post.called
        assert mock_post.call_args[0][0] == tenant_webhook

    # 3. Test VSL completion alert
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_response = MagicMock(status_code=200)
        mock_response.raise_for_status = MagicMock()
        mock_post.return_value = mock_response

        await send_vsl_completion_alert("Heavy Mining SA", client_id, "aura_test_123", client=client)
        assert mock_post.called
        assert mock_post.call_args[0][0] == tenant_webhook


async def test_tenant_personal_vault_isolation():
    """
    Task 32.4: Tenant-Specific Personal Vault Integration (Airtable & Notion).
    Verifies that encrypted tenant credentials are decrypted and used for sync,
    and unconfigured clients safely exit without raising errors.
    """
    client_id = uuid4()
    raw_airtable_key = "pat_secret_airtable_token_12345"
    raw_notion_key = "secret_notion_api_token_67890"

    enc_airtable_key = encrypt_field(raw_airtable_key)
    enc_notion_key = encrypt_field(raw_notion_key)

    async with async_session_maker() as session:
        client = Client(
            id=client_id,
            company_name="Vault Tenant Corp",
            domain="vaultcorp.co.za",
            integrations={
                "airtable": {
                    "api_key": enc_airtable_key,
                    "base_id": "appTenantBase123",
                    "table_name": "TestLeads",
                },
                "notion": {
                    "token": enc_notion_key,
                    "database_id": "notion-db-tenant-abc",
                },
            },
        )
        session.add(client)
        await session.commit()

    prospect_data = {
        "client_id": client_id,
        "email": "lead@vaultcorp.co.za",
        "company_name_final": "Vault Partner Inc",
        "name": "Bob Builder",
    }
    journey = {
        "pathway": "Google Search -> Pricing -> Lead Form",
        "intent_summary": "High commercial intent",
    }

    # 1. Test Airtable Sync with tenant credentials
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_response = MagicMock(status_code=200)
        mock_post.return_value = mock_response

        await sync_to_airtable(client_id, prospect_data, journey)

        assert mock_post.called
        call_url = mock_post.call_args[0][0]
        call_headers = mock_post.call_args[1]["headers"]

        assert "appTenantBase123" in call_url
        assert "TestLeads" in call_url
        assert call_headers["Authorization"] == f"Bearer {raw_airtable_key}"

    # 2. Test Notion Sync with tenant credentials
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_response = MagicMock(status_code=200)
        mock_post.return_value = mock_response

        await sync_to_notion(client_id, prospect_data, journey)

        assert mock_post.called
        call_headers = mock_post.call_args[1]["headers"]
        call_json = mock_post.call_args[1]["json"]

        assert call_headers["Authorization"] == f"Bearer {raw_notion_key}"
        assert call_json["parent"]["database_id"] == "notion-db-tenant-abc"

    # 3. Test unconfigured client gracefully skips
    unconfigured_client_id = uuid4()
    async with async_session_maker() as session:
        unconfigured_client = Client(
            id=unconfigured_client_id,
            company_name="No Vault Client",
            domain="novault.co.za",
        )
        session.add(unconfigured_client)
        await session.commit()

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        await sync_to_airtable(unconfigured_client_id, prospect_data, journey)
        await sync_to_notion(unconfigured_client_id, prospect_data, journey)
        assert not mock_post.called
