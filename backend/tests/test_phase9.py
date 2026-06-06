# backend/tests/test_phase9.py
import pytest
import hmac
import hashlib
import time
import json
import base64
from uuid import uuid4
from datetime import datetime, timezone
from unittest.mock import patch, AsyncMock, MagicMock
from sqlmodel import select

# Internal Imports
from app.main import app
from app.db import async_engine, async_session_maker, init_db
from app.models.inbound_message import InboundMessage, MessageStatus
from app.core.config import settings
from app.services.notifications import post_inbound_email_to_slack
from app.services.email import send_inbound_auto_reply
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

def generate_svix_signature(body_str: str, msg_id: str, timestamp: int, secret: str) -> str:
    signed_content = f"{msg_id}.{timestamp}.{body_str}"
    try:
        if secret.startswith("whsec_"):
            secret_key = base64.b64decode(secret.split("_")[1])
        else:
            secret_key = base64.b64decode(secret)
    except Exception:
        secret_key = secret.encode("utf-8")
        
    computed = base64.b64encode(
        hmac.new(secret_key, signed_content.encode("utf-8"), hashlib.sha256).digest()
    ).decode("utf-8")
    return f"v1,{computed}"

async def test_inbound_webhook_invalid_signatures():
    client = await get_test_client()
    payload = {
        "type": "email.received",
        "created_at": "2026-06-06T14:48:00.000Z",
        "data": {
            "from": "user@example.com",
            "to": ["legal@auraworks.co.za"],
            "subject": "Missing compliance info",
            "text": "Hello, please provide policy documents."
        }
    }
    body_str = json.dumps(payload)
    
    # Test case 1: Missing headers
    response = await client.post("/api/v1/webhooks/inbound-email", content=body_str)
    assert response.status_code == 401
    assert "Missing signature headers" in response.text

    # Test case 2: Expired timestamp
    msg_id = f"msg-{uuid4()}"
    expired_time = int(time.time()) - 400
    headers = {
        "svix-id": msg_id,
        "svix-timestamp": str(expired_time),
        "svix-signature": "v1,somesig"
    }
    response = await client.post("/api/v1/webhooks/inbound-email", content=body_str, headers=headers)
    assert response.status_code == 401
    assert "Signature expired" in response.text

    # Test case 3: Invalid signature (HMAC mismatch)
    headers["svix-timestamp"] = str(int(time.time()))
    headers["svix-signature"] = "v1,invalidhmacsignature"
    response = await client.post("/api/v1/webhooks/inbound-email", content=body_str, headers=headers)
    assert response.status_code == 403
    assert "Invalid signature" in response.text

@patch("app.services.notifications.post_inbound_email_to_slack", new_callable=AsyncMock)
@patch("app.services.email.send_inbound_auto_reply", new_callable=AsyncMock)
async def test_inbound_webhook_success(mock_auto_reply, mock_slack):
    client = await get_test_client()
    secret = settings.RESEND_WEBHOOK_SECRET or "whsec_dGVzdC1zZWNyZXQ=" # test-secret in base64
    msg_id = f"msg-{uuid4()}"
    timestamp = int(time.time())
    
    payload = {
        "type": "email.received",
        "created_at": "2026-06-06T14:48:00.000Z",
        "data": {
            "from": "prospect@miningcorp.co.za",
            "to": ["privacy@auraworks.co.za"],
            "subject": "POPIA Consent Inquiry",
            "text": "Is our client data stored locally?",
            "html": "<p>Is our client data stored locally?</p>"
        }
    }
    body_str = json.dumps(payload)
    sig = generate_svix_signature(body_str, msg_id, timestamp, secret)

    headers = {
        "svix-id": msg_id,
        "svix-timestamp": str(timestamp),
        "svix-signature": sig
    }

    # Backup the original config secret and set test secret
    original_secret = settings.RESEND_WEBHOOK_SECRET
    settings.RESEND_WEBHOOK_SECRET = secret

    try:
        response = await client.post("/api/v1/webhooks/inbound-email", content=body_str, headers=headers)
        assert response.status_code == 200
        res_data = response.json()
        assert res_data["status"] == "success"
        
        # Verify committed InboundMessage in the DB
        async with async_session_maker() as session:
            db_msg_id = res_data["message_id"]
            stmt = select(InboundMessage).where(InboundMessage.id == db_msg_id)
            res = await session.execute(stmt)
            msg = res.scalars().first()
            
            assert msg is not None
            assert msg.sender_email == "prospect@miningcorp.co.za"
            assert msg.recipient_alias == "privacy@auraworks.co.za"
            assert msg.subject == "POPIA Consent Inquiry"
            assert msg.text_body == "Is our client data stored locally?"
            assert msg.html_body == "<p>Is our client data stored locally?</p>"
            assert msg.status == MessageStatus.UNREAD

        # Check background tasks dispatch
        mock_slack.assert_called_once()
        mock_auto_reply.assert_called_once_with("prospect@miningcorp.co.za", "privacy@auraworks.co.za")

    finally:
        settings.RESEND_WEBHOOK_SECRET = original_secret

@patch("httpx.AsyncClient.post")
async def test_slack_dispatcher_routing(mock_post):
    mock_post.return_value = MagicMock(status_code=200)
    
    msg_id = uuid4()
    sender = "legal-team@heavygears.co.za"
    subject = "Inquiry regarding data transfer"
    body = "Checking our standard agreement text under SADC regulations."

    # Test Case 1: Route legal@ to #compliance
    original_compliance = settings.SLACK_COMPLIANCE_WEBHOOK_URL
    settings.SLACK_COMPLIANCE_WEBHOOK_URL = "https://hooks.slack.com/services/compliance-webhook"
    
    try:
        await post_inbound_email_to_slack(
            inbound_msg_id=msg_id,
            sender_email=sender,
            recipient_alias="legal@auraworks.co.za",
            subject=subject,
            body=body
        )
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert args[0] == "https://hooks.slack.com/services/compliance-webhook"
        payload = kwargs["json"]
        assert "#compliance" in payload["blocks"][0]["text"]["text"]
        assert sender in payload["blocks"][1]["fields"][0]["text"]
        assert "legal@auraworks.co.za" in payload["blocks"][1]["fields"][1]["text"]
    finally:
        settings.SLACK_COMPLIANCE_WEBHOOK_URL = original_compliance

    # Test Case 2: Route customer@ to #support
    mock_post.reset_mock()
    original_support = settings.SLACK_SUPPORT_WEBHOOK_URL
    settings.SLACK_SUPPORT_WEBHOOK_URL = "https://hooks.slack.com/services/support-webhook"
    
    try:
        await post_inbound_email_to_slack(
            inbound_msg_id=msg_id,
            sender_email=sender,
            recipient_alias="customer@auraworks.co.za",
            subject=subject,
            body=body
        )
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert args[0] == "https://hooks.slack.com/services/support-webhook"
        payload = kwargs["json"]
        assert "#support" in payload["blocks"][0]["text"]["text"]
    finally:
        settings.SLACK_SUPPORT_WEBHOOK_URL = original_support

@patch("app.services.email.send_resend_email", new_callable=AsyncMock)
async def test_auto_reply_context_and_loop_prevention(mock_send):
    mock_send.return_value = True

    # Test Case 1: Privacy auto-reply content
    await send_inbound_auto_reply("prospect@example.com", "privacy@auraworks.co.za")
    mock_send.assert_called_once()
    args, kwargs = mock_send.call_args
    assert kwargs["to_email"] == "prospect@example.com"
    assert "data privacy" in kwargs["subject"]
    assert "Information Officer" in kwargs["html_content"]

    # Test Case 2: Legal auto-reply content
    mock_send.reset_mock()
    await send_inbound_auto_reply("prospect@example.com", "legal@auraworks.co.za")
    mock_send.assert_called_once()
    args, kwargs = mock_send.call_args
    assert "legal inquiry" in kwargs["subject"]
    assert "compliance team" in kwargs["html_content"]

    # Test Case 3: Loop prevention - direct alias email trigger
    mock_send.reset_mock()
    res = await send_inbound_auto_reply("legal@auraworks.co.za", "customer@auraworks.co.za")
    assert res is False
    mock_send.assert_not_called()

    # Test Case 4: Loop prevention - system account/no-reply email trigger
    mock_send.reset_mock()
    res = await send_inbound_auto_reply("no-reply@otherdomain.com", "legal@auraworks.co.za")
    assert res is False
    mock_send.assert_not_called()
