# backend/app/main.py
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from sqlmodel import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
import traceback
from datetime import datetime, timezone

from app.core.config import settings
from app.db import init_db, get_async_session
from app.api.v1 import track, clients, identity, prospects, leads, webhook, auth, billing
from app.models import Prospect, Company
from app.tasks.janitor import cleanup_unverified_visits
from app.core.scheduler import start_scheduler
from typing import Optional

# Setup logging - Industrial Clinical Style
logger = logging.getLogger("uvicorn")

# --- SECURITY: Admin Access Guard ---
from app.core.users import fastapi_users_instance
from app.models.user import User

async def verify_admin_token(
    x_aura_token: Optional[str] = Header(None),
    user: Optional[User] = Depends(fastapi_users_instance.current_user(optional=True, active=True))
):
    """
    Hardens debug and admin routes. 
    Rejects any request missing the correct ADMIN_API_KEY or valid Bearer JWT.
    """
    # 1. Try X-Aura-Token first (legacy API key)
    if x_aura_token == settings.ADMIN_API_KEY and settings.ADMIN_API_KEY:
        return "admin"
        
    # 2. Try FastAPI-Users user
    if user:
        return user.email

            
    logger.warning(f"🚨 UNAUTHORIZED ACCESS ATTEMPT: {datetime.now(timezone.utc)}")
    raise HTTPException(status_code=403, detail="Unauthorized Forensic Access")



async def run_janitor_loop():
    """
    Background worker that executes the 48-hour sweep every 6 hours.
    Protects the system from 'Noise' while preserving 'Verified' leads.
    """
    while True:
        try:
            await cleanup_unverified_visits()
            await asyncio.sleep(21600) # 6-hour interval
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Janitor Loop Error: {e}")
            await asyncio.sleep(60)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    The AuraWorks OS Lifecycle Manager.
    """
    logger.info(f"🚀 {settings.PROJECT_NAME} v{settings.VERSION}: Initializing...")
    
    # Database schema checks/migrations are fully decoupled from application startup.
    # The ASGI startup sequence only boots the FastAPI context and starts background helpers.
    # if settings.DATABASE_URL:
    #     try:
    #         init_db()
    #     except Exception as e:
    #         logger.error(f"❌ Database Ledger: Failed to initialize. {e}")
    # else:
    #     logger.warning("⚠️ Database Ledger: DATABASE_URL missing.")

    # 1. Start the DB Janitor
    janitor_task = asyncio.create_task(run_janitor_loop())
    logger.info("扫 Janitor: Forensic sweep scheduled.")

    # 2. Boot the Apollo.io Enrichment Async Scheduler
    start_scheduler()
    
    yield
    
    logger.info("🛑 AuraWorks OS: Orderly shutdown initiated...")
    janitor_task.cancel()
    try:
        await janitor_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME, 
    version=settings.VERSION,
    lifespan=lifespan
)

# --- GLOBAL EXCEPTION HANDLERS WITH CORS PRESERVATION ---

@app.exception_handler(SQLAlchemyError)
async def db_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database Exception: {exc}\n{traceback.format_exc()}")
    
    headers = {}
    origin = request.headers.get("origin")
    if origin in settings.ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = "*"
        headers["Access-Control-Allow-Headers"] = "*"
    else:
        # Fallback to force allow production domain
        headers["Access-Control-Allow-Origin"] = "https://www.auraworks.co.za"
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = "*"
        headers["Access-Control-Allow-Headers"] = "*"
        
    return JSONResponse(
        status_code=500,
        content={"detail": "Database Error occurred", "error_type": type(exc).__name__},
        headers=headers
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {exc}\n{traceback.format_exc()}")
    
    headers = {}
    origin = request.headers.get("origin")
    if origin in settings.ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = "*"
        headers["Access-Control-Allow-Headers"] = "*"
    else:
        # Fallback to force allow production domain
        headers["Access-Control-Allow-Origin"] = "https://www.auraworks.co.za"
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = "*"
        headers["Access-Control-Allow-Headers"] = "*"
        
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error_type": type(exc).__name__},
        headers=headers
    )

from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation Error: {exc.errors()}")
    
    headers = {}
    origin = request.headers.get("origin")
    if origin in settings.ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = "*"
        headers["Access-Control-Allow-Headers"] = "*"
    else:
        headers["Access-Control-Allow-Origin"] = "https://www.auraworks.co.za"
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = "*"
        headers["Access-Control-Allow-Headers"] = "*"
        
    return JSONResponse(
        status_code=400,
        content={"detail": exc.errors()},
        headers=headers
    )


# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PROXY HEADER STACK ---
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

from app.core.users import current_request

@app.middleware("http")
async def set_current_request_context(request: Request, call_next):
    token = current_request.set(request)
    try:
        response = await call_next(request)
        return response
    finally:
        current_request.reset(token)

@app.middleware("http")
async def override_proxy_headers(request: Request, call_next):
    if settings.ENVIRONMENT == "production" and settings.API_DOMAIN:
        # Force HTTPS scheme
        request.scope["scheme"] = "https"
        
        # Parse host and port from API_DOMAIN setting
        domain = settings.API_DOMAIN.replace("https://", "").replace("http://", "")
        if ":" in domain:
            host, port_str = domain.split(":", 1)
            port = int(port_str)
        else:
            host = domain
            port = 443
            
        request.scope["server"] = (host, port)
        
        # Override HTTP Host header in request.scope["headers"]
        new_headers = []
        for k, v in request.scope.get("headers", []):
            if k == b"host":
                new_headers.append((b"host", host.encode("latin1")))
            else:
                new_headers.append((k, v))
        request.scope["headers"] = new_headers

    return await call_next(request)

# --- ROUTE REGISTRATION ---
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(track.router, prefix=f"{settings.API_V1_STR}/track", tags=["tracking"])
app.include_router(track.router, prefix="/v1/track", tags=["tracking"])
app.include_router(clients.router, prefix=f"{settings.API_V1_STR}/clients", tags=["clients"])
app.include_router(clients.router, prefix="/v1/clients", tags=["clients"])
app.include_router(identity.router, prefix=f"{settings.API_V1_STR}/identity", tags=["identity"])
app.include_router(prospects.router, prefix=f"{settings.API_V1_STR}/prospects", tags=["prospects"])
app.include_router(leads.router, prefix=f"{settings.API_V1_STR}/leads", tags=["leads"]) # Primary Ledger
app.include_router(webhook.router, prefix=f"{settings.API_V1_STR}/webhook", tags=["webhooks"])
app.include_router(webhook.router, prefix=f"{settings.API_V1_STR}/webhooks", tags=["webhooks"])
app.include_router(billing.router, prefix=f"{settings.API_V1_STR}/billing", tags=["billing"])

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "engine": settings.PROJECT_NAME,
        "database_connected": bool(settings.DATABASE_URL),
        "timestamp": datetime.now(timezone.utc)
    }

# --- INDUSTRIAL ADMIN DASHBOARD ENDPOINTS ---

@app.get(
    f"{settings.API_V1_STR}/admin/summary", 
    dependencies=[Depends(verify_admin_token)],
    tags=["admin"]
)
async def get_admin_summary(session: AsyncSession = Depends(get_async_session)):
    """
    Provides a high-level overview of the Industrial OS performance.
    Combines Lead totals with Company engagement metrics.
    """
    if not settings.DATABASE_URL:
        raise HTTPException(status_code=503, detail="Database Unavailable")
    
    # Count Warm Leads (Volunteered Data)
    lead_count_stmt = select(func.count(Prospect.id))
    lead_count_res = await session.execute(lead_count_stmt)
    total_leads = lead_count_res.scalar() or 0

    # Count High-Engagement Entities
    company_count_stmt = select(func.count(Company.id)).where(Company.total_visits > 5)
    company_count_res = await session.execute(company_count_stmt)
    hot_companies = company_count_res.scalar() or 0

    return {
        "total_warm_leads": total_leads,
        "high_intent_companies": hot_companies,
        "engine_status": "operational",
        "timestamp": datetime.now(timezone.utc)
    }