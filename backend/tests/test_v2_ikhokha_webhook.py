# backend/tests/test_v2_ikhokha_webhook.py
import hmac
import hashlib
import json
import pytest
import httpx
from datetime import datetime, timezone, timedelta
from uuid import uuid4
from sqlmodel import select

from app.main import app
from app.core.config import settings
from app.db import async_session_maker
from app.models.user import User, UserRole
from app.models.client import Client, SubscriptionStatus
from app.models.checkout_session import CheckoutSession, CheckoutSessionStatus
from app.models.transaction import Transaction, TransactionStatus

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

def compute_ikhokha_signature(body_bytes: bytes, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), body_bytes, hashlib.sha256).hexdigest()


@pytest.mark.asyncio
async def test_ikhokha_webhook_transitions_session_and_activates_client():
    """
    Integration test:
    Asserts that upon receiving a successful Ikhokha webhook:
    1. The associated CheckoutSession transitions from 'pending' to 'paid'.
    2. The Client is upgraded to ACTIVE and is_active=True.
    3. The Transaction record is created with sales_rep_id and checkout_session_id.
    """
    client = await get_test_client()
    now = datetime.now(timezone.utc)

    sales_rep_id = f"rep_{uuid4().hex[:8]}"
    client_id = uuid4()
    session_id = uuid4()
    gateway_ref = f"ik_tx_{uuid4().hex[:12]}"
    payment_token = f"pm_token_{uuid4().hex[:8]}"

    async with async_session_maker() as db_session:
        # Seed Sales Rep
        sales_rep = User(
            id=sales_rep_id,
            email=f"sales_{uuid4().hex[:6]}@auraworks.co.za",
            name="Closer Rep",
            role=UserRole.SALES,
            is_active=True
        )
        db_session.add(sales_rep)
        await db_session.commit()

        # Seed Client in PENDING/SUSPENDED status
        db_client = Client(
            id=client_id,
            company_name="Kruger Heavy Industries",
            contact_email="operations@krugerheavy.co.za",
            sales_rep_id=sales_rep_id,
            subscription_status=SubscriptionStatus.SUSPENDED,
            is_active=False
        )
        db_session.add(db_client)
        await db_session.commit()

        # Seed CheckoutSession in PENDING status
        checkout_sess = CheckoutSession(
            id=session_id,
            client_id=client_id,
            sales_rep_id=sales_rep_id,
            status=CheckoutSessionStatus.PENDING,
            amount=1850000,
            plan="category-leader",
            business_name="Kruger Heavy Industries",
            expires_at=now + timedelta(hours=24)
        )
        db_session.add(checkout_sess)
        await db_session.commit()

    # Prepare webhook payload
    payload = {
        "client_id": str(client_id),
        "amount": 1850000,
        "currency": "ZAR",
        "status": "successful",
        "gateway_reference": gateway_ref,
        "payment_method_token": payment_token
    }

    payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    secret = settings.IKHOKHA_WEBHOOK_SECRET or "ikhokha-secret"
    signature = compute_ikhokha_signature(payload_bytes, secret)

    headers = {
        "Content-Type": "application/json",
        "X-Ikhokha-Signature": signature
    }

    # Dispatch Webhook
    response = await client.post("/api/v1/webhook/ikhokha", content=payload_bytes, headers=headers)
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "success"

    # Verify Database State Transitions
    async with async_session_maker() as db_session:
        # 1. CheckoutSession must be PAID
        updated_sess = await db_session.get(CheckoutSession, session_id)
        assert updated_sess is not None
        assert updated_sess.status == CheckoutSessionStatus.PAID

        # 2. Client must be ACTIVE
        updated_client = await db_session.get(Client, client_id)
        assert updated_client is not None
        assert updated_client.subscription_status == SubscriptionStatus.ACTIVE
        assert updated_client.is_active is True
        assert updated_client.payment_method_token == payment_token

        # 3. Transaction record must be created with correct attribution
        tx_stmt = select(Transaction).where(Transaction.gateway_reference == gateway_ref)
        tx_res = await db_session.execute(tx_stmt)
        tx = tx_res.scalars().first()
        assert tx is not None
        assert tx.client_id == client_id
        assert tx.sales_rep_id == sales_rep_id
        assert tx.checkout_session_id == session_id
        assert tx.amount == 1850000
        assert tx.status == TransactionStatus.SUCCESSFUL

    # 4. Enforce Idempotency: Duplicate webhook delivery
    duplicate_response = await client.post("/api/v1/webhook/ikhokha", content=payload_bytes, headers=headers)
    assert duplicate_response.status_code == 200
    assert "Duplicate webhook delivery ignored" in duplicate_response.json()["message"]
