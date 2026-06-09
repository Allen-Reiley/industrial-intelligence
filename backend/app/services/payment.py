# backend/app/services/payment.py
import httpx
from uuid import UUID
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.config import settings
from app.models.client import Client

class IkhokhaError(Exception):
    pass

class IkhokhaClient:
    def __init__(self, api_url: str = settings.IKHOKHA_API_URL, client_id: str = settings.IKHOKHA_CLIENT_ID, client_secret: str = settings.IKHOKHA_CLIENT_SECRET):
        self.api_url = api_url.rstrip("/")
        self.client_id = client_id
        self.client_secret = client_secret

    async def get_access_token(self) -> str:
        # If client credentials are not configured, return a mock token for testing
        if not self.client_id or not self.client_secret:
            return "mock-access-token"
        
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{self.api_url}/v1/auth/token",
                    json={"clientId": self.client_id, "clientSecret": self.client_secret},
                    timeout=5.0
                )
                if not resp.is_success:
                    raise IkhokhaError(f"Authentication failed: {resp.status_code} {resp.text}")
                data = resp.json()
                return data["accessToken"]
        except Exception as e:
            if not isinstance(e, IkhokhaError):
                raise IkhokhaError(f"Connection failed: {e}")
            raise e

    async def create_payment_intent(self, client_id: UUID, amount: int, redirect_url: str) -> dict:
        """
        Creates a payment intent (checkout session) with Ikhokha.
        Amount is in cents.
        """
        token = await self.get_access_token()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        payload = {
            "amount": amount,
            "currency": "ZAR",
            "externalId": str(client_id),
            "redirectUrl": redirect_url,
            "callbackUrl": f"https://api.auraworks.co.za/api/v1/webhooks/ikhokha"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{self.api_url}/v1/checkout/intent",
                    json=payload,
                    headers=headers,
                    timeout=5.0
                )
                if not resp.is_success:
                    raise IkhokhaError(f"Failed to create payment intent: {resp.status_code} {resp.text}")
                return resp.json()
        except Exception as e:
            if not isinstance(e, IkhokhaError):
                raise IkhokhaError(f"Connection failed: {e}")
            raise e

    async def confirm_payment(self, gateway_reference: str) -> dict:
        """
        Confirms or checks transaction status with Ikhokha.
        """
        token = await self.get_access_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{self.api_url}/v1/transactions/{gateway_reference}",
                    headers=headers,
                    timeout=5.0
                )
                if not resp.is_success:
                    raise IkhokhaError(f"Failed to confirm payment: {resp.status_code} {resp.text}")
                return resp.json()
        except Exception as e:
            if not isinstance(e, IkhokhaError):
                raise IkhokhaError(f"Connection failed: {e}")
            raise e

async def store_payment_method_token(session: AsyncSession, client_id: UUID, token: str) -> Client:
    client = await session.get(Client, client_id)
    if not client:
        raise ValueError("Client not found")
    client.payment_method_token = token
    session.add(client)
    await session.commit()
    await session.refresh(client)
    return client
