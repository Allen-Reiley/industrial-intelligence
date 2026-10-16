# backend/tests/test_billing.py
import pytest
import uuid
from uuid import uuid4
import httpx
from unittest.mock import patch

from app.main import app
from app.core.config import settings
from app.db import async_session_maker
from app.models.client import Client
from app.models.user import User, UserRole
from sqlmodel import select

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

from app.models.user import User, Session as UserSession, UserRole
from datetime import datetime, timezone, timedelta

async def get_auth_cookies(session):
    test_email = "admin-billing-test@auraworks.co.za"
    stmt = select(User).where(User.email == test_email)
    res = await session.execute(stmt)
    user = res.scalars().first()
    if not user:
        user = User(
            id=f"admin_{uuid.uuid4().hex[:8]}",
            email=test_email,
            name="Admin Billing",
            role=UserRole.ADMIN,
            is_active=True
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    session_token = f"sess_billing_{uuid.uuid4().hex[:12]}"
    user_session = UserSession(
        id=f"sess_{uuid.uuid4().hex[:8]}",
        user_id=user.id,
        token=session_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    session.add(user_session)
    await session.commit()
    return {"better-auth.session_token": session_token}

async def test_billing_setup_unauthorized():
    client = await get_test_client()
    payload = {
        "client_id": str(uuid4()),
        "amount": 1000000,
        "redirect_url": "http://redirect.com",
        "billing_cycle": "monthly",
        "tc_accepted": True,
        "tc_accepted_ip": "127.0.0.1"
    }
    
    # 1. No authorization cookie should be rejected (returns 401 for get_current_admin)
    response = await client.post(
        f"{settings.API_V1_STR}/billing/setup",
        json=payload
    )
    assert response.status_code == 401

async def test_billing_setup_tc_rejected():
    client = await get_test_client()
    payload = {
        "client_id": str(uuid4()),
        "amount": 1000000,
        "redirect_url": "http://redirect.com",
        "billing_cycle": "monthly",
        "tc_accepted": False,
        "tc_accepted_ip": "127.0.0.1"
    }
    
    async with async_session_maker() as session:
        cookies = await get_auth_cookies(session)
    
    response = await client.post(
        f"{settings.API_V1_STR}/billing/setup",
        json=payload,
        cookies=cookies
    )
    assert response.status_code == 400
    assert "Terms & Conditions must be accepted" in response.json()["detail"]

async def test_billing_setup_client_not_found():
    client = await get_test_client()
    payload = {
        "client_id": str(uuid4()),
        "amount": 1000000,
        "redirect_url": "http://redirect.com",
        "billing_cycle": "monthly",
        "tc_accepted": True,
        "tc_accepted_ip": "127.0.0.1"
    }
    
    async with async_session_maker() as session:
        cookies = await get_auth_cookies(session)
    
    response = await client.post(
        f"{settings.API_V1_STR}/billing/setup",
        json=payload,
        cookies=cookies
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Client not found"

async def test_billing_setup_success():
    client = await get_test_client()
    client_uuid = uuid4()
    
    # Seed the client in the real DB
    async with async_session_maker() as session:
        client_row = Client(
            id=client_uuid,
            company_name="Setup Success Test Client",
            whitelisted_domains=["success.com"],
            custom_monthly_amount=1000000
        )
        session.add(client_row)
        await session.commit()
        cookies = await get_auth_cookies(session)

    payload = {
        "client_id": str(client_uuid),
        "amount": 1200000,
        "redirect_url": "http://redirect.com",
        "billing_cycle": "annual",
        "tc_accepted": True,
        "tc_accepted_ip": "192.168.1.55"
    }
    
    # Mock only Ikhokha Client call
    with patch("app.services.payment.IkhokhaClient.create_payment_intent") as mock_create_intent:
        mock_create_intent.return_value = {
            "intentId": "ik_intent_abc",
            "redirectUrl": "https://gateway.ikhokha.com/checkout/ik_intent_abc"
        }
        
        response = await client.post(
            f"{settings.API_V1_STR}/billing/setup",
            json=payload,
            cookies=cookies
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["intent_id"] == "ik_intent_abc"
        assert data["payment_url"] == "https://gateway.ikhokha.com/checkout/ik_intent_abc"
        assert data["amount"] == 1200000
        
        mock_create_intent.assert_called_once_with(
            client_id=client_uuid,
            amount=1200000,
            redirect_url="http://redirect.com"
        )
        
    # Verify client details in DB
    async with async_session_maker() as session:
        client_db = await session.get(Client, client_uuid)
        assert client_db.billing_cycle == "annual"
        assert client_db.subscription_status == "trial"
        assert client_db.is_active is True
        assert client_db.tc_accepted_at is not None
        assert client_db.tc_accepted_ip == "192.168.1.55"
        assert client_db.trial_ends_at is not None
        # Should be roughly 14 days from now
        from datetime import datetime, timezone, timedelta
        now = datetime.now(timezone.utc)
        diff = client_db.trial_ends_at.replace(tzinfo=timezone.utc) - now
        assert abs(diff.total_seconds() - 14 * 24 * 3600) < 60  # within a minute


async def test_client_patch_success():
    client = await get_test_client()
    client_uuid = uuid4()
    
    async with async_session_maker() as session:
        # Seed Client
        client_row = Client(
            id=client_uuid,
            company_name="Patch Test Client",
            whitelisted_domains=["patch.com"],
            custom_monthly_amount=1000000
        )
        session.add(client_row)
        await session.commit()
        cookies = await get_auth_cookies(session)

    payload = {
        "custom_monthly_amount": 1500000,
        "subscription_status": "active"
    }
    
    response = await client.patch(
        f"{settings.API_V1_STR}/clients/{client_uuid}",
        json=payload,
        cookies=cookies
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["custom_monthly_amount"] == 1500000
    assert data["subscription_status"] == "active"
    
    # Verify in DB
    async with async_session_maker() as session:
        client_db = await session.get(Client, client_uuid)
        assert client_db.custom_monthly_amount == 1500000
        assert client_db.subscription_status == "active"


async def test_get_transactions_success():
    client = await get_test_client()
    client_uuid = uuid4()
    
    async with async_session_maker() as session:
        # Seed Client
        client_row = Client(
            id=client_uuid,
            company_name="Tx History Partner",
            whitelisted_domains=["tx.com"]
        )
        session.add(client_row)
        
        # Seed 2 Transactions
        from app.models.transaction import Transaction, TransactionStatus
        tx1 = Transaction(
            client_id=client_uuid,
            amount=1000000,
            currency="ZAR",
            status=TransactionStatus.SUCCESSFUL,
            gateway_reference=f"ref_history_{uuid4()}",
            payment_method_token="token-h1"
        )
        tx2 = Transaction(
            client_id=client_uuid,
            amount=1200000,
            currency="ZAR",
            status=TransactionStatus.FAILED,
            gateway_reference=f"ref_history_{uuid4()}",
            payment_method_token="token-h2",
            error_message="Card declined"
        )
        session.add(tx1)
        session.add(tx2)
        await session.commit()
        cookies = await get_auth_cookies(session)

    response = await client.get(
        f"{settings.API_V1_STR}/billing/transactions?client_id={client_uuid}",
        cookies=cookies
    )
    
    assert response.status_code == 200
    txs = response.json()
    assert len(txs) == 2
    assert txs[0]["amount"] in (1000000, 1200000)
    assert txs[1]["amount"] in (1000000, 1200000)


async def test_simulate_webhook_success():
    client = await get_test_client()
    client_uuid = uuid4()
    
    async with async_session_maker() as session:
        # Seed Suspended Client
        client_row = Client(
            id=client_uuid,
            company_name="Webhook Simulation Partner",
            whitelisted_domains=["sim.com"],
            subscription_status="suspended",
            is_active=False,
            custom_monthly_amount=2000000
        )
        session.add(client_row)
        await session.commit()
        cookies = await get_auth_cookies(session)

    payload = {
        "client_id": str(client_uuid),
        "status": "successful",
        "amount": 2500000
    }
    
    response = await client.post(
        f"{settings.API_V1_STR}/billing/simulate-webhook",
        json=payload,
        cookies=cookies
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "transaction_id" in data
    
    # Verify DB state updates
    async with async_session_maker() as session:
        client_db = await session.get(Client, client_uuid)
        assert client_db.subscription_status == "active"
        assert client_db.is_active is True
        assert client_db.payment_method_token.startswith("mock_token_")
        
        # Verify transaction logged
        from sqlmodel import select
        from app.models.transaction import Transaction
        stmt = select(Transaction).where(Transaction.client_id == client_uuid)
        res_tx = await session.execute(stmt)
        txs = res_tx.scalars().all()
        assert len(txs) == 1
        assert txs[0].amount == 2500000
        assert txs[0].status == "successful"
