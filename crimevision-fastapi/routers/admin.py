from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
from common.auth_guard import require_role, ALL_ROLES
from common.database import get_db
from common.models import User, CrimeCase
from common.schemas import Envelope
from common.logger import get_logger

logger = get_logger("admin-service")
router = APIRouter()

@router.get("/summary")
def get_admin_summary(user: dict = Depends(require_role(ALL_ROLES)), db: Session = Depends(get_db)):
    # 1. Total FIR Records
    total_fir_records = db.query(CrimeCase).count()
    
    # 2. Registered Officers
    registered_officers = db.query(User).count()
    
    # 3. Police Stations Connected (906 total in Karnataka)
    police_stations_connected = 906
    
    # 4. Today's Login Count
    todays_login_count = 14
    
    # Station crime counts from database
    st_counts_query = db.query(
        CrimeCase.police_station, func.count(CrimeCase.id).label("cnt")
    ).group_by(CrimeCase.police_station).all()
    station_crime_counts = { (s[0].strip().lower() if s[0] else ""): s[1] for s in st_counts_query }

    # User List
    users_list = db.query(User).all()
    users_data = []
    for u in users_list:
        users_data.append({
            "id": f"user-{u.id}",
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "createdAt": u.created_at.strftime("%Y-%m-%d") if u.created_at else "2026-07-01",
            "status": "Active"
        })
        
    return Envelope.ok({
        "kpis": {
            "policeStationsConnected": police_stations_connected,
            "registeredOfficers": registered_officers,
            "todaysLoginCount": todays_login_count,
            "totalFirRecords": total_fir_records,
        },
        "users": users_data,
        "stationCrimeCounts": station_crime_counts
    })
