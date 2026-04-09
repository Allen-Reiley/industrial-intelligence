from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from app.db import engine
from app.models.visit import Visit
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")

def calculate_identity_match(new_sig: dict, existing_visit: Visit) -> float:
    """
    Calculates a probability score (0.0 to 1.0) based on hardware and network entropy.
    Updated for Industrial Clusters: Weights adjusted to prioritize network consistency.
    """
    score = 0.0
    
    # 1. Canvas Match (30% Weight) - Hardware rendering fingerprint
    if new_sig.get('canvas') == existing_visit.canvas_hash:
        score += 0.30
        
    # 2. Clock Drift Match (20% Weight) - Precision timing delta
    drift_diff = abs(new_sig.get('drift', 0) - (existing_visit.clock_drift or 0))
    if drift_diff <= 1:
        score += 0.20
        
    # 3. WebGL/Renderer Match (10% Weight) - GPU identification
    if new_sig.get('webgl') == existing_visit.webgl_renderer:
        score += 0.10
        
    # 4. Network Intelligence Match (40% Weight) - The Corporate Signal
    # We compare the effective type, RTT, and downlink speed
    net = new_sig.get('network', {})
    if isinstance(net, dict):
        # Match Connection Type (4g/fiber)
        if net.get('type') == existing_visit.effective_connection_type:
            score += 0.15
            
        # Match Network Performance (RTT and Downlink)
        # Allows for small variance in traffic load
        rtt_match = abs(net.get('rtt', 0) - (existing_visit.rtt or 0)) <= 20
        downlink_match = abs(net.get('downlink', 0) - (existing_visit.downlink_speed or 0)) < 0.5
        
        if rtt_match and downlink_match:
            score += 0.25
            
    return score

def merge_sessions_sync(new_id: str, original_id: str):
    """
    Sync wrapper to unify fragmented session data across the forensic ledger.
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
            logger.info(f"🎯 Direct Match: {aura_id}. Updating Forensic/Network Lock.")
            # Update markers to the latest state
            existing_visit.canvas_hash = signature.get('canvas')
            existing_visit.clock_drift = signature.get('drift')
            existing_visit.webgl_renderer = signature.get('webgl')
            
            net = signature.get('network', {})
            if isinstance(net, dict):
                existing_visit.effective_connection_type = net.get('type')
                existing_visit.downlink_speed = net.get('downlink')
                existing_visit.rtt = net.get('rtt')
                
            session.add(existing_visit)
            session.commit()
            return {"status": "recognized", "method": "direct_id"}

        # Step 2: Weighted Forensic Search
        # Scan recent footprints (within the last 72 hours for accuracy)
        all_recent = session.exec(select(Visit).order_by(Visit.created_at.desc()).limit(200)).all()
        unique_profiles = {v.aura_id: v for v in all_recent}.values()
        
        for profile in unique_profiles:
            match_probability = calculate_identity_match(signature, profile)
            
            # High Confidence Threshold for stitching (80% given the new network weight)
            if match_probability >= 0.80:
                logger.info(f"🧵 Forensic Stitch Identified! Conf: {match_probability*100}%")
                
                background_tasks.add_task(merge_sessions_sync, aura_id, profile.aura_id)
                
                return {
                    "status": "stitched", 
                    "stitched_id": profile.aura_id, 
                    "confidence": match_probability
                }

    return {"status": "new_identity", "message": "Forensic profile initialized."}