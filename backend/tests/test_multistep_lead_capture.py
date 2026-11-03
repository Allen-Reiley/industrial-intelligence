# backend/tests/test_multistep_lead_capture.py
import pytest
from uuid import uuid4
import httpx
from sqlmodel import select

from app.main import app
from app.db import async_session_maker
from app.models.client import Client, SubscriptionStatus
from app.models.visit import Visit
from app.models.prospect import Prospect
from app.core.security import decrypt_field

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


async def test_submitting_step1_persists_prospect_without_email():
    """
    Task 35.1.3: Multi-step lead capture verification.
    Asserts that submitting Step 1 of the lead form (phone + first_name + last_name only,
    omitting email) creates a Prospect record immediately so contact data is not lost
    if the visitor abandons at Step 2.
    """
    client_id = uuid4()
    aura_id = f"aura_multistep_{uuid4().hex[:8]}"

    async with async_session_maker() as session:
        client = Client(
            id=client_id,
            company_name="MultiStep Lead Corp",
            whitelisted_domains=["multistep.co.za"],
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client)

        visit = Visit(
            client_id=client_id,
            aura_id=aura_id,
            ip_address="196.25.1.55",
            connection_type="corporate",
            is_b2b=True
        )
        session.add(visit)
        await session.commit()

    http_client = await get_test_client()

    # Step 1 submission: Name + phone only
    payload_step1 = {
        "client_id": str(client_id),
        "aura_id": aura_id,
        "first_name": "Thabo",
        "last_name": "Mokoena",
        "phone": "+27839876543"
    }
    resp1 = await http_client.post(
        "/v1/track/identity",
        json=payload_step1,
        headers={"Origin": "https://multistep.co.za"}
    )
    assert resp1.status_code == 200
    assert resp1.json()["lead_captured"] is True

    # Verify Prospect in database
    async with async_session_maker() as session:
        stmt = select(Prospect).where(
            Prospect.client_id == client_id,
            Prospect.aura_id == aura_id
        )
        prospect = (await session.execute(stmt)).scalars().first()
        assert prospect is not None
        assert prospect.name == "Thabo Mokoena"
        assert prospect.phone_encrypted is not None
        assert decrypt_field(prospect.phone_encrypted) == "+27839876543"
        # Email was not supplied in Step 1, generated unverified placeholder
        assert "@unverified.aura" in prospect.email

    # Step 2 submission: User adds corporate email and company name
    payload_step2 = {
        "client_id": str(client_id),
        "aura_id": aura_id,
        "email": "thabo@sasol.com",
        "company_name": "Sasol Industrial",
        "department": "Engineering"
    }
    resp2 = await http_client.post(
        "/v1/track/identity",
        json=payload_step2,
        headers={"Origin": "https://multistep.co.za"}
    )
    assert resp2.status_code == 200
    assert resp2.json()["lead_captured"] is True

    # Verify existing Prospect updated in place without creating a duplicate
    async with async_session_maker() as session:
        stmt = select(Prospect).where(Prospect.client_id == client_id)
        prospects = (await session.execute(stmt)).scalars().all()
        assert len(prospects) == 1
        updated_prospect = prospects[0]
        assert updated_prospect.email == "thabo@sasol.com"
        assert updated_prospect.company_name_raw == "Sasol Industrial"
        assert updated_prospect.department == "Engineering"
        # Preserved Step 1 phone
        assert decrypt_field(updated_prospect.phone_encrypted) == "+27839876543"
