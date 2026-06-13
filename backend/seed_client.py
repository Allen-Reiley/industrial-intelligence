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
            existing_client.company_name = "AuraWorks HQ"
            existing_client.domain = "auraworks.co.za"
            existing_client.whitelisted_domains = ["auraworks.co.za", "www.auraworks.co.za", "localhost", "testclient.co.za"]
            existing_client.is_active = True
            existing_client.subscription_status = SubscriptionStatus.ACTIVE
            session.add(existing_client)
        else:
            print(f"Client {client_id} not found. Creating new...")
            new_client = Client(
                id=client_id,
                company_name="AuraWorks HQ",
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
            
        # 1. Explicitly create and commit the parent Client record first
        await session.commit()
        print("Parent Client committed successfully.")

        # 2. Ensure the ClientConfig creation happens sequentially AFTER the Client is committed.
        ClientConfig = None
        for module_name in ["app.models.client", "app.models", "app.models.client_config"]:
            try:
                mod = __import__(module_name, fromlist=["ClientConfig"])
                ClientConfig = getattr(mod, "ClientConfig", None)
                if ClientConfig:
                    break
            except ImportError:
                continue

        if ClientConfig:
            print("ClientConfig model found. Checking for existing config...")
            try:
                # Query ClientConfig using the appropriate client_id attribute
                client_id_attr = getattr(ClientConfig, "client_id", None) or getattr(ClientConfig, "id", None)
                if client_id_attr is not None:
                    stmt_cfg = select(ClientConfig).where(client_id_attr == client_id)
                    res_cfg = await session.execute(stmt_cfg)
                    existing_cfg = res_cfg.scalars().first()
                    
                    if not existing_cfg:
                        print(f"Creating ClientConfig record for client {client_id}...")
                        kwargs = {}
                        if hasattr(ClientConfig, "client_id"):
                            kwargs["client_id"] = client_id
                        if hasattr(ClientConfig, "id"):
                            kwargs["id"] = client_id
                        
                        new_cfg = ClientConfig(**kwargs)
                        session.add(new_cfg)
                        await session.commit()
                        print("ClientConfig seeded successfully sequentially AFTER Client commit.")
                    else:
                        print("ClientConfig already exists.")
            except Exception as cfg_err:
                print(f"Failed to seed ClientConfig dynamically: {cfg_err}")
                await session.rollback()
                raise cfg_err
        else:
            print("ClientConfig model not found in the current codebase environment. Skipping ClientConfig seeding step.")

if __name__ == "__main__":
    asyncio.run(seed_client())
