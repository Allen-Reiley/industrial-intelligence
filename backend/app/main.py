from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import track
from app.core.config import settings
from app.db import init_db
from app.api.v1 import track, clients

app = FastAPI(title=settings.PROJECT_NAME)

# 1. CORS Configuration
# This is CRITICAL. Your clients' websites will be on different domains.
# You must allow them to send data to your API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, you might want to restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Initialize Database on Startup
@app.on_event("startup")
def on_startup():
    init_db()

# 3. Include Routers
app.include_router(track.router, prefix=settings.API_V1_STR + "/track", tags=["tracking"])
app.include_router(clients.router, prefix=settings.API_V1_STR + "/clients", tags=["clients"]) # <--- Add this line!

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": settings.VERSION}