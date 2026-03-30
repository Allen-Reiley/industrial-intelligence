from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
import logging

from app.core.config import settings
from app.db import init_db, engine
from app.api.v1 import track, clients, identity # Added identity for production logic
from app.models.visit import Visit

# Setup logging
logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Initializing Database and Tables...")
    init_db()
    yield
    logger.info("🛑 Shutting down...")

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# --- STATIC FILES: DECOUPLED ---
# We have removed the app.mount("/static", ...) block. 
# Assets are now served via https://cdn.auraworks.co.za/aura.js
logger.info("⚡ Static asset delivery offloaded to Cloudflare CDN.")

# --- CORS CONFIGURATION ---
# Trusted origins for your industrial intelligence ecosystem
origins = [ 
    "https://industrial-intelligence-xi.vercel.app", 
    "http://localhost:3000",
    "https://auraworks.co.za",
    "https://www.auraworks.co.za",
    "https://cdn.auraworks.co.za" # Authorized CDN origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"], 
    allow_headers=["*"],
)

# --- AURAWORKS FORENSIC DEBUGGER ---
# Keeps logs visible during the transition to the full identity engine
@app.post(f"{settings.API_V1_STR}/track/{{endpoint}}")
async def debug_aura_signal(endpoint: str, request: Request):
    try:
        data = await request.json()
        logger.info(f"--- 📡 AURA SIGNAL: [{endpoint.upper()}] ---")
        logger.info(f"Client ID: {data.get('client_id')} | Aura ID: {data.get('aura_id')}")
        
        if endpoint == "identity":
            sig = data.get('signature', {})
            logger.info(f"🧬 Forensic Signature: Drift={sig.get('drift')}ms | Fonts={sig.get('fonts')}")
        elif endpoint == "event":
            logger.info(f"💰 Lead Capture: {data.get('event_type')} | Data: {data.get('email') or data.get('depth')}%")
        
        return {"status": "debug_captured"}
    except Exception as e:
        logger.error(f"❌ Debug Capture Error: {str(e)}")
        return {"status": "error", "message": str(e)}

# --- ROUTE REGISTRATION ---
app.include_router(track.router, prefix=f"{settings.API_V1_STR}/track", tags=["tracking"])
app.include_router(clients.router, prefix=f"{settings.API_V1_STR}/clients", tags=["clients"])
app.include_router(identity.router, prefix=f"{settings.API_V1_STR}/identity", tags=["identity"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get(f"{settings.API_V1_STR}/leads")
async def get_leads():
    with Session(engine) as session:
        statement = select(Visit).order_by(Visit.created_at.desc())
        results = session.exec(statement).all()
        logger.info(f"DEBUG: Found {len(results)} total visits in database.")
        return results