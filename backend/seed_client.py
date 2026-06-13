# backend/seed_client.py
import asyncio
import uuid
from app.db import async_session_maker
from app.models.client import Client, ClientCategory, SubscriptionStatus
from sqlmodel import select
from dotenv import load_dotenv

# Load local environment variables
load_dotenv()

async def seed_client():
    client_id = uuid.UUID("c4a6c9b1-8355-4de2-985d-a04f4dcd63a0")
    async with async_session_maker() as session:
        stmt = select(Client).where(Client.id == client_id)
        res = await session.execute(stmt)
        existing_client = res.scalars().first()
        
        if existing_client:
            print(f"Client {client_id} already exists. Updating domain and activation...")
            existing_client.domain = "auraworks.co.za"
            existing_client.whitelisted_domains = ["auraworks.co.za", "www.auraworks.co.za", "localhost", "testclient.co.za"]
            existing_client.is_active = True
            existing_client.subscription_status = SubscriptionStatus.ACTIVE
            session.add(existing_client)
        else:
            print(f"Client {client_id} not found. Creating new...")
            new_client = Client(
                id=client_id,
                company_name="AuraWorks",
                domain="auraworks.co.za",
                whitelisted_domains=["auraworks.co.za", "www.auraworks.co.za", "localhost", "testclient.co.za"],
                category=ClientCategory.COMMERCIAL,
                client_product_description="AuraWorks default configuration",
                subscription_status=SubscriptionStatus.ACTIVE,
                payment_plan="monthly",
                setup_fee_paid=True,
                is_active=True
            )
            session.add(new_client)
            
        await session.commit()
        print("Client seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_client())
