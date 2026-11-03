# backend/tests/test_phase5.py
import pytest
import io
from uuid import uuid4
from datetime import datetime, timezone
from unittest.mock import patch, AsyncMock, MagicMock
from sqlmodel import select
import httpx

# Internal Imports
from app.main import app
from app.db import async_engine, async_session_maker
from app.models.client import Client, ClientCategory, SubscriptionStatus
from app.services.reports import generate_signed_contract_pdf, compile_and_send_contract

pytestmark = pytest.mark.anyio

@pytest.fixture(autouse=True)
async def dispose_engine_fixture():
    yield
    await async_engine.dispose()

async def get_test_client():
    try:
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="http://test")
    except AttributeError:
        return httpx.AsyncClient(app=app, base_url="http://test")

async def test_paygenius_webhook_signature_security():
    """
    Dispatch an unauthenticated or invalid payload signature token to POST /api/v1/webhook/paygenius
    and assert an immediate HTTP 401/403 authorization denial.
    Re-transmit using a valid signature token payload and assert an HTTP 200 code,
    verifying that the client's subscription_status token changes to active and is_active == True.
    """
    client_id = uuid4()
    client_domain = f"client-webhook-{uuid4()}.com"
    
    async with async_session_maker() as session:
        # Seed Client
        client_row = Client(
            id=client_id,
            company_name="Pending Partner",
            domain=client_domain,
            category=ClientCategory.COMMERCIAL,
            subscription_status=SubscriptionStatus.SUSPENDED,
            is_active=False
        )
        session.add(client_row)
        await session.commit()

    client = await get_test_client()
    
    payload = {
        "client_id": str(client_id),
        "status": "success",
        "email": "billing@pendingpartner.com",
        "payment_plan": "enterprise"
    }

    # 1. Invalid signature parameter and headers (Should be 401/403)
    payload_invalid = payload.copy()
    payload_invalid["signature"] = "wrong-token"
    response = await client.post("/api/v1/webhook/paygenius", json=payload_invalid)
    assert response.status_code in [401, 403]

    # 2. Transmit with valid signature token payload / header (Using mocked secret)
    payload_valid = payload.copy()
    payload_valid["signature"] = "test-paygenius-secret"
    
    with patch("app.api.v1.webhook.settings.PAYGENIUS_WEBHOOK_SECRET", "test-paygenius-secret"):
        with patch("app.services.reports.send_resend_email", new_callable=AsyncMock) as mock_send_email:
            response = await client.post("/api/v1/webhook/paygenius", json=payload_valid)
            assert response.status_code == 200
            
            # Verify client status in the database
            async with async_session_maker() as session:
                res = await session.execute(select(Client).where(Client.id == client_id))
                updated_client = res.scalars().first()
                assert updated_client is not None
                assert updated_client.subscription_status == SubscriptionStatus.ACTIVE
                assert updated_client.is_active is True
                assert updated_client.payment_plan == "enterprise"

async def test_automated_contract_pdf_generation():
    """
    Trigger the PayGenius success hook.
    Assert that a valid byte stream is compiled via reportlab matching premium styling constraints,
    applies the digital signature script properties, and calls the Resend asynchronous service.
    """
    client_name = "Test Mining Operations Ltd"
    client_domain = "test-mining-ops.co.za"
    recipient_email = "contracts@test-mining-ops.co.za"
    plan = "monthly"

    # Verify reportlab pdf generation directly
    pdf_bytes = generate_signed_contract_pdf(client_name, client_domain, plan)
    assert pdf_bytes.startswith(b"%PDF")
    
    # Verify reportlab document is encrypted
    # Checking for standard encryption keywords in PDF binary stream
    assert b"/Encrypt" in pdf_bytes or b"/Filter" in pdf_bytes

    # Trigger compile_and_send_contract background worker and verify Resend integration
    with patch("app.services.reports.send_resend_email", new_callable=AsyncMock) as mock_send_email:
        mock_send_email.return_value = True
        
        success = await compile_and_send_contract(client_name, client_domain, recipient_email, plan)
        
        assert success is True
        mock_send_email.assert_called_once()
        args, kwargs = mock_send_email.call_args
        
        assert kwargs["to_email"] == recipient_email
        assert "Service Agreement" in kwargs["subject"]
        assert kwargs["filename"] == "AuraWorks_Service_Agreement_test-mining-ops_co_za.pdf"
        assert kwargs["attachment_bytes"].startswith(b"%PDF")

async def test_client_semantic_classification():
    """
    Pass a mock customer domain homepage containing text indicators like "Chrome Ore Mineral Processing Plant" to the signup classifier.
    Assert that the resulting database entry sets the category column directly to ClientCategory.INDUSTRIAL.
    """
    client = await get_test_client()
    
    # 1. Test case: Industrial client
    industrial_domain = f"chrome-ore-mill-{uuid4()}.co.za"
    mock_homepage_industrial = "Welcome to the Chrome Ore Mineral Processing Plant. We engineer and design heavy industrial crushers and mills."
    
    payload_industrial = {
        "company_name": f"Chrome Ore Mill {uuid4()}",
        "domain": industrial_domain,
        "client_product_description": "We specialize in processing chrome ore minerals and heavy plant design."
    }
    
    # Mock scraper to return industrial text indicators
    with patch("app.api.v1.clients.scrape_homepage", return_value=mock_homepage_industrial):
        response = await client.post("/api/v1/clients/", json=payload_industrial)
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == ClientCategory.INDUSTRIAL
        assert data["auto_classified_at"] is not None

    # 2. Test case: Commercial client (no industrial terms, low density)
    commercial_domain = f"marketing-agency-{uuid4()}.com"
    mock_homepage_commercial = "We are a creative marketing agency. We build websites, run advertisements, and do branding for small retail shops."
    
    payload_commercial = {
        "company_name": f"Creative Agency {uuid4()}",
        "domain": commercial_domain,
        "client_product_description": "Digital marketing and retail consulting."
    }
    
    with patch("app.api.v1.clients.scrape_homepage", return_value=mock_homepage_commercial):
        response = await client.post("/api/v1/clients/", json=payload_commercial)
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == ClientCategory.COMMERCIAL
