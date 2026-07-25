from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from common.auth_guard import require_role, ALL_ROLES
from common.database import get_db
from common.models import CrimeCase
from common.schemas import Envelope

router = APIRouter()

@router.get("/insights")
def get_sociological_insights(user: dict = Depends(require_role(ALL_ROLES)), db: Session = Depends(get_db)):
    # 1. Crime vs Population (Scatter Plot)
    # Get caseload and average population density for each district
    pop_query = db.query(
        CrimeCase.district,
        func.count(CrimeCase.id).label("caseload"),
        func.avg(CrimeCase.population_density).label("avg_density")
    ).group_by(CrimeCase.district).all()
    
    crime_vs_pop = [
        {"district": p[0], "population": int(p[2] or 1000) * 10, "crimes": p[1]}
        for p in pop_query
    ]
    
    # 2. Crime vs Urbanization (Bar Chart)
    urb_query = db.query(
        CrimeCase.urbanization,
        func.count(CrimeCase.id).label("caseload")
    ).filter(CrimeCase.urbanization.isnot(None))\
     .group_by(CrimeCase.urbanization).all()
     
    crime_vs_urban = [
        {"type": u[0], "crimes": u[1]}
        for u in urb_query
    ]
    
    # 3. Crime vs Education (Donut Chart)
    edu_query = db.query(
        CrimeCase.victim_education,
        func.count(CrimeCase.id).label("caseload")
    ).filter(CrimeCase.victim_education.isnot(None))\
     .group_by(CrimeCase.victim_education).all()
     
    crime_vs_education = [
        {"level": e[0], "count": e[1]}
        for e in edu_query
    ]
    
    # 4. Crime vs Employment (Line Chart)
    emp_query = db.query(
        CrimeCase.victim_employment,
        func.count(CrimeCase.id).label("caseload")
    ).filter(CrimeCase.victim_employment.isnot(None))\
     .group_by(CrimeCase.victim_employment).all()
     
    crime_vs_employment = [
        {"status": em[0], "count": em[1]}
        for em in emp_query
    ]
    
    return Envelope.ok({
        "crimeVsPopulation": crime_vs_pop,
        "crimeVsUrbanization": crime_vs_urban,
        "crimeVsEducation": crime_vs_education,
        "crimeVsEmployment": crime_vs_employment
    })
