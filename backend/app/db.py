# backend/app/db.py
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

logger = logging.getLogger("uvicorn")

# --- ENGINE INITIALIZATION ---

# 1. Synchronous Engine (For Migrations and Admin Dashboards)
# Converts asyncpg URL to standard postgresql if necessary
sync_url = settings.DATABASE_URL
if sync_url and "postgresql+asyncpg://" in sync_url:
    sync_url = sync_url.replace("postgresql+asyncpg://", "postgresql://")

if sync_url:
    engine = create_engine(
        sync_url,
        echo=False,
        pool_pre_ping=True, # Critical for Railway idle connection recovery
        pool_size=10,
        max_overflow=20
    )
else:
    logger.critical("🚨 DATABASE_URL missing. System entering Fail-Fast mode.")
    engine = None

# 2. Asynchronous Engine (For Forensic Tracking, Janitor Cycles & Identity API)
# Ensures the URL uses the required +asyncpg driver explicitly
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
    Note: Standardizes the ledger. Production uses Alembic for migrations.
    """
    if not engine:
        logger.error("❌ init_db: Operation aborted. No database linked.")
        return

    try:
        # Explicit imports to register models with SQLModel.metadata
        from app.models.client import Client
        from app.models.company import Company
        from app.models.visit import Visit
        from app.models.waitlist import WaitlistLead
        from app.models.pageview import PageView
        
        SQLModel.metadata.create_all(engine)
        logger.info("✅ Database Ledger: Connection established and tables verified.")
    except Exception as e:
        logger.error(f"❌ Database Ledger: Sync failure: {e}")

async def get_async_session() -> AsyncSession:
    """
    Dependency generator for Async FastAPI routes (Tracking/Identity).
    """
    if not async_session_maker:
        raise ConnectionError("Async Database Engine not initialized. Check asyncpg installation.")
    
    async with async_session_maker() as session:
        yield session

def get_session():
    """
    Dependency generator for Synchronous routes (Admin/Dashboard).
    """
    if not engine:
        raise ConnectionError("Synchronous Database Engine not initialized.")
        
    with Session(engine) as session:
        yield session