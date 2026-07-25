from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from common.auth_guard import require_role, ALL_ROLES
from common.database import get_db
from common.models import CrimeCase
from common.schemas import Envelope
import random

router = APIRouter()

@router.get("/map")
def get_map_pins(user: dict = Depends(require_role(ALL_ROLES)), db: Session = Depends(get_db)):
    # Retrieve cases with location coordinates
    cases = db.query(CrimeCase).filter(CrimeCase.location_lat.isnot(None)).limit(200).all()
    pins = []
    for c in cases:
        pins.append({
            "crimeId": c.crime_id,
            "crimeType": c.crime_type,
            "district": c.district,
            "station": c.police_station,
            "status": c.status,
            "severityScore": c.severity_score,
            "lat": c.location_lat,
            "lng": c.location_lng,
            "dateTime": c.date_time.isoformat()
        })
    return Envelope.ok(pins)

@router.get("/district/{name}")
def get_district_stats(name: str, user: dict = Depends(require_role(ALL_ROLES)), db: Session = Depends(get_db)):
    if name == "All Districts":
        # Get total crimes across all districts
        total = db.query(CrimeCase).count()
        
        # Get trend (crimes per month across all districts)
        trend_data = db.query(
            func.month(CrimeCase.date_time).label("mth"),
            func.count(CrimeCase.id).label("cnt")
        ).group_by(func.month(CrimeCase.date_time)).all()
        
        # Top 3 police stations across all districts
        stations = db.query(
            CrimeCase.police_station,
            func.count(CrimeCase.id).label("cnt")
        ).group_by(CrimeCase.police_station)\
         .order_by(func.count(CrimeCase.id).desc()).limit(3).all()
    else:
        # Get total crimes in this district
        total = db.query(CrimeCase).filter(CrimeCase.district == name).count()
        
        # Get trend (crimes per month in the district)
        trend_data = db.query(
            func.month(CrimeCase.date_time).label("mth"),
            func.count(CrimeCase.id).label("cnt")
        ).filter(CrimeCase.district == name).group_by(func.month(CrimeCase.date_time)).all()
        
        # Top 3 police stations in this district
        stations = db.query(
            CrimeCase.police_station,
            func.count(CrimeCase.id).label("cnt")
        ).filter(CrimeCase.district == name).group_by(CrimeCase.police_station)\
         .order_by(func.count(CrimeCase.id).desc()).limit(3).all()
     
    trend_dict = {t[0]: t[1] for t in trend_data}
    if total == 0:
        sparkline = [0] * 12
    else:
        sparkline = [trend_dict.get(i, 0) for i in range(1, 13)]
     
    top_stations = [{"station": s[0], "count": s[1]} for s in stations]
    
    return Envelope.ok({
        "district": name,
        "totalCrimes": total,
        "sparkline": sparkline,
        "topStations": top_stations
    })

@router.get("/stations")
def get_top_stations(user: dict = Depends(require_role(ALL_ROLES)), db: Session = Depends(get_db)):
    # List top 10 police stations across Karnataka sorted by caseload
    stations = db.query(
        CrimeCase.police_station,
        CrimeCase.district,
        func.count(CrimeCase.id).label("caseload"),
        func.sum(func.case((CrimeCase.status == "solved", 1), else_=0)).label("solved")
    ).group_by(CrimeCase.police_station, CrimeCase.district)\
     .order_by(func.count(CrimeCase.id).desc()).limit(10).all()
     
    result = []
    for s_name, d_name, caseload, solved in stations:
        solved_rate = round((solved / caseload) * 100, 1) if caseload > 0 else 0.0
        result.append({
            "station": s_name,
            "district": d_name,
            "caseload": caseload,
            "solvedRate": solved_rate
        })
    return Envelope.ok(result)
