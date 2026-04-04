from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from app.db import engine
from app.models.visit import Visit
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")

def calculate_identity_match(new_sig: dict, existing_visit: Visit) -> float:
    """
    Calculates a probability score (0.0 to 1.0) based on hardware entropy.
    Weights are tuned for B2B Industrial environments (Corporate NATs).
    """
    score = 0.0
    
    # 1. Canvas Match (40% Weight) - Most unique hardware signature
    if new_sig.get('canvas') == existing_visit.canvas_hash:
        score += 0.40
        
    # 2. Clock Drift Match (30% Weight) - Precision timing delta (allow 1ms)
    drift_diff = abs(new_sig.get('drift', 0) - (existing_visit.clock_drift or 0))
    if drift_diff <= 1:
        score += 0.30
        
    # 3. Fonts Match (20% Weight) - OS/Software profile
    if new_sig.get('fonts') == existing_visit.font_list:
        score += 0.20
        
    # 4. WebGL/Renderer Match (10% Weight) - GPU identification
    if new_sig.get('webgl') == existing_visit.webgl_renderer:
        score += 0.10
        
    return score

async def merge_sessions(session: Session, new_id: str, original_id: str):
    """Background task to unify fragmented session data after a forensic stitch."""
    statement = select(Visit).where(Visit.aura_id == new_id)
    recent_visits = session.exec(statement).all()
    for visit in recent_visits:
        visit.aura_id = original_id
        session.add(visit)
    session.commit()
    logger.info(f"🔗 Session Merge Complete: {new_id} -> {original_id}")

@router.post("/resolve")
async def resolve_identity(payload: dict, background_tasks: BackgroundTasks):
    aura_id = payload.get("aura_id")
    signature = payload.get("signature", {})
    
    if not aura_id:
        raise HTTPException(status_code=400, detail="Missing aura_id")

    with Session(engine) as session:
        # Step 1: Check for direct ID match (Existing browser session)
        statement = select(Visit).where(Visit.aura_id == aura_id)
        existing_lead = session.exec(statement).first()
        
        if existing_lead:
            logger.info(f"🎯 Direct Match: {aura_id}. Refreshing Forensic Lock.")
            existing_lead.canvas_hash = signature.get('canvas')
            existing_lead.clock_drift = signature.get('drift')
            existing_lead.webgl_renderer = signature.get('webgl')
            existing_lead.font_list = signature.get('fonts')
            session.add(existing_lead)
            session.commit()
            return {"status": "recognized", "method": "direct_id"}

        # Step 2: Weighted Forensic Search (The "Identity Bridge")
        # Search the last 100 industrial footprints for a hardware match
        all_recent = session.exec(select(Visit).order_by(Visit.created_at.desc()).limit(100)).all()
        
        for visit in all_recent:
            match_probability = calculate_identity_match(signature, visit)
            
            if match_probability >= 0.85: # High Confidence Threshold for Stitched Profiles
                logger.info(f"🧵 Forensic Stitch Identified! Conf: {match_probability*100}%")
                
                # Trigger a background merge to unify this session with the original profile
                background_tasks.add_task(merge_sessions, session, aura_id, visit.aura_id)
                
                # Return 'stitched_id' so aura.js can sync the local storage
                return {
                    "status": "stitched", 
                    "stitched_id": visit.aura_id, 
                    "confidence": match_probability
                }

    return {"status": "new_identity", "message": "Forensic profile created."}