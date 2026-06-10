import pytest
from uuid import uuid4
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.db import async_engine, async_session_maker
from app.models.client import Client, ClientCategory, SubscriptionStatus
from app.models.visit import Visit

pytestmark = pytest.mark.anyio

async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="http://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="http://test")

async def test_track_identity_endpoint():
    client_id = uuid4()
    aura_id = f"aura-id-{uuid4()}"

    async with async_session_maker() as session:
        # Seed Client
        client = Client(
            id=client_id,
            company_name=f"Identity Client",
            domain="identity-test.com",
            category=ClientCategory.INDUSTRIAL,
            client_product_description="Products",
            subscription_status=SubscriptionStatus.ACTIVE,
            payment_plan="enterprise",
            setup_fee_paid=True,
            is_active=True
        )
        session.add(client)

        # Seed Visit
        visit = Visit(
            client_id=client_id,
            aura_id=aura_id,
            ip_address="196.25.1.1",
            connection_type="corporate",
            is_b2b=True,
            high_intent=False,
            is_consented=False
        )
        session.add(visit)
        await session.commit()

    # Call /v1/track/identity via client
    async with await get_test_client() as client:
        payload = {
            "client_id": str(client_id),
            "aura_id": aura_id,
            "signature": {
                "canvas": "mock-canvas",
                "webgl": "mock-webgl",
                "network": {
                    "type": "wifi",
                    "downlink": 10,
                    "rtt": 50
                },
                "drift": 12,
                "screen": "1920x1080",
                "is_incognito": False,
                "tz": "Africa/Johannesburg"
            }
        }
        
        # Test with Content-Type application/json
        response = await client.post("/v1/track/identity", json=payload)
        print("RESPONSE STATUS:", response.status_code)
        print("RESPONSE JSON:", response.text)
        assert response.status_code == 200
        assert response.json() == {"status": "identity_locked"}

async def test_resolve_identity():
    client_id = uuid4()
    aura_id = f"aura-id-{uuid4()}"

    async with async_session_maker() as session:
        # Seed Client
        client = Client(
            id=client_id,
            company_name=f"Resolve Client",
            domain="resolve-test.com",
            category=ClientCategory.INDUSTRIAL,
            client_product_description="Products",
            subscription_status=SubscriptionStatus.ACTIVE,
            payment_plan="enterprise",
            setup_fee_paid=True,
            is_active=True
        )
        session.add(client)

        # Seed Visit
        visit = Visit(
            client_id=client_id,
            aura_id=aura_id,
            ip_address="196.25.1.1",
            connection_type="corporate",
            is_b2b=True,
            high_intent=False,
            is_consented=False
        )
        session.add(visit)
        await session.commit()

    async with await get_test_client() as client:
        payload = {
            "aura_id": aura_id,
            "signature": {
                "canvas": "mock-canvas",
                "webgl": "mock-webgl",
                "network": {
                    "type": "wifi",
                    "downlink": 10,
                    "rtt": 50
                },
                "drift": 12
            }
        }
        
        # Include client_id in headers or query params to satisfy get_async_session
        response = await client.post(
            f"/api/v1/identity/resolve?client_id={client_id}",
            json=payload
        )
        print("RESOLVE STATUS:", response.status_code)
        print("RESOLVE JSON:", response.text)
        assert response.status_code == 200
        assert response.json()["status"] == "recognized"

