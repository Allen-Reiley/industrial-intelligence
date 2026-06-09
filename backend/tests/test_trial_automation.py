import pytest
from datetime import datetime, timezone, timedelta
from uuid import uuid4
from unittest.mock import patch, AsyncMock
from sqlmodel import select

from app.main import app
from app.core.config import settings
from app.db import async_session_maker
from app.models.client import Client, SubscriptionStatus
from app.core.scheduler import check_trial_expirations

pytestmark = pytest.mark.anyio

@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"

async def get_test_client():
    import httpx
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="http://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="http://test")


async def test_check_trial_expirations_flow():
    """
    Asserts that warning email is sent for trials expiring in <= 48h,
    and sets trial_warning_sent = True, while respecting cancellation requests
    and not duplicate-sending.
    """
    now = datetime.now(timezone.utc)
    
    # 1. Trial expiring in 47 hours (should get warning)
    client1_uuid = uuid4()
    # 2. Trial expiring in 50 hours (should NOT get warning yet)
    client2_uuid = uuid4()
    # 3. Trial expiring in 40 hours but warning already sent (should NOT get warning)
    client3_uuid = uuid4()
    # 4. Trial expiring in 40 hours but cancellation requested (should NOT get warning)
    client4_uuid = uuid4()
    
    async with async_session_maker() as session:
        c1 = Client(
            id=client1_uuid,
            company_name="Expiring Soon Client",
            domain="expiringsoon.com",
            subscription_status=SubscriptionStatus.TRIAL,
            trial_ends_at=now + timedelta(hours=47),
            trial_warning_sent=False,
            cancellation_requested=False,
            is_active=True
        )
        c2 = Client(
            id=client2_uuid,
            company_name="Expiring Later Client",
            domain="expiringlater.com",
            subscription_status=SubscriptionStatus.TRIAL,
            trial_ends_at=now + timedelta(hours=50),
            trial_warning_sent=False,
            cancellation_requested=False,
            is_active=True
        )
        c3 = Client(
            id=client3_uuid,
            company_name="Warning Already Sent Client",
            domain="alreadysent.com",
            subscription_status=SubscriptionStatus.TRIAL,
            trial_ends_at=now + timedelta(hours=40),
            trial_warning_sent=True,
            cancellation_requested=False,
            is_active=True
        )
        c4 = Client(
            id=client4_uuid,
            company_name="Cancelled Client",
            domain="cancelled.com",
            subscription_status=SubscriptionStatus.TRIAL,
            trial_ends_at=now + timedelta(hours=40),
            trial_warning_sent=False,
            cancellation_requested=True,
            is_active=True
        )
        session.add(c1)
        session.add(c2)
        session.add(c3)
        session.add(c4)
        await session.commit()

    with patch("app.services.email.send_trial_warning_email", return_value=True) as mock_send_email:
        await check_trial_expirations()
        
        # Should only call send_trial_warning_email once (for client 1)
        mock_send_email.assert_called_once_with("billing@expiringsoon.com", client1_uuid)
        
    # Verify DB state updates
    async with async_session_maker() as session:
        db_c1 = await session.get(Client, client1_uuid)
        db_c2 = await session.get(Client, client2_uuid)
        db_c3 = await session.get(Client, client3_uuid)
        db_c4 = await session.get(Client, client4_uuid)
        
        assert db_c1.trial_warning_sent is True
        assert db_c2.trial_warning_sent is False
        assert db_c3.trial_warning_sent is True
        assert db_c4.trial_warning_sent is False


async def test_cancel_request_endpoints():
    """
    Tests both GET and POST endpoints for subscription cancellation requests,
    asserting that they set cancellation_requested = True, subscription_status = cancellation_pending,
    and trigger a Slack Support alert.
    """
    client_uuid_post = uuid4()
    client_uuid_get = uuid4()
    
    async with async_session_maker() as session:
        c_post = Client(
            id=client_uuid_post,
            company_name="Cancel POST Corp",
            domain="cancelpost.com",
            subscription_status=SubscriptionStatus.TRIAL,
            is_active=True
        )
        c_get = Client(
            id=client_uuid_get,
            company_name="Cancel GET Corp",
            domain="cancelget.com",
            subscription_status=SubscriptionStatus.TRIAL,
            is_active=True
        )
        session.add(c_post)
        session.add(c_get)
        await session.commit()

    http_client = await get_test_client()

    with patch("app.services.notifications.post_cancellation_pending_to_slack") as mock_slack:
        # 1. Test POST endpoint
        payload = {"client_id": str(client_uuid_post)}
        response_post = await http_client.post(
            f"{settings.API_V1_STR}/billing/cancel-request",
            json=payload
        )
        assert response_post.status_code == 200
        assert response_post.json()["status"] == "success"
        mock_slack.assert_called_once_with(client_uuid_post, "Cancel POST Corp")
        
        mock_slack.reset_mock()
        
        # 2. Test GET endpoint
        response_get = await http_client.get(
            f"{settings.API_V1_STR}/billing/cancel-request?client_id={client_uuid_get}"
        )
        assert response_get.status_code == 200
        assert response_get.json()["status"] == "success"
        mock_slack.assert_called_once_with(client_uuid_get, "Cancel GET Corp")

    # Verify DB states
    async with async_session_maker() as session:
        db_c_post = await session.get(Client, client_uuid_post)
        db_c_get = await session.get(Client, client_uuid_get)
        
        assert db_c_post.subscription_status == SubscriptionStatus.CANCELLATION_PENDING
        assert db_c_post.cancellation_requested is True
        
        assert db_c_get.subscription_status == SubscriptionStatus.CANCELLATION_PENDING
        assert db_c_get.cancellation_requested is True
