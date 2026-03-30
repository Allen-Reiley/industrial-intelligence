from contextlib import asynccontextmanager
from fastapi import FastAPI, Request # Added Request for the debugger
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
import os
import logging

from app.core.config import settings
from app.db import init_db, engine
from app.api.v1 import track, clients
from app.models.visit import Visit

# Setup logging to see what's happening in Railway
logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Initializing Database and Tables...")
    # This will create the 'visit' table if it doesn't exist
    init_db()
    yield
    logger.info("🛑 Shutting down...")

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# --- STATIC FILES CONFIGURATION ---
current_dir = os.path.dirname(os.path.abspath(__file__))
# Note: Ensure aura.js is saved in the 'static' folder at the root of your project
static_dir = os.path.join(os.path.dirname(current_dir), "static")

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    logger.info(f"✅ Static files mounted from: {static_dir}")
else:
    logger.warning(f"⚠️ Warning: Static directory not found at {static_dir}")

# --- CORS CONFIGURATION ---
origins = [ 
    "https://industrial-intelligence-xi.vercel.app", 
    "http://localhost:3000",
    "https://auraworks.co.za",
    "https://www.auraworks.co.za"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"], 
    allow_headers=["*"],
)

# --- AURAWORKS FORENSIC DEBUGGER ---
# This catches incoming signals from aura.js before we move to the final identity.py logic
@app.post(f"{settings.API_V1_STR}/track/{{endpoint}}")
async def debug_aura_signal(endpoint: str, request: Request):
    try:
        data = await request.json()
        
        logger.info(f"--- 📡 AURA SIGNAL: [{endpoint.upper()}] ---")
        logger.info(f"Client ID: {data.get('client_id')}")
        logger.info(f"Aura ID: {data.get('aura_id')}")
        
        if endpoint == "identity":
            sig = data.get('signature', {})
            logger.info(f"🧬 Forensic Signature Received: Drift={sig.get('drift')}ms | Fonts={sig.get('fonts')}")
        elif endpoint == "event":
            logger.info(f"💰 Lead Capture: {data.get('event_type')} | Data: {data.get('email') or data.get('depth')}%")
        
        # We allow the specific router to handle the actual DB persistence
        # This function just provides visibility in your Railway/Local logs
        return {"status": "debug_captured"}
    except Exception as e:
        logger.error(f"❌ Debug Capture Error: {str(e)}")
        return {"status": "error", "message": str(e)}

# --- ROUTE REGISTRATION ---
app.include_router(track.router, prefix=f"{settings.API_V1_STR}/track", tags=["tracking"])
app.include_router(clients.router, prefix=f"{settings.API_V1_STR}/clients", tags=["clients"])

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