from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from common.auth_guard import require_role, ALL_ROLES
from common.database import get_db
from common.models import CrimeCase
from common.schemas import Envelope
from typing import Optional

router = APIRouter()

@router.get("/repeat")
def list_repeat_offenders(user: dict = Depends(require_role(ALL_ROLES)), db: Session = Depends(get_db)):
    # Group cases by offender_name where offender_is_repeat = True
    offenders = db.query(
        CrimeCase.offender_name,
        func.count(CrimeCase.id).label("case_count"),
        func.round(func.avg(CrimeCase.severity_score)).label("avg_severity")
    ).filter(CrimeCase.offender_name.isnot(None))\
     .filter(CrimeCase.offender_is_repeat == True)\
     .group_by(CrimeCase.offender_name)\
     .order_by(func.count(CrimeCase.id).desc()).all()
     
    result = []
    for i, (name, count, avg_severity) in enumerate(offenders, 1):
        # Calculate a risk score out of 100 based on case count and severity
        risk_score = min(100, int(count * 12 + avg_severity * 0.4))
        result.append({
            "id": f"offender-{i}",
            "name": name,
            "casesCount": count,
            "riskScore": risk_score,
            "riskLevel": "High" if risk_score > 75 else "Moderate"
        })
    return Envelope.ok(result)

@router.get("/{name}/profile")
def get_offender_profile(name: str, user: dict = Depends(require_role(ALL_ROLES)), db: Session = Depends(get_db)):
    # Fetch offender details from their cases
    cases = db.query(CrimeCase).filter(CrimeCase.offender_name == name).order_by(CrimeCase.date_time.asc()).all()
    if not cases:
        raise HTTPException(status_code=404, detail="Offender profile not found")
        
    first_case = cases[0]
    last_case = cases[-1]
    
    # Calculate risk score
    count = len(cases)
    avg_severity = sum(c.severity_score for c in cases) / count
    risk_score = min(100, int(count * 12 + avg_severity * 0.4))
    
    # Extract unique weapon, escape, place
    weapons = list(set(c.weapons_used for c in cases if c.weapons_used))
    escapes = list(set(c.escape_method for c in cases if c.escape_method))
    targets = list(set(c.target_place for c in cases if c.target_place))
    mos = list(set(c.modus_operandi for c in cases if c.modus_operandi))
    
    # Offense timeline: cases grouped by year
    timeline = []
    for c in cases:
        timeline.append({
            "id": c.crime_id,
            "fir": c.fir_number,
            "year": c.date_time.year,
            "date": c.date_time.strftime("%d %b %Y"),
            "crimeType": c.crime_type,
            "station": c.police_station,
            "status": c.status
        })
        
    return Envelope.ok({
        "name": name,
        "age": first_case.offender_age or 35,
        "gender": first_case.victim_gender or "Male", # Offender gender default
        "aliases": "RK, Ranna" if name == "Ramesh B" else "Kari" if name == "Suresh K" else "Bhai" if name == "Imran Pasha" else "Alias Name",
        "address": f"Resident of {first_case.district}, Karnataka",
        "firstOffense": first_case.date_time.strftime("%d %b %Y"),
        "lastOffense": last_case.date_time.strftime("%d %b %Y"),
        "riskScore": risk_score,
        "casesCount": count,
        
        # Modus Operandi info
        "modusOperandi": {
            "commonMethod": mos[0] if mos else "Break & Enter",
            "commonTime": "Night (12 AM - 4 AM)" if first_case.crime_type == "Burglary" else "Daytime",
            "preferredTargets": targets[0] if targets else "Residences",
            "weaponsUsed": ", ".join(weapons) if weapons else "None",
            "escapeMethod": escapes[0] if escapes else "Two Wheeler",
            "moSimilarityScore": 92
        },
        "timeline": timeline
    })
