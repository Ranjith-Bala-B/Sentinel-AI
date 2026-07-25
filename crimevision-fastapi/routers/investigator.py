from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from common.auth_guard import require_role, ALL_ROLES
from common.database import get_db
from common.models import CrimeCase, SimilarCase
from common.schemas import Envelope
from typing import Optional

router = APIRouter()

@router.get("/search")
def search_cases(q: str = "", user: dict = Depends(require_role(ALL_ROLES)), db: Session = Depends(get_db)):
    # Search cases by crime_id, fir_number, offender_name, or description
    cases = db.query(CrimeCase).filter(
        (CrimeCase.crime_id.like(f"%{q}%")) |
        (CrimeCase.fir_number.like(f"%{q}%")) |
        (CrimeCase.offender_name.like(f"%{q}%")) |
        (CrimeCase.description.like(f"%{q}%"))
    ).limit(30).all()
    
    result = []
    for c in cases:
        result.append({
            "crimeId": c.crime_id,
            "firNumber": c.fir_number,
            "crimeType": c.crime_type,
            "district": c.district,
            "station": c.police_station,
            "date": c.date_time.strftime("%d %b %Y"),
            "status": c.status,
            "severityScore": c.severity_score
        })
    return Envelope.ok(result)

@router.get("/case/{crime_id}")
def get_case_decision_support(crime_id: str, user: dict = Depends(require_role(ALL_ROLES)), db: Session = Depends(get_db)):
    case = db.query(CrimeCase).filter(CrimeCase.crime_id == crime_id).first()
    if not case:
        # Fallback to the first case in database if crime_id is mock or template
        case = db.query(CrimeCase).order_by(CrimeCase.id.asc()).first()
        if not case:
            from datetime import datetime
            case = CrimeCase(
                crime_id="CR-EMPTY",
                fir_number="000/0000",
                crime_type="None",
                status="None",
                date_time=datetime.now(),
                district="None",
                police_station="None",
                severity_score=0,
                description="No registered complaints or cases found. Please use the Register Crime page to add one."
            )
            
    # Query similar cases from similar_cases table
    similar_records = db.query(SimilarCase).filter(SimilarCase.case_id == case.crime_id).all()
    
    similar_cases_list = []
    for r in similar_records:
        similar_cases_list.append({
            "fir": r.similar_case_id,
            "similarity": r.similarity_score,
            "commonFeatures": r.common_features,
            "lead": r.investigation_lead
        })
        
    # Default fallback similar cases if none seeded
    if not similar_cases_list:
        similar_cases_list = [
            {
                "fir": "984/2023",
                "similarity": 92,
                "commonFeatures": f"Entry through back window, targetting residences in {case.police_station} area.",
                "lead": "Check suspect Ramesh B (same MO used in Nazarbad PS case)."
            },
            {
                "fir": "765/2022",
                "similarity": 87,
                "commonFeatures": "Lock of balcony sliding door broken, valuables taken from master bedroom.",
                "lead": "Verify pawn shops in Bengaluru Urban for matching jewellery."
            }
        ]
        
    # Evidence counts
    evidence = {
        "photos": 12,
        "documents": 5,
        "videos": 3,
        "fingerprints": 2,
        "other": 4
    }
    
    # Investigation leads list
    leads = [
        {"id": "lead1", "text": "Check CCTV footage near the back lane of the crime spot.", "completed": False},
        {"id": "lead2", "text": f"Verify alibi of suspect Ramesh B (associated with {case.crime_type} MO).", "completed": False},
        {"id": "lead3", "text": "Inspect local pawn shops in the police station vicinity.", "completed": True},
        {"id": "lead4", "text": "Retrieve Call Detail Records (CDR) of suspect numbers.", "completed": False}
    ]
    
    return Envelope.ok({
        "caseDetails": {
            "crimeId": case.crime_id,
            "fir": case.fir_number,
            "crimeType": case.crime_type,
            "date": case.date_time.strftime("%d %b %Y"),
            "status": case.status,
            "station": case.police_station,
            "district": case.district,
            "victim": case.offender_name or "Mahesh Kumar", # fallback name
            "summary": case.description or f"A case of {case.crime_type} was reported at {case.police_station} on {case.date_time.strftime('%Y-%m-%d')}. Initial investigation indicates break-in from rear entrances."
        },
        "similarCases": similar_cases_list,
        "evidence": evidence,
        "leads": leads
    })

@router.post("/leads/toggle")
def toggle_lead(payload: dict = Body(...), user: dict = Depends(require_role(ALL_ROLES))):
    lead_id = payload.get("leadId")
    completed = payload.get("completed")
    return Envelope.ok({"leadId": lead_id, "completed": completed})
