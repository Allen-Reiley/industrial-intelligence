# backend/app/api/v1/identity.py
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from cachetools import TTLCache

from app.db import get_async_session
from app.models.visit import Visit

router = APIRouter()
logger = logging.getLogger("uvicorn")

# --- INDUSTRIAL CACHE LAYER ---
# Prevents O(N) database scans for returning high-frequency visitors
# Key: Forensic Fingerprint | Value: aura_id
identity_cache = TTLCache(maxsize=1000, ttl=3600)

def calculate_identity_match(new_sig: dict, existing_visit: Visit) -> float:
    """
    Weighted probability algorithm for forensic identity resolution.
    Calibrated for B2B clusters (Gauteng Industrial Hubs).
    """
    score = 0.0
    
    # 1. Hardware Rendering (30%)
    if new_sig.get('canvas') == existing_visit.canvas_hash:
        score += 0.30
        
    # 2. Precision Clock Drift (20%)
    try:
        existing_drift = int(existing_visit.clock_drift) if existing_visit.clock_drift is not None else 0
    except (ValueError, TypeError):
        existing_drift = 0
    drift_diff = abs(new_sig.get('drift', 0) - existing_drift)
    if drift_diff <= 1:
        score += 0.20
        
    # 3. GPU Signature (10%)
    if new_sig.get('webgl') == existing_visit.webgl_renderer:
        score += 0.10
        
    # 4. Network Signal (40%) - Identifying Corporate Gateways
    net = new_sig.get('network', {})
    if isinstance(net, dict):
        if net.get('type') == existing_visit.effective_connection_type:
            score += 0.15
            
        rtt_match = abs(net.get('rtt', 0) - (existing_visit.rtt or 0)) <= 20
        downlink_match = abs(net.get('downlink', 0) - (existing_visit.downlink_speed or 0)) < 0.5
        
        if rtt_match and downlink_match:
            score += 0.25
            
    return score

async def merge_sessions_async(new_id: str, original_id: str):
    """
    Background Task: Unifies fragmented forensic IDs across the ledger.
    Using a dedicated session to prevent main request blocking.
    """
    from app.db import async_session_maker
    async with async_session_maker() as session:
        try:
            statement = select(Visit).where(Visit.aura_id == new_id)
            result = await session.execute(statement)
            visits_to_update = result.scalars().all()
            
            for visit in visits_to_update:
                visit.aura_id = original_id
                session.add(visit)
            
            await session.commit()
            logger.info(f"🔗 Forensic Stitch Success: {new_id} -> {original_id}")
        except Exception as e:
            logger.error(f"❌ Session Merge Failure: {e}")

@router.post("/resolve")
async def resolve_identity(
    payload: dict, 
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_async_session)
):
    aura_id = payload.get("aura_id")
    signature = payload.get("signature", {})
    
    if not aura_id:
        raise HTTPException(status_code=400, detail="Missing aura_id")

    # --- STEP 0: THE FAST PATH (Cache) ---
    sig_key = f"{signature.get('canvas')}:{signature.get('webgl')}:{signature.get('drift')}"
    cached_id = identity_cache.get(sig_key)
    
    if cached_id and cached_id != aura_id:
        logger.info(f"⚡ Cache Hit: Mapping {aura_id} to {cached_id}")
        background_tasks.add_task(merge_sessions_async, aura_id, cached_id)
        return {"status": "stitched", "stitched_id": cached_id, "confidence": 1.0}

    # --- STEP 1: DIRECT ID LOCK ---
    statement = select(Visit).where(Visit.aura_id == aura_id).order_by(Visit.created_at.desc())
    result = await session.execute(statement)
    existing_visit = result.scalars().first()
    
    if existing_visit:
        # Refresh forensic markers for the current visit
        existing_visit.canvas_hash = signature.get('canvas')
        drift_val = signature.get('drift')
        existing_visit.clock_drift = str(drift_val) if drift_val is not None else None
        existing_visit.webgl_renderer = signature.get('webgl')
        
        net = signature.get('network', {})
        if isinstance(net, dict):
            existing_visit.effective_connection_type = net.get('type')
            existing_visit.downlink_speed = net.get('downlink')
            existing_visit.rtt = net.get('rtt')
            
        session.add(existing_visit)
        await session.commit()
        
        # Populate cache for future pings
        identity_cache[sig_key] = aura_id
        return {"status": "recognized", "method": "direct_id"}

    # --- STEP 2: FORENSIC SCAN (High Entropy) ---
    search_stmt = select(Visit).order_by(Visit.created_at.desc()).limit(200)
    search_res = await session.execute(search_stmt)
    all_recent = search_res.scalars().all()
    
    # Isolate unique forensic profiles from the last 200 signals
    unique_profiles = {v.aura_id: v for v in all_recent}.values()
    
    for profile in unique_profiles:
        match_probability = calculate_identity_match(signature, profile)
        
        if match_probability >= 0.80:
            logger.info(f"🧵 Forensic Stitch Found! Conf: {match_probability*100}%")
            
            identity_cache[sig_key] = profile.aura_id
            background_tasks.add_task(merge_sessions_async, aura_id, profile.aura_id)
            
            return {
                "status": "stitched", 
                "stitched_id": profile.aura_id, 
                "confidence": match_probability
            }

    return {"status": "new_identity", "message": "Forensic profile initialized."}