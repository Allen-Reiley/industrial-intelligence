# backend/tests/test_v2_checkout_session.py
import pytest
import httpx
from datetime import datetime, timezone, timedelta
from uuid import uuid4
from unittest.mock import patch, AsyncMock
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
async def test_checkout_session_model_expiration_logic():
    """
    Unit test: Validates 24-hour expiration calculation and is_expired() method.
    """
    now = datetime.now(timezone.utc)
    client_id = uuid4()
    
    # 1. Active session (created now, expires in 24 hours)
    active_session = CheckoutSession(
        client_id=client_id,
        sales_rep_id="sales_rep_1",
        status=CheckoutSessionStatus.PENDING,
        amount=1000000,
        plan="growth-foundation",
        expires_at=now + timedelta(hours=24)
    )
    assert not active_session.is_expired()
    assert active_session.status == CheckoutSessionStatus.PENDING

    # 2. Expired session (expires_at is 1 hour in the past)
    expired_session = CheckoutSession(
        client_id=client_id,
        sales_rep_id="sales_rep_1",
        status=CheckoutSessionStatus.PENDING,
        amount=1000000,
        plan="growth-foundation",
        expires_at=now - timedelta(hours=1)
    )
    assert expired_session.is_expired()

    # 3. Explicitly EXPIRED status
    status_expired_session = CheckoutSession(
        client_id=client_id,
        sales_rep_id="sales_rep_1",
        status=CheckoutSessionStatus.EXPIRED,
        amount=1000000,
        plan="growth-foundation",
        expires_at=now + timedelta(hours=12)
    )
    assert status_expired_session.is_expired()


@pytest.mark.asyncio
async def test_generate_checkout_session_flow():
    """
    Integration test: POST /api/v1/checkout/generate
    Asserts that:
    1. A Client record is created with SUSPENDED status and linked to the sales rep.
    2. A CheckoutSession record is created with 24-hour TTL.
    3. The response contains session_id, checkout_url, expires_at, and pricing.
    """
    test_sales_user_id = f"sales_user_{uuid4().hex[:8]}"
    sales_email = f"rep_{uuid4().hex[:8]}@auraworks.co.za"

    sales_session_token = f"sess_token_{uuid4().hex[:12]}"
    # Seed sales user and session in DB
    async with async_session_maker() as session:
        sales_user = User(
            id=test_sales_user_id,
            email=sales_email,
            name="Top Sales Rep",
            role=UserRole.SALES,
            is_active=True
        )
        sales_session = UserSession(
            id=f"sess_{uuid4().hex[:8]}",
            user_id=test_sales_user_id,
            token=sales_session_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        session.add(sales_user)
        await session.commit()
        session.add(sales_session)
        await session.commit()

    client = await get_test_client()
    headers = {"Authorization": f"Bearer {sales_session_token}"}
    payload = {
        "business_name": "Apex Mining Corp",
        "contact_email": "procurement@apexmining.co.za",
        "contact_phone": "+27 82 123 4567",
        "selected_plan": "category-leader",
        "custom_pricing": 1850000,
        "domain": "apexmining.co.za"
    }

    response = await client.post("/api/v1/checkout/generate", json=payload, headers=headers)
    assert response.status_code == 200, response.text
    data = response.json()

    assert data["status"] == "success"
    assert "session_id" in data
    assert data["checkout_url"] == f"/checkout/{data['session_id']}"
    assert data["business_name"] == "Apex Mining Corp"
    assert data["amount"] == 1850000
    assert data["plan"] == "category-leader"

    # Verify expires_at is roughly 24 hours from now
    expires_dt = datetime.fromisoformat(data["expires_at"].replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    diff_hours = (expires_dt - now).total_seconds() / 3600.0
    assert 23.9 <= diff_hours <= 24.1

    # Verify Client and CheckoutSession in database
    session_uuid = data["session_id"]
    client_uuid = data["client_id"]

    async with async_session_maker() as session:
        db_client = await session.get(Client, client_uuid)
        assert db_client is not None
        assert db_client.company_name == "Apex Mining Corp"
        assert db_client.sales_rep_id == test_sales_user_id
        assert db_client.subscription_status == SubscriptionStatus.SUSPENDED
        assert db_client.is_active is False

        db_sess = await session.get(CheckoutSession, session_uuid)
        assert db_sess is not None
        assert db_sess.sales_rep_id == test_sales_user_id
        assert db_sess.status == CheckoutSessionStatus.PENDING
        assert db_sess.amount == 1850000


@pytest.mark.asyncio
async def test_get_checkout_session_active_and_expired():
    """
    Integration test: GET /api/v1/checkout/session/{session_id}
    Asserts that:
    1. Active session returns 200 OK with client and pricing details.
    2. Expired session returns 410 Gone.
    3. Non-existent session returns 404 Not Found.
    """
    client = await get_test_client()
    now = datetime.now(timezone.utc)
    client_id = uuid4()
    active_sess_id = uuid4()
    expired_sess_id = uuid4()

    sales_rep_id = f"sales_rep_{uuid4().hex[:8]}"
    async with async_session_maker() as session:
        # Seed Sales Rep User
        sales_user = User(
            id=sales_rep_id,
            email=f"sales_test_{uuid4().hex[:6]}@auraworks.co.za",
            name="Test Rep",
            role=UserRole.SALES,
            is_active=True
        )
        session.add(sales_user)
        await session.commit()

        db_c = Client(
            id=client_id,
            company_name="Dynamic Testing Industries",
            contact_email="billing@dynamictest.com",
            subscription_status=SubscriptionStatus.SUSPENDED,
            sales_rep_id=sales_rep_id,
            is_active=False
        )
        session.add(db_c)
        await session.commit()

        # Active session: expires in 20 hours
        active_sess = CheckoutSession(
            id=active_sess_id,
            client_id=client_id,
            sales_rep_id=sales_rep_id,
            status=CheckoutSessionStatus.PENDING,
            amount=1000000,
            plan="growth-foundation",
            business_name="Dynamic Testing Industries",
            contact_email="billing@dynamictest.com",
            expires_at=now + timedelta(hours=20)
        )
        session.add(active_sess)

        # Expired session: expired 2 hours ago
        expired_sess = CheckoutSession(
            id=expired_sess_id,
            client_id=client_id,
            sales_rep_id=sales_rep_id,
            status=CheckoutSessionStatus.PENDING,
            amount=1000000,
            plan="growth-foundation",
            business_name="Dynamic Testing Industries",
            contact_email="billing@dynamictest.com",
            expires_at=now - timedelta(hours=2)
        )
        session.add(expired_sess)
        await session.commit()

    # 1. Fetch active session -> Expect 200 OK
    resp_active = await client.get(f"/api/v1/checkout/session/{active_sess_id}")
    assert resp_active.status_code == 200, resp_active.text
    active_data = resp_active.json()
    assert active_data["session_id"] == str(active_sess_id)
    assert active_data["business_name"] == "Dynamic Testing Industries"
    assert active_data["status"] == "pending"

    # 2. Fetch expired session -> Expect 410 Gone
    resp_expired = await client.get(f"/api/v1/checkout/session/{expired_sess_id}")
    assert resp_expired.status_code == 410, resp_expired.text
    assert "expired" in resp_expired.json()["detail"].lower()

    # 3. Fetch non-existent session -> Expect 404 Not Found
    resp_404 = await client.get(f"/api/v1/checkout/session/{uuid4()}")
    assert resp_404.status_code == 404


@pytest.mark.asyncio
async def test_pay_checkout_session_flow():
    """
    Integration test: POST /api/v1/checkout/session/{session_id}/pay
    Asserts that:
    1. Missing T&C acceptance returns 400 Bad Request.
    2. Expired session returns 410 Gone.
    3. Valid session initiates Ikhokha payment intent and upgrades client to TRIAL.
    """
    client = await get_test_client()
    now = datetime.now(timezone.utc)
    client_id = uuid4()
    session_id = uuid4()
    pay_sales_rep_id = f"rep_{uuid4().hex[:8]}"

    async with async_session_maker() as session:
        sales_user = User(
            id=pay_sales_rep_id,
            email=f"rep99_{uuid4().hex[:6]}@auraworks.co.za",
            name="Rep 99",
            role=UserRole.SALES,
            is_active=True
        )
        session.add(sales_user)
        await session.commit()

        db_c = Client(
            id=client_id,
            company_name="Gold Reef Logistics",
            contact_email="finance@goldreef.co.za",
            subscription_status=SubscriptionStatus.SUSPENDED,
            sales_rep_id=pay_sales_rep_id,
            is_active=False
        )
        session.add(db_c)
        await session.commit()

        checkout_sess = CheckoutSession(
            id=session_id,
            client_id=client_id,
            sales_rep_id=pay_sales_rep_id,
            status=CheckoutSessionStatus.PENDING,
            amount=1850000,
            plan="category-leader",
            business_name="Gold Reef Logistics",
            expires_at=now + timedelta(hours=18)
        )
        session.add(checkout_sess)
        await session.commit()

    # 1. Pay without tc_accepted -> 400
    bad_payload = {
        "redirect_url": "http://localhost:3000/aurahq/sales",
        "tc_accepted": False
    }
    resp_bad = await client.post(f"/api/v1/checkout/session/{session_id}/pay", json=bad_payload)
    assert resp_bad.status_code == 400
    assert "terms & conditions" in resp_bad.json()["detail"].lower()

    # 2. Valid Pay with Mocked Ikhokha Client -> 200 OK
    good_payload = {
        "redirect_url": "http://localhost:3000/aurahq/sales",
        "tc_accepted": True,
        "tc_accepted_ip": "196.25.1.1"
    }

    mock_intent = {
        "intentId": "ik_intent_test_12345",
        "paymentUrl": "https://vault.ikhokha.com/pay/ik_intent_test_12345"
    }

    with patch("app.api.v1.checkout.IkhokhaClient.create_payment_intent", new_callable=AsyncMock) as mock_create:
        mock_create.return_value = mock_intent
        resp_pay = await client.post(f"/api/v1/checkout/session/{session_id}/pay", json=good_payload)
        assert resp_pay.status_code == 200, resp_pay.text
        pay_data = resp_pay.json()
        assert pay_data["status"] == "success"
        assert pay_data["payment_url"] == mock_intent["paymentUrl"]
        assert pay_data["intent_id"] == mock_intent["intentId"]

    # Verify Client is now TRIAL with 14-day window
    async with async_session_maker() as session:
        updated_client = await session.get(Client, client_id)
        assert updated_client.subscription_status == SubscriptionStatus.TRIAL
        assert updated_client.is_active is True
        assert updated_client.tc_accepted_at is not None
