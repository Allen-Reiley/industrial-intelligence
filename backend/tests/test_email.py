# backend/tests/test_email.py
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4
from datetime import datetime, timezone

from app.services.email import (
    send_prospect_success_email,
    send_prospect_recovery_email,
    recover_prospect_leads
)
from app.core.config import settings
from app.models.prospect import Prospect


@pytest.mark.anyio
@patch("httpx.AsyncClient.post")
async def test_send_prospect_success_email_success(mock_post):
    # Setup mock response
    mock_response = AsyncMock()
    mock_response.status_code = 201
    mock_response.json = MagicMock(return_value={"id": "test-resend-id"})
    mock_post.return_value = mock_response

    # Temporarily set RESEND_API_KEY and ENVIRONMENT for testing
    with patch.object(settings, "RESEND_API_KEY", "re_123456"), \
         patch.object(settings, "ENVIRONMENT", "test"):
        success = await send_prospect_success_email(
            recipient_email="director@sasol-mining.co.za",
            recipient_name="John Doe"
        )
        
        assert success is True
        mock_post.assert_called_once()
        
        # Verify request parameters
        args, kwargs = mock_post.call_args
        url = args[0]
        assert url == "https://api.resend.com/emails"
        
        payload = kwargs["json"]
        assert payload["to"] == ["director@sasol-mining.co.za"]
        assert payload["subject"] == "Confirm Your AuraWorks Demo & Onboarding"
        assert "Hello John Doe," in payload["html"]
        assert "STATUS: DEMO_REQUESTED" in payload["html"]
        assert "Identity Resolution" in payload["html"]
        assert "https://cal.com/reitumetse-sethabela/30min" in payload["html"]


@pytest.mark.anyio
@patch("httpx.AsyncClient.post")
async def test_send_prospect_success_email_custom_calendly(mock_post):
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json = MagicMock(return_value={"id": "test-resend-id"})
    mock_post.return_value = mock_response

    with patch.object(settings, "RESEND_API_KEY", "re_123456"), \
         patch.object(settings, "ENVIRONMENT", "test"):
        custom_link = "https://cal.com/custom-auraworks/test"
        success = await send_prospect_success_email(
            recipient_email="procurement@angloamerican.com",
            recipient_name=None,
            calendly_link=custom_link
        )
        
        assert success is True
        args, kwargs = mock_post.call_args
        payload = kwargs["json"]
        assert "Hello," in payload["html"]
        assert custom_link in payload["html"]
        assert settings.CALENDLY_LINK not in payload["html"]


@pytest.mark.anyio
@patch("httpx.AsyncClient.post")
async def test_send_prospect_recovery_email(mock_post):
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json = MagicMock(return_value={"id": "test-recovery-resend-id"})
    mock_post.return_value = mock_response

    with patch.object(settings, "RESEND_API_KEY", "re_123456"), \
         patch.object(settings, "ENVIRONMENT", "test"):
        success = await send_prospect_recovery_email(
            recipient_email="operations@industrial.co.za",
            recipient_name="Sarah Connor"
        )
        
        assert success is True
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        payload = kwargs["json"]
        assert payload["to"] == ["operations@industrial.co.za"]
        assert "Updated Scheduling Link" in payload["subject"]
        assert "Sarah Connor" in payload["html"]
        assert "https://cal.com/reitumetse-sethabela/30min" in payload["html"]
        assert "Notice regarding your scheduling link" in payload["html"]
        assert "Reitumetse Sethabela" in payload["html"]


@pytest.mark.anyio
async def test_recover_prospect_leads_dry_run():
    # Mock session and prospects
    mock_prospect_1 = Prospect(
        id=uuid4(),
        client_id=uuid4(),
        email="unbooked1@factory.co.za",
        name="Lead One",
        status="demo_requested",
        created_at=datetime.now(timezone.utc)
    )
    mock_prospect_2 = Prospect(
        id=uuid4(),
        client_id=uuid4(),
        email="unbooked2@industrial.co.za",
        name="Lead Two",
        status="demo_requested",
        created_at=datetime.now(timezone.utc)
    )

    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_prospect_1, mock_prospect_2]
    mock_session.execute = AsyncMock(return_value=mock_result)

    result = await recover_prospect_leads(
        session=mock_session,
        dry_run=True,
        only_unbooked=True
    )

    assert result["total_candidates"] == 2
    assert result["sent"] == 2
    assert result["failed"] == 0
    assert result["skipped"] == 0
    assert result["dry_run"] is True
    assert result["booking_link"] == "https://cal.com/reitumetse-sethabela/30min"


@pytest.mark.anyio
@patch("app.services.email.send_prospect_recovery_email", new_callable=AsyncMock)
async def test_recover_prospect_leads_live(mock_send):
    mock_send.return_value = True

    mock_prospect_1 = Prospect(
        id=uuid4(),
        client_id=uuid4(),
        email="lead1@factory.co.za",
        name="Lead One",
        status="demo_requested",
        created_at=datetime.now(timezone.utc)
    )
    mock_prospect_placeholder = Prospect(
        id=uuid4(),
        client_id=uuid4(),
        email="aura_test@unverified.aura",
        status="demo_requested",
        created_at=datetime.now(timezone.utc)
    )

    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_prospect_1, mock_prospect_placeholder]
    mock_session.execute = AsyncMock(return_value=mock_result)

    result = await recover_prospect_leads(
        session=mock_session,
        dry_run=False,
        only_unbooked=True
    )

    assert result["total_candidates"] == 2
    assert result["sent"] == 1
    assert result["skipped"] == 1
    assert result["failed"] == 0
    assert mock_prospect_1.welcome_email_sent is True
    mock_session.commit.assert_awaited_once()


@pytest.mark.anyio
async def test_send_prospect_success_email_missing_key():
    # If API key is missing, should log error and return False immediately
    with patch.object(settings, "RESEND_API_KEY", None), \
         patch.object(settings, "ENVIRONMENT", "test"):
        success = await send_prospect_success_email("prospect@sasol.com")
        assert success is False
