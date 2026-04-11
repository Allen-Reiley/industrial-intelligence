from fastapi import APIRouter
from app.api.v1 import leads, track

api_router = APIRouter()

# Register the logic here
api_router.include_router(track.router, prefix="/track", tags=["tracking"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])