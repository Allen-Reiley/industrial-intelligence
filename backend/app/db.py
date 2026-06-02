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
    except Exception as e:
        logger.error(f"❌ Database Ledger: Sync failure: {e}")

async def get_async_session() -> AsyncSession:
    """
    FastAPI Dependency: Yields a transaction-scoped Asynchronous session.
    Automatically releases the connection back to the connection pool upon route completion
    or when the calling context exits.
    """
    if not async_session_maker:
        raise ConnectionError("Async Database Engine not initialized. Check asyncpg installation.")
    
    async with async_session_maker() as session:
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