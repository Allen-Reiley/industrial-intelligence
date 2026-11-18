# backend/app/db.py
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

logger = logging.getLogger("uvicorn")

# --- ENGINE INITIALIZATION ---

def get_sanitized_db_url(url: str, is_async: bool = False) -> str:
    """
    Sanitizes the database connection URL:
    - Resolves 'postgres://' to 'postgresql://' to prevent SQLAlchemy dialect lookup crashes.
    - If is_async is True, enforces the 'postgresql+asyncpg://' driver protocol.
    - If is_async is False, enforces the standard 'postgresql://' driver protocol.
    """
    if not url:
        return url
    
    # Handle the legacy/common postgres:// prefix
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
        
    if is_async:
        if url.startswith("postgresql://"):
            url = "postgresql+asyncpg://" + url[len("postgresql://"):]
        elif url.startswith("sqlite://") and not url.startswith("sqlite+aiosqlite://"):
            url = "sqlite+aiosqlite://" + url[len("sqlite://"):]
    else:
        if url.startswith("postgresql+asyncpg://"):
            url = "postgresql://" + url[len("postgresql+asyncpg://"):]
        elif url.startswith("sqlite+aiosqlite://"):
            url = "sqlite://" + url[len("sqlite+aiosqlite://"):]
            
    return url

# 1. Synchronous Engine (For Migrations and Admin Dashboards)
sync_url = get_sanitized_db_url(settings.DATABASE_URL, is_async=False)

sync_connect_args = {}
if sync_url and "postgres" in sync_url:
    sync_connect_args = {
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5
    }

if sync_url:
    engine = create_engine(
        sync_url,
        echo=False,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=10,
        max_overflow=20,
        connect_args=sync_connect_args
    )
else:
    logger.critical("🚨 DATABASE_URL missing. System entering Fail-Fast mode.")
    engine = None

# 2. Asynchronous Engine (For Forensic Tracking, Janitor Cycles & Identity API)
async_url = get_sanitized_db_url(settings.DATABASE_URL, is_async=True)

async_connect_args = {}
if async_url and "postgres" in async_url:
    async_connect_args = {
        "server_settings": {
            "tcp_keepalives_idle": "30",
            "tcp_keepalives_interval": "10",
            "tcp_keepalives_count": "5"
        }
    }

if async_url:
    async_engine = create_async_engine(
        async_url,
        echo=False,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=10,
        max_overflow=20,
        connect_args=async_connect_args
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
        from app.models.prospect import Prospect
        from app.models.enrichment_queue import EnrichmentQueue, FailedEnrichment
        from app.models.notification_throttle import NotificationThrottle
        from app.models.crm_dead_letter import CrmDeadLetter
        from app.models.transaction import Transaction
        from app.models.checkout_session import CheckoutSession
        from app.models.user import User, Session as UserSession, Account, Verification


        
        # Programmatic Alembic migrations
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
        
        SQLModel.metadata.create_all(engine)
        logger.info("✅ Database Ledger: Connection established and tables verified.")
        
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
                        whitelisted_domains=["testclient.co.za", "auraworks.co.za", "www.auraworks.co.za"],
                        category=ClientCategory.COMMERCIAL,
                        client_product_description="Default integration test client for telemetry ingestion",
                        subscription_status=SubscriptionStatus.ACTIVE,
                        payment_plan="monthly",
                        setup_fee_paid=True,
                        is_active=True,
                        require_consent_banner=True
                    )
                    session.add(test_client)
                    session.commit()
                    logger.info("✅ Default integration client successfully seeded.")
                elif not test_client.require_consent_banner:
                    test_client.require_consent_banner = True
                    session.add(test_client)
                    session.commit()
                    logger.info("✅ Default integration client updated with require_consent_banner=True.")

                # Ensure super admins are ALWAYS active admin on startup
                stmt_admin = select(User).where(func.lower(User.email).in_(["reitumetse@auraworks.co.za", "rsethabela@auraworks.co.za"]))
                super_admins = session.execute(stmt_admin).scalars().all()
                for super_admin in super_admins:
                    if super_admin.role != UserRole.ADMIN or not super_admin.is_active:
                        super_admin.role = UserRole.ADMIN
                        super_admin.is_active = True
                        session.add(super_admin)
                        session.commit()
                        logger.info(f"👑 Super Admin {super_admin.email} role verified and restored to active ADMIN.")
        except Exception as e:
            logger.error(f"⚠️ Failed to seed default integration client or super admin: {e}")
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
            try:
                if session.bind and session.bind.dialect.name == "postgresql":
                    await session.execute(
                        text("SELECT set_config('app.current_client_id', :client_id, true)").bindparams(client_id=str(client_id))
                    )
            except Exception:
                pass
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