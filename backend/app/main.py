from contextlib import asynccontextmanager
from fastapi import FastAPI
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
    # (Crucial after you run DROP TABLE visit;)
    init_db()
    yield
    logger.info("🛑 Shutting down...")

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# --- STATIC FILES CONFIGURATION ---
current_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(os.path.dirname(current_dir), "static")

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    logger.info(f"✅ Static files mounted from: {static_dir}")
else:
    logger.warning(f"⚠️ Warning: Static directory not found at {static_dir}")

# --- CORS CONFIGURATION ---
# Removed trailing slashes to prevent preflight (OPTIONS) mismatches
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

# --- ROUTE REGISTRATION ---
# Standardizing the prefix: tracker.js expects /api/v1/track/entry
# Ensure settings.API_V1_STR is exactly "/api/v1"
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