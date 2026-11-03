# backend/tests/test_phase8.py
import pytest
import hmac
import hashlib
import time
import json
from uuid import uuid4
from datetime import datetime, timezone
from unittest.mock import patch, AsyncMock, MagicMock
from sqlmodel import select

# Internal Imports
from app.main import app
from app.db import async_engine, async_session_maker, init_db
from app.models.client import Client, ClientCategory, SubscriptionStatus
from app.models.company import Company
from app.models.prospect import Prospect
from app.core.config import settings
from app.services.notifications import post_meeting_booked_to_slack, post_to_slack
import httpx

pytestmark = pytest.mark.anyio

@pytest.fixture(autouse=True)
async def dispose_engine_fixture():
    init_db()
    yield
    await async_engine.dispose()

async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="http://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="http://test")

def generate_calendly_signature(body_str: str, timestamp: int, secret: str) -> str:
    message = f"{timestamp}.{body_str}"
    computed = hmac.new(
        secret.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    return f"t={timestamp},v1={computed}"

async def test_calendly_webhook_success_and_idempotency():
    client_id = uuid4()
    company_id = uuid4()
    prospect_email = f"john-{uuid4()}@example.co.za"
    
    client_domain = f"ind-client-{uuid4()}.co.za"
    company_domain = f"prospect-company-{uuid4()}.co.za"

    # 1. Seed database with Client, Company, and Prospect
    async with async_session_maker() as session:
        client_row = Client(
            id=client_id,
            company_name="Industrial Client",
            domain=client_domain,
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client_row)
        
        company_row = Company(
            id=company_id,
            company_name="Prospect Company Ltd",
            domain=company_domain,
            industry="Mining"
        )
        session.add(company_row)
        
        prospect_row = Prospect(
            id=uuid4(),
            client_id=client_id,
            company_id=company_id,
            name="John Doe",
            email=prospect_email,
            position="Operations Director",
            department="Logistics",
            industry="Mining",
            status="demo_requested"
        )
        session.add(prospect_row)
        await session.commit()

    # 2. Build Calendly payload
    event_uuid = f"event-{uuid4()}"
    webhook_payload = {
        "event": "invitee.created",
        "payload": {
            "email": prospect_email,
            "name": "John Doe",
            "event_uuid": event_uuid,
            "scheduled_event": {
                "uri": f"https://api.calendly.com/scheduled_events/{event_uuid}",
                "name": "15 Minute Meeting",
                "start_time": "2026-06-06T14:00:00.000000Z",
                "end_time": "2026-06-06T14:15:00.000000Z",
                "location": {
                    "type": "google_conference",
                    "join_url": "https://meet.google.com/abc-defg-hij"
                }
            }
        }
    }
    body_str = json.dumps(webhook_payload)
    
    # 3. Generate Valid Signature
    webhook_secret = "calendly-secret-123"
    t = int(time.time())
    signature = generate_calendly_signature(body_str, t, webhook_secret)
    
    client = await get_test_client()
    
    with patch.object(settings, "CALENDLY_WEBHOOK_SECRET", webhook_secret):
        with patch("app.services.notifications.post_meeting_booked_to_slack") as mock_slack:
            # First delivery (should succeed and update prospect)
            response = await client.post(
                "/api/v1/webhooks/calendly",
                content=body_str,
                headers={"X-Calendly-Signature": signature}
            )
            assert response.status_code == 200
            assert response.json()["status"] == "success"
            
            # Verify database state transition
            async with async_session_maker() as session:
                res = await session.execute(select(Prospect).where(Prospect.email == prospect_email))
                updated_prospect = res.scalars().first()
                assert updated_prospect is not None
                assert updated_prospect.status == "call_booked"
                assert updated_prospect.calendly_event_uuid == event_uuid
                
            # Verify slack task queued
            mock_slack.assert_called_once()
            
            # Second delivery (should be ignored due to idempotency)
            mock_slack.reset_mock()
            response_dup = await client.post(
                "/api/v1/webhooks/calendly",
                content=body_str,
                headers={"X-Calendly-Signature": signature}
            )
            assert response_dup.status_code == 200
            assert response_dup.json()["status"] == "ignored"
            mock_slack.assert_not_called()

async def test_calendly_webhook_expired_signature():
    body_str = json.dumps({"payload": {"email": "test@example.com"}})
    webhook_secret = "calendly-secret-123"
    # Generate signature with timestamp 6 minutes in the past
    t = int(time.time()) - 360
    signature = generate_calendly_signature(body_str, t, webhook_secret)
    
    client = await get_test_client()
    with patch.object(settings, "CALENDLY_WEBHOOK_SECRET", webhook_secret):
        response = await client.post(
            "/api/v1/webhooks/calendly",
            content=body_str,
            headers={"X-Calendly-Signature": signature}
        )
        assert response.status_code == 401
        assert "Signature expired" in response.json()["detail"]

async def test_calendly_webhook_invalid_signature():
    body_str = json.dumps({"payload": {"email": "test@example.com"}})
    t = int(time.time())
    signature = f"t={t},v1=wrongsignature123"
    
    client = await get_test_client()
    with patch.object(settings, "CALENDLY_WEBHOOK_SECRET", "secret"):
        response = await client.post(
            "/api/v1/webhooks/calendly",
            content=body_str,
            headers={"X-Calendly-Signature": signature}
        )
        assert response.status_code == 403
        assert "Invalid signature" in response.json()["detail"]

@patch("httpx.AsyncClient.post")
async def test_slack_notifications_payload_formatting(mock_post):
    mock_post.return_value = MagicMock(status_code=200)
    
    client_id = uuid4()
    company_id = uuid4()
    prospect_id = uuid4()
    
    client_domain = f"slack-ind-{uuid4()}.co.za"
    company_domain = f"slack-prospect-{uuid4()}.co.za"

    # Seed Database for slack query
    async with async_session_maker() as session:
        client_row = Client(
            id=client_id,
            company_name="Slack Industrial Client",
            domain=client_domain,
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.ACTIVE,
            is_active=True
        )
        session.add(client_row)
        
        company_row = Company(
            id=company_id,
            company_name="Slack Prospect Company Ltd",
            domain=company_domain,
            industry="Manufacturing"
        )
        session.add(company_row)
        
        prospect_row = Prospect(
            id=prospect_id,
            client_id=client_id,
            company_id=company_id,
            name="Alice Smith",
            email="alice@slacktest.co.za",
            position="Technical Director",
            department="Operations",
            industry="Manufacturing",
            traffic="100k-500k",
            avg_price="R500,000",
            status="call_booked",
            aura_id="aura-test-999"
        )
        session.add(prospect_row)
        await session.commit()

    webhook_payload = {
        "payload": {
            "email": "alice@slacktest.co.za",
            "scheduled_event": {
                "name": "AuraWorks Demo Call",
                "start_time": "2026-06-06T14:00:00.000000Z",
                "end_time": "2026-06-06T14:15:00.000000Z",
                "location": {
                    "join_url": "https://meet.google.com/test-meet-link"
                }
            }
        }
    }

    with patch.object(settings, "SLACK_WEBHOOK_URL", "https://hooks.slack.com/services/test"):
        # Test post_meeting_booked_to_slack
        await post_meeting_booked_to_slack(prospect_id, webhook_payload)
        mock_post.assert_called_once()
        
        args, kwargs = mock_post.call_args
        payload = kwargs["json"]
        
        # Verify block headers and formatted SAST time conversion (UTC 14:00 -> SAST 16:00)
        assert payload["blocks"][0]["text"]["text"] == "📅 Meeting Booked"
        
        fields_text = [field["text"] for field in payload["blocks"][1]["fields"]]
        assert any("Slack Prospect Company Ltd" in text for text in fields_text)
        assert any("Alice Smith" in text for text in fields_text)
        assert any("2026-06-06 16:00 - 16:15 SAST" in text for text in fields_text)
        assert any("AuraWorks Demo Call" in text for text in fields_text)
        assert any("Technical Director / Operations" in text for text in fields_text)
        assert any("https://meet.google.com/test-meet-link" in text for text in fields_text)

        # Verify post_to_slack (Form Submission) carries clear firmographics
        mock_post.reset_mock()
        prospect_data = {
            "client_id": client_id,
            "company_id": company_id,
            "company_name_final": "Slack Prospect Company Ltd",
            "name": "Alice Smith",
            "email": "alice@slacktest.co.za",
            "position": "Technical Director",
            "department": "Operations",
            "industry": "Manufacturing",
            "traffic": "100k-500k",
            "avg_price": "R500,000",
            "capture_source": "waitlist_conversion"
        }
        await post_to_slack(prospect_data, {"pathway": "Google search"})
        mock_post.assert_called_once()
        
        args, kwargs = mock_post.call_args
        payload = kwargs["json"]
        fields_text_promoted = [field["text"] for field in payload["blocks"][1]["fields"]]
        assert any("Technical Director / Operations" in text for text in fields_text_promoted)
        assert any("Manufacturing" in text for text in fields_text_promoted)
        assert any("R500,000" in text for text in fields_text_promoted)
