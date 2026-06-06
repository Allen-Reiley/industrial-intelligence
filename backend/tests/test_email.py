# backend/tests/test_email.py
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.email import send_prospect_success_email
from app.core.config import settings

@pytest.mark.anyio
@patch("httpx.AsyncClient.post")
async def test_send_prospect_success_email_success(mock_post):
    # Setup mock response
    mock_response = AsyncMock()
    mock_response.status_code = 201
    mock_response.json = MagicMock(return_value={"id": "test-resend-id"})
    mock_post.return_value = mock_response

    # Temporarily set RESEND_API_KEY for testing
    with patch.object(settings, "RESEND_API_KEY", "re_123456"):
        # Test sending email with name
        success = await send_prospect_success_email(
            recipient_email="prospect@example.com",
            recipient_name="John Doe"
        )
        
        assert success is True
        mock_post.assert_called_once()
        
        # Verify request parameters
        args, kwargs = mock_post.call_args
        url = args[0]
        assert url == "https://api.resend.com/emails"
        
        payload = kwargs["json"]
        assert payload["to"] == ["prospect@example.com"]
        assert payload["subject"] == "Confirm Your AuraWorks Demo & Onboarding"
        assert "Hello John Doe," in payload["html"]
        assert "STATUS: DEMO_REQUESTED" in payload["html"]
        assert "Identity Resolution" in payload["html"]
        assert settings.CALENDLY_LINK in payload["html"]

@pytest.mark.anyio
@patch("httpx.AsyncClient.post")
async def test_send_prospect_success_email_custom_calendly(mock_post):
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json = MagicMock(return_value={"id": "test-resend-id"})
    mock_post.return_value = mock_response

    with patch.object(settings, "RESEND_API_KEY", "re_123456"):
        custom_link = "https://calendly.com/custom-auraworks/test"
        success = await send_prospect_success_email(
            recipient_email="prospect@example.com",
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
async def test_send_prospect_success_email_missing_key():
    # If API key is missing, should log error and return False immediately
    with patch.object(settings, "RESEND_API_KEY", None):
        success = await send_prospect_success_email("prospect@example.com")
        assert success is False
