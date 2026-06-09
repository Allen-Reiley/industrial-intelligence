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
