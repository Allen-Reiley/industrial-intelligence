# backend/tests/test_v2_rbac_and_scripts.py
import pytest
import httpx
from datetime import datetime, timezone, timedelta
from uuid import uuid4
from sqlmodel import select

from app.main import app
from app.db import async_session_maker
from app.models.user import User, Session as UserSession, UserRole
from app.models.client import Client, SubscriptionStatus
from app.models.checkout_session import CheckoutSession, CheckoutSessionStatus

pytestmark = pytest.mark.anyio

@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"

async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="http://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="http://test")


@pytest.mark.asyncio
async def test_script_generation_rbac_and_gating():
    """
    Asserts:
    1. Anonymous request to /api/v1/scripts/{client_id} returns 401.
    2. 'sales' role receives 403 Forbidden.
    3. 'admin' role receives 200 OK ONLY if client is ACTIVE or TRIAL.
    4. 'admin' role receives 400 Bad Request if client is SUSPENDED or PENDING.
    """
    client = await get_test_client()
    admin_id = f"admin_{uuid4().hex[:8]}"
    sales_id = f"sales_{uuid4().hex[:8]}"

    active_client_id = uuid4()
    trial_client_id = uuid4()
    suspended_client_id = uuid4()

    async with async_session_maker() as session:
        admin_token = f"admin_tok_{uuid4().hex[:12]}"
        sales_token = f"sales_tok_{uuid4().hex[:12]}"

        # 1. Seed Admin User and Session
        admin_user = User(
            id=admin_id,
            email=f"admin_{uuid4().hex[:6]}@auraworks.co.za",
            name="Super Admin",
            role=UserRole.ADMIN,
            is_active=True
        )
        admin_session = UserSession(
            id=f"sess_{uuid4().hex[:8]}",
            user_id=admin_id,
            token=admin_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )

        # 2. Seed Sales Rep User and Session
        sales_user = User(
            id=sales_id,
            email=f"sales_{uuid4().hex[:6]}@auraworks.co.za",
            name="Field Rep",
            role=UserRole.SALES,
            is_active=True
        )
        sales_session = UserSession(
            id=f"sess_{uuid4().hex[:8]}",
            user_id=sales_id,
            token=sales_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        session.add_all([admin_user, sales_user])
        await session.commit()
        session.add_all([admin_session, sales_session])
        await session.commit()

        # 3. Seed Clients with varying statuses
        c_active = Client(
            id=active_client_id,
            company_name="Active Tech Corp",
            contact_email="it@activetech.com",
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        c_trial = Client(
            id=trial_client_id,
            company_name="Trial Systems Pty",
            contact_email="it@trialsys.com",
            subscription_status=SubscriptionStatus.TRIAL,
            is_active=True
        )
        c_suspended = Client(
            id=suspended_client_id,
            company_name="Pending Inc",
            contact_email="it@pending.com",
            subscription_status=SubscriptionStatus.SUSPENDED,
            is_active=False
        )
        session.add_all([c_active, c_trial, c_suspended])
        await session.commit()

    # Step 1: Anonymous request -> Expect 401
    resp_anon = await client.get(f"/api/v1/scripts/{active_client_id}")
    assert resp_anon.status_code == 401

    # Step 2: Sales Rep request -> Expect 403 Forbidden
    sales_headers = {"Authorization": f"Bearer {sales_token}"}
    resp_sales = await client.get(f"/api/v1/scripts/{active_client_id}", headers=sales_headers)
    assert resp_sales.status_code == 403
    assert "administrative privileges required" in resp_sales.json()["detail"].lower()

    # Step 3: Admin request for ACTIVE client -> Expect 200 OK with snippet
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    resp_admin_active = await client.get(f"/api/v1/scripts/{active_client_id}", headers=admin_headers)
    assert resp_admin_active.status_code == 200
    data_active = resp_admin_active.json()
    assert data_active["status"] == "success"
    assert f'data-client-id="{active_client_id}"' in data_active["snippet"]
    assert "cdn.auraworks.co.za/aura.js" in data_active["snippet"]

    # Step 4: Admin request for TRIAL client -> Expect 200 OK with snippet
    resp_admin_trial = await client.get(f"/api/v1/scripts/{trial_client_id}", headers=admin_headers)
    assert resp_admin_trial.status_code == 200
    assert f'data-client-id="{trial_client_id}"' in resp_admin_trial.json()["snippet"]

    # Step 5: Admin request for SUSPENDED client -> Expect 400 Bad Request (Locked)
    resp_admin_susp = await client.get(f"/api/v1/scripts/{suspended_client_id}", headers=admin_headers)
    assert resp_admin_susp.status_code == 400
    assert "locked" in resp_admin_susp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_sales_rep_bounded_attribution_and_metrics():
    """
    Asserts:
    1. Sales rep A can only view their own checkout links and metrics.
    2. Sales rep cannot access other reps' checkout links or metrics.
    3. Sales rep is forbidden (403) from accessing admin personnel endpoints.
    4. Admin can access global overview and personnel management.
    """
    client = await get_test_client()
    rep_a_id = f"rep_a_{uuid4().hex[:8]}"
    rep_b_id = f"rep_b_{uuid4().hex[:8]}"
    admin_id = f"admin_p_{uuid4().hex[:8]}"

    now = datetime.now(timezone.utc)
    c_a_id = uuid4()
    c_b_id = uuid4()

    tok_a = f"tok_a_{uuid4().hex[:12]}"
    tok_b = f"tok_b_{uuid4().hex[:12]}"
    tok_admin = f"tok_adm_{uuid4().hex[:12]}"

    async with async_session_maker() as session:
        # Users
        rep_a = User(id=rep_a_id, email=f"repa_{uuid4().hex[:6]}@auraworks.co.za", name="Rep Alpha", role=UserRole.SALES, is_active=True)
        rep_b = User(id=rep_b_id, email=f"repb_{uuid4().hex[:6]}@auraworks.co.za", name="Rep Beta", role=UserRole.SALES, is_active=True)
        admin = User(id=admin_id, email=f"admin_{uuid4().hex[:6]}@auraworks.co.za", name="Admin Chief", role=UserRole.ADMIN, is_active=True)
        sess_a = UserSession(id=f"sess_{uuid4().hex[:8]}", user_id=rep_a_id, token=tok_a, expires_at=datetime.now(timezone.utc) + timedelta(days=7))
        sess_b = UserSession(id=f"sess_{uuid4().hex[:8]}", user_id=rep_b_id, token=tok_b, expires_at=datetime.now(timezone.utc) + timedelta(days=7))
        sess_admin = UserSession(id=f"sess_{uuid4().hex[:8]}", user_id=admin_id, token=tok_admin, expires_at=datetime.now(timezone.utc) + timedelta(days=7))
        session.add_all([rep_a, rep_b, admin])
        await session.commit()
        session.add_all([sess_a, sess_b, sess_admin])
        await session.commit()

        # Clients
        client_a = Client(id=c_a_id, company_name="Alpha Client", sales_rep_id=rep_a_id, subscription_status=SubscriptionStatus.ACTIVE)
        client_b = Client(id=c_b_id, company_name="Beta Client", sales_rep_id=rep_b_id, subscription_status=SubscriptionStatus.ACTIVE)
        session.add_all([client_a, client_b])
        await session.commit()

        # Rep A checkout sessions: 1 paid (R10,000), 1 pending (R18,500)
        sess_a1 = CheckoutSession(client_id=c_a_id, sales_rep_id=rep_a_id, status=CheckoutSessionStatus.PAID, amount=1000000, plan="monthly", expires_at=now + timedelta(hours=10))
        sess_a2 = CheckoutSession(client_id=c_a_id, sales_rep_id=rep_a_id, status=CheckoutSessionStatus.PENDING, amount=1850000, plan="category-leader", expires_at=now + timedelta(hours=15))

        # Rep B checkout sessions: 1 paid (R32,000)
        sess_b1 = CheckoutSession(client_id=c_b_id, sales_rep_id=rep_b_id, status=CheckoutSessionStatus.PAID, amount=3200000, plan="enterprise-corridor", expires_at=now + timedelta(hours=12))

        session.add_all([sess_a1, sess_a2, sess_b1])
        await session.commit()

    headers_a = {"Authorization": f"Bearer {tok_a}"}
    headers_b = {"Authorization": f"Bearer {tok_b}"}
    headers_admin = {"Authorization": f"Bearer {tok_admin}"}

    # 1. Rep A fetches checkouts -> Must contain 2 sessions, none belonging to Rep B
    resp_checkouts_a = await client.get("/api/v1/sales/checkouts", headers=headers_a)
    assert resp_checkouts_a.status_code == 200
    sessions_a = resp_checkouts_a.json()
    rep_a_session_rep_ids = [s["sales_rep_id"] for s in sessions_a]
    assert all(r_id == rep_a_id for r_id in rep_a_session_rep_ids)
    assert len(sessions_a) == 2

    # 2. Rep A fetches metrics -> Total 2, Paid 1, Pending 1, Pipeline R10,000 (1000000 cents)
    resp_metrics_a = await client.get("/api/v1/sales/metrics", headers=headers_a)
    assert resp_metrics_a.status_code == 200
    metrics_a = resp_metrics_a.json()
    assert metrics_a["total_links_generated"] == 2
    assert metrics_a["successful_conversions"] == 1
    assert metrics_a["pending_links"] == 1
    assert metrics_a["active_pipeline_cents"] == 1000000
    assert metrics_a["conversion_rate_percentage"] == 50.0

    # 3. Rep A attempts to access admin personnel management -> Expect 403 Forbidden
    resp_admin_forbidden = await client.get("/api/v1/admin/users", headers=headers_a)
    assert resp_admin_forbidden.status_code == 403

    # 4. Admin accesses admin personnel management -> Expect 200 OK
    resp_admin_users = await client.get("/api/v1/admin/users", headers=headers_admin)
    assert resp_admin_users.status_code == 200
    users_list = resp_admin_users.json()
    user_ids = [u["id"] for u in users_list]
    assert rep_a_id in user_ids
    assert rep_b_id in user_ids

    # 5. Admin updates Rep A role/status
    resp_patch = await client.patch(
        f"/api/v1/admin/users/{rep_a_id}",
        json={"name": "Senior Rep Alpha", "role": "admin"},
        headers=headers_admin
    )
    assert resp_patch.status_code == 200
    assert resp_patch.json()["user"]["name"] == "Senior Rep Alpha"
    assert resp_patch.json()["user"]["role"] == "admin"
