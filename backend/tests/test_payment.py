# backend/tests/test_payment.py
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from uuid import uuid4
from app.services.payment import IkhokhaClient, IkhokhaError, store_payment_method_token
from app.models.client import Client

pytestmark = pytest.mark.anyio

@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"

@pytest.mark.asyncio
async def test_ikhokha_get_access_token_mock():
    client = IkhokhaClient(client_id="test-id", client_secret="test-secret")
    
    with patch("httpx.AsyncClient.post") as mock_post:
        mock_response = AsyncMock()
        mock_response.is_success = True
        mock_response.json = MagicMock(return_value={"accessToken": "real-token"})
        mock_post.return_value = mock_response
        
        token = await client.get_access_token()
        assert token == "real-token"
        mock_post.assert_called_once()

@pytest.mark.asyncio
async def test_ikhokha_get_access_token_failure():
    client = IkhokhaClient(client_id="test-id", client_secret="test-secret")
    
    with patch("httpx.AsyncClient.post") as mock_post:
        mock_response = AsyncMock()
        mock_response.is_success = False
        mock_response.status_code = 401
        mock_response.text = "Unauthorized"
        mock_post.return_value = mock_response
        
        with pytest.raises(IkhokhaError):
            await client.get_access_token()

@pytest.mark.asyncio
async def test_ikhokha_create_payment_intent_success():
    client = IkhokhaClient(client_id="test-id", client_secret="test-secret")
    client_uuid = uuid4()
    
    with patch("httpx.AsyncClient.post") as mock_post, \
         patch.object(IkhokhaClient, "get_access_token", return_value="fake-token"):
        
        mock_response = AsyncMock()
        mock_response.is_success = True
        mock_response.json = MagicMock(return_value={"intentId": "intent-123", "redirectUrl": "http://checkout.com"})
        mock_post.return_value = mock_response
        
        res = await client.create_payment_intent(client_uuid, 100000, "http://myredirect.com")
        assert res["intentId"] == "intent-123"
        assert res["redirectUrl"] == "http://checkout.com"

@pytest.mark.asyncio
async def test_ikhokha_confirm_payment_success():
    client = IkhokhaClient(client_id="test-id", client_secret="test-secret")
    
    with patch("httpx.AsyncClient.get") as mock_get, \
         patch.object(IkhokhaClient, "get_access_token", return_value="fake-token"):
        
        mock_response = AsyncMock()
        mock_response.is_success = True
        mock_response.json = MagicMock(return_value={
            "transactionId": "ik_tx_777",
            "status": "successful",
            "paymentMethodToken": "card_token_abc"
        })
        mock_get.return_value = mock_response
        
        res = await client.confirm_payment("ik_tx_777")
        assert res["transactionId"] == "ik_tx_777"
        assert res["status"] == "successful"
        assert res["paymentMethodToken"] == "card_token_abc"

@pytest.mark.asyncio
async def test_store_payment_method_token_db():
    mock_session = AsyncMock()
    client_uuid = uuid4()
    mock_client = Client(
        id=client_uuid,
        company_name="AuraWorks Test Store Token",
        whitelisted_domains=["store.com"],
        subscription_status="trial",
        is_active=True
    )
    mock_session.get.return_value = mock_client
    
    updated_client = await store_payment_method_token(mock_session, client_uuid, "my-secure-card-token")
    
    mock_session.get.assert_called_once_with(Client, client_uuid)
    assert updated_client.payment_method_token == "my-secure-card-token"
    mock_session.add.assert_called_once_with(mock_client)
    mock_session.commit.assert_called_once()
    mock_session.refresh.assert_called_once_with(mock_client)

from datetime import datetime
from app.services.payment import calculate_prorated_amount

def test_proration_mathematics():
    """
    Strict unit tests asserting the exact ZAR output for trial expirations 
    on the 3rd (Full), 15th (R5k), and 25th (Daily rate) of a 30-day and 31-day month.
    """
    # June 2026 has 30 days
    june_3 = datetime(2026, 6, 3, 12, 0, 0)
    june_15 = datetime(2026, 6, 15, 12, 0, 0)
    june_25 = datetime(2026, 6, 25, 12, 0, 0)
    
    # Assertions for 30-day month (June)
    # 3rd of June -> Full price (1000000 cents)
    assert calculate_prorated_amount(june_3) == 1000000
    # 15th of June -> Flat R5k (500000 cents)
    assert calculate_prorated_amount(june_15) == 500000
    # 25th of June -> 6 days remaining -> (1000000 / 30) * 6 = 200000 cents
    assert calculate_prorated_amount(june_25) == 200000

    # July 2026 has 31 days
    july_3 = datetime(2026, 7, 3, 12, 0, 0)
    july_15 = datetime(2026, 7, 15, 12, 0, 0)
    july_25 = datetime(2026, 7, 25, 12, 0, 0)

    # Assertions for 31-day month (July)
    # 3rd of July -> Full price (1000000 cents)
    assert calculate_prorated_amount(july_3) == 1000000
    # 15th of July -> Flat R5k (500000 cents)
    assert calculate_prorated_amount(july_15) == 500000
    # 25th of July -> 7 days remaining -> round((1000000 / 31) * 7) = 225806 cents
    assert calculate_prorated_amount(july_25) == 225806
