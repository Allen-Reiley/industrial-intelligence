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
    Weights normalized to 1.0 for B2B Industrial environments.
    """
    score = 0.0
    
    # 1. Canvas Match (40% Weight) - Primary hardware rendering signature
    if new_sig.get('canvas') == existing_visit.canvas_hash:
        score += 0.40
        
    # 2. Clock Drift Match (30% Weight) - Precision timing delta
    # Allow 1ms variance for network jitter
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

def merge_sessions_sync(new_id: str, original_id: str):
    """
    Sync wrapper for the background merge task to unify fragmented session data.
    """
    with Session(engine) as session:
        try:
            statement = select(Visit).where(Visit.aura_id == new_id)
            visits_to_update = session.exec(statement).all()
            
            for visit in visits_to_update:
                visit.aura_id = original_id
                session.add(visit)
            
            session.commit()
            logger.info(f"🔗 Forensic Stitch Success: {new_id} unified into {original_id}")
        except Exception as e:
            logger.error(f"❌ Session Merge Failure: {e}")

@router.post("/resolve")
async def resolve_identity(payload: dict, background_tasks: BackgroundTasks):
    aura_id = payload.get("aura_id")
    signature = payload.get("signature", {})
    
    if not aura_id:
        raise HTTPException(status_code=400, detail="Missing aura_id")

    with Session(engine) as session:
        # Step 1: Check for direct ID match (Existing browser session)
        statement = select(Visit).where(Visit.aura_id == aura_id).order_by(Visit.created_at.desc())
        existing_visit = session.exec(statement).first()
        
        if existing_visit:
            logger.info(f"🎯 Direct Match: {aura_id}. Refreshing Forensic Lock.")
            # Update the fingerprint in case they updated their browser/OS
            existing_visit.canvas_hash = signature.get('canvas')
            existing_visit.clock_drift = signature.get('drift')
            existing_visit.webgl_renderer = signature.get('webgl')
            existing_visit.font_list = signature.get('fonts')
            session.add(existing_visit)
            session.commit()
            return {"status": "recognized", "method": "direct_id"}

        # Step 2: Weighted Forensic Search (The "Identity Bridge")
        # Scan recent industrial footprints for a hardware match
        all_recent = session.exec(select(Visit).order_by(Visit.created_at.desc()).limit(150)).all()
        
        # Deduplicate results by aura_id to only compare unique profiles
        unique_profiles = {v.aura_id: v for v in all_recent}.values()
        
        for profile in unique_profiles:
            match_probability = calculate_identity_match(signature, profile)
            
            # High Confidence Threshold (85%)
            if match_probability >= 0.85:
                logger.info(f"🧵 Forensic Stitch Identified! Conf: {match_probability*100}%")
                
                # Unify this new ID with the historical profile in the background
                background_tasks.add_task(merge_sessions_sync, aura_id, profile.aura_id)
                
                # Signal the frontend to update its local storage to the original ID
                return {
                    "status": "stitched", 
                    "stitched_id": profile.aura_id, 
                    "confidence": match_probability
                }

    return {"status": "new_identity", "message": "Forensic profile initialized."}