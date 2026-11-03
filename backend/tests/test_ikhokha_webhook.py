# backend/tests/test_ikhokha_webhook.py
import hmac
import hashlib
import json
import pytest
import httpx
from uuid import uuid4
from unittest.mock import patch

from app.main import app
from app.core.config import settings
from app.db import async_session_maker
from app.models.client import Client, SubscriptionStatus, ClientCategory
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

def compute_signature(payload: dict, secret: str) -> str:
    body = json.dumps(payload, separators=(',', ':')).encode("utf-8")
    return hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()

@pytest.mark.asyncio
async def test_ikhokha_webhook_missing_signature():
    client = await get_test_client()
    payload = {
        "client_id": str(uuid4()),
        "amount": 1000000,
        "currency": "ZAR",
        "status": "successful",
        "gateway_reference": f"ik_ref_{uuid4()}",
        "payment_method_token": "token-123"
    }
    
    response = await client.post("/api/v1/webhooks/ikhokha", json=payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Unauthorized: Missing Signature"

@pytest.mark.asyncio
async def test_ikhokha_webhook_invalid_signature():
    client = await get_test_client()
    payload = {
        "client_id": str(uuid4()),
        "amount": 1000000,
        "currency": "ZAR",
        "status": "successful",
        "gateway_reference": f"ik_ref_{uuid4()}",
        "payment_method_token": "token-123"
    }
    
    headers = {"X-Ikhokha-Signature": "invalid-signature-token"}
    response = await client.post("/api/v1/webhooks/ikhokha", json=payload, headers=headers)
    assert response.status_code == 403
    assert response.json()["detail"] == "Unauthorized: Invalid Signature"

@pytest.mark.asyncio
async def test_ikhokha_webhook_client_not_found():
    client = await get_test_client()
    payload = {
        "client_id": str(uuid4()),
        "amount": 1000000,
        "currency": "ZAR",
        "status": "successful",
        "gateway_reference": f"ik_ref_{uuid4()}",
        "payment_method_token": "token-123"
    }
    
    secret = "test-ikhokha-secret"
    sig = compute_signature(payload, secret)
    headers = {"X-Ikhokha-Signature": sig}
    
    with patch("app.api.v1.webhook.settings.IKHOKHA_WEBHOOK_SECRET", secret):
        response = await client.post("/api/v1/webhooks/ikhokha", json=payload, headers=headers)
        assert response.status_code == 404
        assert response.json()["detail"] == "Client not found"

@pytest.mark.asyncio
async def test_ikhokha_webhook_success():
    client_uuid = uuid4()
    company_name = f"Ikhokha Partner {uuid4()}"
    
    async with async_session_maker() as session:
        # Seed Client as Suspended/Inactive
        client_row = Client(
            id=client_uuid,
            company_name=company_name,
            domain="ikhokhapartner.co.za",
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.SUSPENDED,
            is_active=False
        )
        session.add(client_row)
        await session.commit()

    client = await get_test_client()
    gateway_ref = f"ik_ref_{uuid4()}"
    payload = {
        "client_id": str(client_uuid),
        "amount": 1500000,
        "currency": "ZAR",
        "status": "successful",
        "gateway_reference": gateway_ref,
        "payment_method_token": "secure-card-token-xyz"
    }
    
    secret = "test-ikhokha-secret"
    sig = compute_signature(payload, secret)
    headers = {"X-Ikhokha-Signature": sig}
    
    with patch("app.api.v1.webhook.settings.IKHOKHA_WEBHOOK_SECRET", secret):
        response = await client.post("/api/v1/webhooks/ikhokha", json=payload, headers=headers)
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        
        # Verify database updates
        async with async_session_maker() as session:
            # Check Client is active and token is stored
            client_db = await session.get(Client, client_uuid)
            assert client_db.subscription_status == SubscriptionStatus.ACTIVE
            assert client_db.is_active is True
            assert client_db.payment_method_token == "secure-card-token-xyz"
            
            # Check Transaction is recorded
            from sqlmodel import select
            stmt = select(Transaction).where(Transaction.gateway_reference == gateway_ref)
            res_tx = await session.execute(stmt)
            tx_db = res_tx.scalars().first()
            assert tx_db is not None
            assert tx_db.amount == 1500000
            assert tx_db.currency == "ZAR"
            assert tx_db.status == TransactionStatus.SUCCESSFUL
            assert tx_db.payment_method_token == "secure-card-token-xyz"

@pytest.mark.asyncio
async def test_ikhokha_webhook_idempotency():
    client_uuid = uuid4()
    company_name = f"Idempotency Partner {uuid4()}"
    
    async with async_session_maker() as session:
        client_row = Client(
            id=client_uuid,
            company_name=company_name,
            domain="idempotency.co.za",
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.SUSPENDED,
            is_active=False
        )
        session.add(client_row)
        await session.commit()

    client = await get_test_client()
    gateway_ref = f"ik_ref_{uuid4()}"
    payload = {
        "client_id": str(client_uuid),
        "amount": 2000000,
        "currency": "ZAR",
        "status": "successful",
        "gateway_reference": gateway_ref,
        "payment_method_token": "token-once"
    }
    
    secret = "test-ikhokha-secret"
    sig = compute_signature(payload, secret)
    headers = {"X-Ikhokha-Signature": sig}
    
    with patch("app.api.v1.webhook.settings.IKHOKHA_WEBHOOK_SECRET", secret):
        # First delivery
        response1 = await client.post("/api/v1/webhooks/ikhokha", json=payload, headers=headers)
        assert response1.status_code == 200
        
        # Second delivery (identical payload and signature)
        response2 = await client.post("/api/v1/webhooks/ikhokha", json=payload, headers=headers)
        assert response2.status_code == 200
        assert response2.json()["message"] == "Duplicate webhook delivery ignored"
        
        # Assert that only ONE transaction is in the database
        async with async_session_maker() as session:
            from sqlmodel import select
            stmt = select(Transaction).where(Transaction.gateway_reference == gateway_ref)
            res_tx = await session.execute(stmt)
            txs = res_tx.scalars().all()
            assert len(txs) == 1

@pytest.mark.asyncio
async def test_ikhokha_webhook_failed_transaction():
    client_uuid = uuid4()
    company_name = f"Failed Partner {uuid4()}"
    
    async with async_session_maker() as session:
        client_row = Client(
            id=client_uuid,
            company_name=company_name,
            domain="failedpartner.co.za",
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.SUSPENDED,
            is_active=False
        )
        session.add(client_row)
        await session.commit()

    client = await get_test_client()
    gateway_ref = f"ik_ref_{uuid4()}"
    payload = {
        "client_id": str(client_uuid),
        "amount": 1000000,
        "currency": "ZAR",
        "status": "failed",
        "gateway_reference": gateway_ref,
        "payment_method_token": "token-failed",
        "error_message": "Insufficient funds"
    }
    
    secret = "test-ikhokha-secret"
    sig = compute_signature(payload, secret)
    headers = {"X-Ikhokha-Signature": sig}
    
    with patch("app.api.v1.webhook.settings.IKHOKHA_WEBHOOK_SECRET", secret):
        response = await client.post("/api/v1/webhooks/ikhokha", json=payload, headers=headers)
        assert response.status_code == 200
        
        async with async_session_maker() as session:
            # Client remains suspended and inactive
            client_db = await session.get(Client, client_uuid)
            assert client_db.subscription_status == SubscriptionStatus.SUSPENDED
            assert client_db.is_active is False
            
            # Transaction is logged with FAILED status
            from sqlmodel import select
            stmt = select(Transaction).where(Transaction.gateway_reference == gateway_ref)
            res_tx = await session.execute(stmt)
            tx_db = res_tx.scalars().first()
            assert tx_db is not None
            assert tx_db.status == TransactionStatus.FAILED
            assert tx_db.error_message == "Insufficient funds"
