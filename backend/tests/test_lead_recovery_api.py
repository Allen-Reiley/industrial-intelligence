# backend/tests/test_lead_recovery_api.py
import pytest
import httpx
from unittest.mock import patch, AsyncMock
from uuid import uuid4
from datetime import datetime, timezone

from app.main import app
from app.db import async_session_maker, async_engine
from app.models.user import User, Session as UserSession, UserRole
from app.models.prospect import Prospect
from app.models.client import Client
from sqlmodel import SQLModel

pytestmark = pytest.mark.anyio

@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"

@pytest.fixture(autouse=True)
async def setup_db():
    if async_engine:
        async with async_engine.begin() as conn:
            target_tables = [
                Client.__table__,
                User.__table__,
                UserSession.__table__,
                Prospect.__table__
            ]
            await conn.run_sync(lambda sync_conn: SQLModel.metadata.create_all(sync_conn, tables=target_tables))
    yield

async def get_test_client():
    transport = httpx.ASGITransport(app=app)
    return httpx.AsyncClient(transport=transport, base_url="http://test")

@pytest.mark.asyncio
async def test_lead_recovery_endpoint_unauthorized():
    """Verify endpoint rejects unauthenticated requests."""
    client = await get_test_client()
    resp = await client.post("/api/v1/admin/leads/recover", json={"dry_run": True})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_lead_recovery_endpoint_forbidden_for_sales():
    """Verify non-admin roles cannot trigger lead recovery."""
    client = await get_test_client()
    sales_id = f"sales_{uuid4().hex[:8]}"
    sales_token = f"tok_{uuid4().hex[:12]}"

    async with async_session_maker() as session:
        sales_user = User(
            id=sales_id,
            email=f"sales_{uuid4().hex[:6]}@auraworks.co.za",
            name="Sales Rep",
            role=UserRole.SALES,
            is_active=True
        )
        sales_sess = UserSession(
            id=f"sess_{uuid4().hex[:8]}",
            token=sales_token,
            user_id=sales_id,
            expires_at=datetime.now(timezone.utc) + pytest.importorskip("datetime").timedelta(days=1)
        )
        session.add(sales_user)
        session.add(sales_sess)
        await session.commit()

    resp = await client.post(
        "/api/v1/admin/leads/recover",
        json={"dry_run": True},
        cookies={"better-auth.session_token": sales_token}
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_lead_recovery_endpoint_admin_success():
    """Verify admin can trigger dry-run lead recovery."""
    client = await get_test_client()
    admin_id = f"adm_{uuid4().hex[:8]}"
    admin_token = f"adm_tok_{uuid4().hex[:12]}"
    client_id = uuid4()

    async with async_session_maker() as session:
        # Create client tenant anchor
        test_client = Client(
            id=client_id,
            company_name="Mining Tech Inc",
            domain="miningtech.co.za"
        )
        session.add(test_client)

        admin_user = User(
            id=admin_id,
            email=f"admin_{uuid4().hex[:6]}@auraworks.co.za",
            name="Executive Admin",
            role=UserRole.ADMIN,
            is_active=True
        )
        admin_sess = UserSession(
            id=f"sess_{uuid4().hex[:8]}",
            token=admin_token,
            user_id=admin_id,
            expires_at=datetime.now(timezone.utc) + pytest.importorskip("datetime").timedelta(days=1)
        )
        session.add(admin_user)
        session.add(admin_sess)

        # Create unbooked test prospect
        prospect = Prospect(
            id=uuid4(),
            client_id=client_id,
            email="ops_director@miningtech.co.za",
            name="Ops Director",
            status="demo_requested"
        )
        session.add(prospect)
        await session.commit()

    resp = await client.post(
        "/api/v1/admin/leads/recover",
        json={
            "dry_run": True,
            "only_unbooked": True,
            "client_id": str(client_id)
        },
        cookies={"better-auth.session_token": admin_token}
    )

    assert resp.status_code == 200
    data = resp.json()
    assert data["dry_run"] is True
    assert data["booking_link"] == "https://cal.com/reitumetse-sethabela/30min"
    assert data["total_candidates"] >= 1
    assert data["sent"] >= 1
