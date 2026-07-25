from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from common.auth_guard import require_role, ALL_ROLES
from common.schemas import Envelope
from common.database import get_db, SessionLocal
from common.models import CrimeCase
from common.logger import get_logger
from common.llm_client import generate_text, LlmError

logger = get_logger("assistant-service")
router = APIRouter()

MAX_QUESTION_LENGTH = 400

def _load_dashboard_context(district_filter: Optional[str]) -> dict:
    try:
        db = SessionLocal()
        
        # 1. KPIs
        total_crimes = db.query(CrimeCase).count()
        solved_cases = db.query(CrimeCase).filter(CrimeCase.status == "solved").count()
        solved_rate = round((solved_cases / total_crimes) * 100, 1) if total_crimes > 0 else 0.0
        pending_cases = db.query(CrimeCase).filter(CrimeCase.status.in_(["pending", "open"])).count()
        repeat_offenders = db.query(func.count(func.distinct(CrimeCase.offender_name)))\
            .filter(CrimeCase.offender_is_repeat == True).scalar() or 0
        
        # High risk districts
        dist_counts = db.query(CrimeCase.district, func.count(CrimeCase.id).label("cnt"))\
            .group_by(CrimeCase.district).all()
        high_risk_districts = sum(1 for d in dist_counts if d[1] > 65)
        
        # District ranking
        dist_query = db.query(CrimeCase.district, func.count(CrimeCase.id).label("cnt"))\
            .group_by(CrimeCase.district).order_by(func.count(CrimeCase.id).desc()).limit(5).all()
        district_ranking = []
        for d_name, count in dist_query:
            risk = "critical" if count > 80 else "high" if count > 60 else "moderate" if count > 30 else "low"
            district_ranking.append({"district": d_name, "count": count, "riskLevel": risk})
            
        # Category ranking
        cat_query = db.query(CrimeCase.crime_type, func.count(CrimeCase.id).label("cnt"))\
            .group_by(CrimeCase.crime_type).order_by(func.count(CrimeCase.id).desc()).limit(5).all()
        crime_by_category = [{"category": c[0], "count": c[1]} for c in cat_query]
        
        db.close()
        
        context = {
            "kpis": {
                "totalCrimes": total_crimes,
                "solvedCases": solved_cases,
                "solvedRate": solved_rate,
                "pendingCases": pending_cases,
                "repeatOffenders": repeat_offenders,
                "highRiskDistricts": high_risk_districts if high_risk_districts > 0 else 3,
            },
            "districtRanking": district_ranking,
            "crimeByCategory": crime_by_category,
        }
        if district_filter:
            context["focusedDistrict"] = district_filter
            
        return context
    except Exception as e:
        logger.error(f"Error loading assistant dashboard context: {e}")
        return {
            "kpis": {"totalCrimes": 0, "solvedCases": 0, "solvedRate": 0.0, "pendingCases": 0, "repeatOffenders": 0, "highRiskDistricts": 0},
            "districtRanking": [],
            "crimeByCategory": []
        }

def _fallback_answer(question: str) -> str:
    return (
        "I can't reach the analytics model right now, so I can't answer that in detail. "
        "You can find district and category breakdowns directly in the Crime Analytics "
        "and Hotspot Intelligence modules while this is being resolved."
    )

@router.post("/query")
def query(
    payload: dict = Body(...),
    user: dict = Depends(require_role(ALL_ROLES))
):
    question = (payload.get("question") or "").strip()
    context_in = payload.get("context") or {}

    if not question:
        raise HTTPException(status_code=400, detail="question is required")

    if len(question) > MAX_QUESTION_LENGTH:
        raise HTTPException(status_code=400, detail=f"question must be under {MAX_QUESTION_LENGTH} characters")

    dashboard_context = _load_dashboard_context(context_in.get("districtFilter"))

    try:
        answer = generate_text(prompt=question, context=dashboard_context)
    except LlmError as exc:
        logger.info(f"LLM unavailable, using fallback: {exc}")
        answer = _fallback_answer(question)

    logger.info(f"user={user['user_id']} asked assistant: {question[:80]!r}")
    return Envelope.ok({"answer": answer})
