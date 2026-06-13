import pytest
import uuid
from seed_client import seed_client
from app.db import get_async_session
from app.models.client import Client, SubscriptionStatus, ClientCategory
from sqlmodel import select

@pytest.mark.asyncio
async def test_seed_client_execution():
    """
    Asserts that the seed_client script executes successfully,
    and registers the default client in the Client database table.
    """
    # 1. Execute the seed script
    await seed_client()
    
    # 2. Query the database using a fresh async session to assert the client state
    client_id = uuid.UUID("c4a6c9b1-8355-4de2-985d-a04f4dcd63a0")
    async for session in get_async_session():
        stmt = select(Client).where(Client.id == client_id)
        res = await session.execute(stmt)
        client = res.scalars().first()
        
        assert client is not None, f"Seeded client {client_id} was not found in database."
        assert client.domain == "auraworks.co.za", "Seeded client domain is incorrect."
        assert client.company_name == "AuraWorks", "Seeded client company name is incorrect."
        assert "auraworks.co.za" in client.whitelisted_domains, "Seeded client whitelisted domains are incorrect."
        assert client.subscription_status == SubscriptionStatus.ACTIVE, "Seeded client subscription status is incorrect."
        assert client.category == ClientCategory.COMMERCIAL, "Seeded client category is incorrect."
        assert client.is_active is True, "Seeded client is not active."
        break
