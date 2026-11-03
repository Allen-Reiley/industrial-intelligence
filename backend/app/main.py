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
from app.api.v1 import track, clients, identity, prospects, leads, webhook, auth, billing, checkout, scripts, sales, admin, calendar, tasks
from app.models import Prospect, Company
from app.tasks.janitor import cleanup_unverified_visits
from app.core.scheduler import start_scheduler
from typing import Optional

# Setup logging - Industrial Clinical Style
logger = logging.getLogger("uvicorn")

# --- SECURITY: Admin Access Guard ---
from app.core.security import get_current_user, require_admin
from app.models.user import User

async def verify_admin_token(
    x_aura_token: Optional[str] = Header(None),
    user: Optional[User] = Depends(get_current_user)
):
    """
    Hardens debug and admin routes. 
    Rejects any request missing the correct ADMIN_API_KEY or valid Better Auth session.
    """
    # 1. Try X-Aura-Token first (legacy API key)
    if x_aura_token == settings.ADMIN_API_KEY and settings.ADMIN_API_KEY:
        return "admin"
        
    # 2. Try authenticated user
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
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, init_db)
    except Exception as e:
        logger.error(f"Error initializing DB: {e}")
    
    logger.info("🚀 Industrial Intelligence Engine v3.2.1: Initializing...")
    
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

import re

def is_origin_allowed(origin: Optional[str]) -> bool:
    if not origin:
        return False
    if origin in settings.ALLOWED_ORIGINS:
        return True
    if getattr(settings, "ALLOWED_ORIGIN_REGEX", None) and re.match(settings.ALLOWED_ORIGIN_REGEX, origin):
        return True
    return False

# --- GLOBAL EXCEPTION HANDLERS WITH CORS PRESERVATION ---

@app.exception_handler(SQLAlchemyError)
async def db_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database Exception: {exc}\n{traceback.format_exc()}")
    
    headers = {}
    origin = request.headers.get("origin")
    if is_origin_allowed(origin):
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
    if is_origin_allowed(origin):
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
    if is_origin_allowed(origin):
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
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Response

class IngestionCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/v1/track"):
            origin = request.headers.get("origin")
            if request.method == "OPTIONS":
                response = Response()
                if origin:
                    response.headers["Access-Control-Allow-Origin"] = origin
                    response.headers["Access-Control-Allow-Credentials"] = "true"
                    response.headers["Access-Control-Allow-Methods"] = "*"
                    response.headers["Access-Control-Allow-Headers"] = "*"
                return response
            
            response = await call_next(request)
            if origin:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Allow-Methods"] = "*"
                response.headers["Access-Control-Allow-Headers"] = "*"
            return response
        return await call_next(request)

app.add_middleware(IngestionCORSMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"^https://.*\.vercel\.app$|^https://.*\.auraworks\.co\.za$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type", "x-session-token", "x-better-auth-token", "x-aura-token", "*"],
    expose_headers=["Authorization", "*"],
)

# --- PROXY HEADER STACK ---
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

from contextvars import ContextVar

current_request: ContextVar[Optional[Request]] = ContextVar("current_request", default=None)

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
app.include_router(auth.router, prefix="/v1/auth", tags=["authentication"])
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
app.include_router(checkout.router, prefix=f"{settings.API_V1_STR}/checkout", tags=["checkout"])
app.include_router(scripts.router, prefix=f"{settings.API_V1_STR}/scripts", tags=["scripts"])
app.include_router(sales.router, prefix=f"{settings.API_V1_STR}/sales", tags=["sales"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin_personnel"])
app.include_router(calendar.router, prefix=f"{settings.API_V1_STR}/calendar", tags=["calendar"])
app.include_router(tasks.router, prefix=f"{settings.API_V1_STR}/tasks", tags=["tasks"])


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