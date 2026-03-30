from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import engine
from app.models.visit import Visit # Assuming your model stores these fields
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn")

def calculate_identity_match(new_sig: dict, existing_visit: Visit) -> float:
    """
    Calculates a probability score (0.0 to 1.0) that two signatures 
    belong to the same professional persona.
    """
    score = 0.0
    
    # 1. Canvas Match (High Weight)
    if new_sig.get('canvas') == existing_visit.canvas_hash:
        score += 0.40
        
    # 2. Clock Drift Match (Allowing for 1ms variance)
    drift_diff = abs(new_sig.get('drift', 0) - (existing_visit.clock_drift or 0))
    if drift_diff <= 1:
        score += 0.30
        
    # 3. Fonts Match
    if new_sig.get('fonts') == existing_visit.font_list:
        score += 0.20
        
    # 4. WebGL/Renderer Match
    if new_sig.get('webgl') == existing_visit.webgl_renderer:
        score += 0.10
        
    return score

@router.post("/resolve")
async def resolve_identity(payload: dict):
    aura_id = payload.get("aura_id")
    signature = payload.get("signature", {})
    
    with Session(engine) as session:
        # Step 1: Check for direct ID match first (Fastest)
        statement = select(Visit).where(Visit.aura_id == aura_id)
        existing_lead = session.exec(statement).first()
        
        if existing_lead:
            logger.info(f"🎯 Direct Match Found: {aura_id}. Updating signature.")
            # Update forensic data if it has changed
            existing_lead.canvas_hash = signature.get('canvas')
            existing_lead.clock_drift = signature.get('drift')
            session.add(existing_lead)
            session.commit()
            return {"status": "recognized", "method": "direct_id"}

        # Step 2: Perform Weighted Forensic Search (The "Stitch")
        # We look for visits in the last 30 days with similar hardware
        all_recent = session.exec(select(Visit).limit(100)).all()
        
        for visit in all_recent:
            match_probability = calculate_identity_match(signature, visit)
            
            if match_probability >= 0.80: # High Confidence Threshold
                logger.info(f"🧵 Session Stitched! Probability: {match_probability*100}%")
                return {
                    "status": "stitched", 
                    "original_id": visit.aura_id, 
                    "confidence": match_probability
                }

    return {"status": "new_identity", "message": "Forensic profile created."}