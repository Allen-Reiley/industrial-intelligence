# backend/app/db.py
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

logger = logging.getLogger("uvicorn")

# --- ENGINE INITIALIZATION ---

# 1. Synchronous Engine (For Migrations and Admin Dashboards)
# Standardizes connection URL to standard postgresql protocol if it contains the asyncpg schema identifier.
sync_url = settings.DATABASE_URL
if sync_url and "postgresql+asyncpg://" in sync_url:
    sync_url = sync_url.replace("postgresql+asyncpg://", "postgresql://")

if sync_url:
    # pool_pre_ping=True: Issues a lightweight 'SELECT 1' test query on checkout to identify and discard 
    # dead connections. Crucial for serverless environments (Railway/Neon) which silently drop idle sockets.
    # pool_size=10: The permanent connection pool size.
    # max_overflow=20: The maximum number of temporary connections that can be opened beyond pool_size 
    # to handle high concurrent traffic spikes.
    engine = create_engine(
        sync_url,
        echo=False,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
else:
    logger.critical("🚨 DATABASE_URL missing. System entering Fail-Fast mode.")
    engine = None

# 2. Asynchronous Engine (For Forensic Tracking, Janitor Cycles & Identity API)
# Standardizes connection URL to use the required postgresql+asyncpg driver explicitly.
# Asyncpg provides non-blocking networking socket support for high-concurrency ingestion routes.
async_url = settings.DATABASE_URL
if async_url and async_url.startswith("postgresql://"):
    async_url = async_url.replace("postgresql://", "postgresql+asyncpg://")

if async_url:
    async_engine = create_async_engine(
        async_url,
        echo=False,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
    async_session_maker = sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )
else:
    async_engine = None
    async_session_maker = None


from typing import Optional
from contextvars import ContextVar
from fastapi import Request
from sqlalchemy import text

# Context variable to hold client_id for non-request contexts (like background tasks)
current_client_id: ContextVar[Optional[str]] = ContextVar("current_client_id", default=None)

# --- INITIALIZATION & DEPENDENCIES ---

def init_db():
    """
    Schema Synchronization.
    Verifies that the database ledger tables are correctly defined.
    Production architectures utilize Alembic migrations. This acts as a secondary failsafe.
    """
    if not engine:
        logger.error("❌ init_db: Operation aborted. No database linked.")
        return

    try:
        # Import all models explicitly to guarantee registration with SQLModel.metadata.
        # If we skip these imports, SQLModel.metadata will be empty when we call create_all.
        from app.models.client import Client
        from app.models.company import Company
        from app.models.department import Department
        from app.models.visit import Visit
        from app.models.pageview import PageView
        from app.models.waitlist_lead import WaitlistLead
        from app.models.enrichment_queue import EnrichmentQueue, FailedEnrichment
        from app.models.notification_throttle import NotificationThrottle
        
        SQLModel.metadata.create_all(engine)
        logger.info("✅ Database Ledger: Connection established and tables verified.")
        
        # Run Alembic migrations programmatically to ensure the schema is fully updated with new columns
        import os
        from alembic.config import Config
        from alembic import command
        
        current_dir = os.path.dirname(os.path.abspath(__file__))
        alembic_ini_path = os.path.abspath(os.path.join(current_dir, "..", "alembic.ini"))
        
        if os.path.exists(alembic_ini_path):
            logger.info("🔄 Running database migrations via Alembic...")
            alembic_cfg = Config(alembic_ini_path)
            command.upgrade(alembic_cfg, "head")
            logger.info("✅ Database migrations completed successfully.")
        else:
            logger.warning(f"⚠️ alembic.ini not found at {alembic_ini_path}, skipping migrations.")
        
        # Seed the default test client if it does not exist to avoid foreign key violations.
        try:
            from sqlmodel import select
            from app.models.client import ClientCategory, SubscriptionStatus
            with Session(engine) as session:
                stmt = select(Client).where(Client.id == "c4a6c9b1-8355-4de2-985d-a04f4dcd63a0")
                test_client = session.execute(stmt).scalars().first()
                if not test_client:
                    logger.info("🌱 Seeding default integration client (c4a6c9b1-8355-4de2-985d-a04f4dcd63a0)...")
                    test_client = Client(
                        id="c4a6c9b1-8355-4de2-985d-a04f4dcd63a0",
                        company_name="AuraWorks Test Client",
                        domain="testclient.co.za",
                        category=ClientCategory.COMMERCIAL,
                        client_product_description="Default integration test client for telemetry ingestion",
                        subscription_status=SubscriptionStatus.ACTIVE,
                        payment_plan="monthly",
                        setup_fee_paid=True,
                        is_active=True
                    )
                    session.add(test_client)
                    session.commit()
                    logger.info("✅ Default integration client successfully seeded.")
        except Exception as e:
            logger.error(f"⚠️ Failed to seed default integration client: {e}")
    except Exception as e:
        logger.error(f"❌ Database Ledger: Sync failure: {e}")

async def get_async_session(request: Request = None) -> AsyncSession:
    """
    FastAPI Dependency: Yields a transaction-scoped Asynchronous session.
    Automatically releases the connection back to the connection pool upon route completion
    or when the calling context exits.

    This function acts as the RLS execution hook, setting the request-scoped
    'app.current_client_id' session variable on the PostgreSQL connection.
    """
    if not async_session_maker:
        raise ConnectionError("Async Database Engine not initialized. Check asyncpg installation.")
    
    # 1. Resolve client_id from request or ContextVar fallback
    client_id = current_client_id.get()
    
    if not client_id and request:
        # Check query parameters
        client_id = request.query_params.get("client_id")
        
        # Check headers (e.g. X-Client-ID or X-Aura-Client-ID)
        if not client_id:
            client_id = request.headers.get("x-client-id")
            
        # Check JSON body if Content-Type is application/json
        if not client_id and request.headers.get("content-type") == "application/json":
            try:
                body = await request.body()
                if body:
                    import json
                    data = json.loads(body)
                    client_id = data.get("client_id")
            except Exception:
                pass
    
    async with async_session_maker() as session:
        if client_id:
            # Set the PostgreSQL session variable for RLS policies
            # is_local=True ensures it is scoped strictly to the current transaction.
            await session.execute(
                text("SELECT set_config('app.current_client_id', :client_id, true)").bindparams(client_id=str(client_id))
            )
        yield session

def get_session():
    """
    FastAPI Dependency: Yields a transaction-scoped Synchronous session.
    Used for traditional admin dashboard endpoints and sync migrations.
    """
    if not engine:
        raise ConnectionError("Synchronous Database Engine not initialized.")
        
    with Session(engine) as session:
        yield session