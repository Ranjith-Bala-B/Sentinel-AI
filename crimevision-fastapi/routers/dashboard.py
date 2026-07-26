import random
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from common.auth_guard import require_role, ALL_ROLES
from common.database import get_db
from common.models import CrimeCase, IncidentAlert
from common.schemas import (
    Envelope,
    DashboardSummary,
    KpiSummary,
    CrimeCategoryPoint,
    DistrictRankPoint,
    StationRankPoint,
    TrendPoint,
    FeedItem,
)
from common.logger import get_logger

logger = get_logger("dashboard-service")
router = APIRouter()

def _load_summary_from_db(db: Session) -> DashboardSummary:
    # Auto-seed to 75 cases if initial cloud database contains fewer records
    if db.query(CrimeCase).count() < 75:
        try:
            from seed import seed_database
            seed_database()
        except Exception as e:
            logger.error(f"Auto-seeding error: {e}")

    # 1. Total Crimes (Actual DB Count)
    total_crimes = db.query(CrimeCase).count()
    
    # 2. Crimes this month & Crime rate change %
    max_date = db.query(func.max(CrimeCase.date_time)).scalar()
    if max_date:
        start_of_month = datetime(max_date.year, max_date.month, 1)
        crimes_this_month = db.query(CrimeCase).filter(CrimeCase.date_time >= start_of_month).count()
        
        # Previous month
        prev_month_year = max_date.year if max_date.month > 1 else max_date.year - 1
        prev_month = max_date.month - 1 if max_date.month > 1 else 12
        start_of_prev_month = datetime(prev_month_year, prev_month, 1)
        end_of_prev_month = datetime(max_date.year, max_date.month, 1)
        
        crimes_prev_month = db.query(CrimeCase).filter(
            CrimeCase.date_time >= start_of_prev_month,
            CrimeCase.date_time < end_of_prev_month
        ).count()
    else:
        crimes_this_month = 0
        crimes_prev_month = 0
    
    if crimes_prev_month > 0:
        crime_rate_change = round(((crimes_this_month - crimes_prev_month) / crimes_prev_month) * 100, 2)
    else:
        crime_rate_change = 0.0
        
    # 3. Active investigations (open/pending status)
    active_investigations = db.query(CrimeCase).filter(CrimeCase.status.in_(["pending", "open"])).count()
    
    # 4. Repeat offenders count
    repeat_offenders = db.query(func.count(func.distinct(CrimeCase.offender_name)))\
        .filter(CrimeCase.offender_is_repeat == True).scalar() or 0
        
    # 5. Active alerts from feed table
    active_alerts = db.query(IncidentAlert).filter(IncidentAlert.severity.in_(["critical", "high"])).count()
    
    # 6. High risk districts (districts with > 5 crimes in our dataset)
    district_counts = db.query(CrimeCase.district, func.count(CrimeCase.id).label("cnt"))\
        .group_by(CrimeCase.district).all()
    high_risk_districts = sum(1 for d in district_counts if d[1] > 5)
    
    # Generate KPI summary block
    kpi_block = KpiSummary(
        totalCrimes=total_crimes,
        crimesThisMonth=crimes_this_month,
        crimeRateChange=crime_rate_change,
        activeInvestigations=active_investigations,
        repeatOffenders=repeat_offenders,
        highRiskDistricts=high_risk_districts,
        activeAlerts=active_alerts
    )
    
    # 7. Crime by category distribution
    cat_query = db.query(CrimeCase.crime_type, func.count(CrimeCase.id).label("cnt"))\
        .group_by(CrimeCase.crime_type).order_by(func.count(CrimeCase.id).desc()).all()
    crime_by_category = [CrimeCategoryPoint(category=c[0], count=c[1]) for c in cat_query]
    
    # 8. District ranking (Sorted from higher complaints to lower)
    dist_query = db.query(CrimeCase.district, func.count(CrimeCase.id).label("cnt"))\
        .group_by(CrimeCase.district).order_by(func.count(CrimeCase.id).desc()).all()
    
    district_ranking = []
    for d_name, count in dist_query:
        d_cases = db.query(CrimeCase).filter(CrimeCase.district == d_name).all()
        
        low_c = sum(1 for c in d_cases if c.severity_score < 40)
        mod_c = sum(1 for c in d_cases if 40 <= c.severity_score < 60)
        high_c = sum(1 for c in d_cases if 60 <= c.severity_score < 80)
        crit_c = sum(1 for c in d_cases if c.severity_score >= 80)
        
        open_c = sum(1 for c in d_cases if (c.status or "").lower() == "open")
        pend_c = sum(1 for c in d_cases if (c.status or "").lower() == "pending")
        solv_c = sum(1 for c in d_cases if (c.status or "").lower() == "solved")
        clos_c = sum(1 for c in d_cases if (c.status or "").lower() == "closed")

        if count > 80:
            risk = "critical"
        elif count > 60:
            risk = "high"
        elif count > 30:
            risk = "moderate"
        else:
            risk = "low"
            
        district_ranking.append(DistrictRankPoint(
            district=d_name,
            count=count,
            riskLevel=risk,
            lowCount=low_c,
            moderateCount=mod_c,
            highCount=high_c,
            criticalCount=crit_c,
            openCount=open_c,
            pendingCount=pend_c,
            solvedCount=solv_c,
            closedCount=clos_c
        ))
        
    # 9. Top 5 Stations by caseload
    station_query = db.query(
        CrimeCase.police_station, 
        CrimeCase.district, 
        func.count(CrimeCase.id).label("caseload"),
        func.sum(case((CrimeCase.status == "solved", 1), else_=0)).label("solved_cnt")
    ).group_by(CrimeCase.police_station, CrimeCase.district)\
     .order_by(func.count(CrimeCase.id).desc()).limit(5).all()
     
    top_stations = []
    for s_name, d_name, caseload, solved in station_query:
        s_rate = round((solved / caseload) * 100, 1) if caseload > 0 else 0.0
        top_stations.append(StationRankPoint(station=s_name, district=d_name, solvedRate=s_rate, caseload=caseload))
        
    # 10. Monthly Trend (last 12 months)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    trend_query = db.query(
        func.month(CrimeCase.date_time).label("mth"),
        func.count(CrimeCase.id).label("crimes"),
        func.sum(case((CrimeCase.status == "solved", 1), else_=0)).label("solved")
    ).group_by(func.month(CrimeCase.date_time))\
     .order_by(func.month(CrimeCase.date_time)).all()
     
    # Map back to month strings
    monthly_trend = []
    trend_dict = {m[0]: (m[1], m[2]) for m in trend_query}
    for i, m_name in enumerate(months, 1):
        c_count, s_count = trend_dict.get(i, (0, 0))
        monthly_trend.append(TrendPoint(label=m_name, crimes=c_count, solved=s_count))
        
    # 11. Feed items (Newest registered complaints at TOP)
    feed_items = db.query(IncidentAlert).order_by(IncidentAlert.id.desc()).all()
    feed = [
        FeedItem(
            id=item.id,
            title=item.title,
            district=item.district,
            severity=item.severity,
            timestamp=item.timestamp
        ) for item in feed_items
    ]

    # 12. Status Breakdown (Open, Pending, Solved, Closed)
    from common.schemas import StatusPoint
    status_query = db.query(
        CrimeCase.status,
        func.count(CrimeCase.id).label("cnt")
    ).group_by(CrimeCase.status).all()

    status_map = { (s[0].lower() if s[0] else "open"): s[1] for s in status_query }
    total_cases_cnt = max(sum(status_map.values()), 1)

    ordered_statuses = [("Open", "open"), ("Pending", "pending"), ("Solved", "solved"), ("Closed", "closed")]
    status_breakdown = []
    for display_label, st_key in ordered_statuses:
        cnt = status_map.get(st_key, 0)
        pct = round((cnt / total_cases_cnt) * 100, 1)
        status_breakdown.append(StatusPoint(
            status=display_label,
            count=cnt,
            percentage=pct
        ))

    return DashboardSummary(
        kpis=kpi_block,
        crimeByCategory=crime_by_category,
        districtRanking=district_ranking,
        topStations=top_stations,
        monthlyTrend=monthly_trend,
        feed=feed,
        statusBreakdown=status_breakdown
    )

@router.get("/summary")
def get_summary(user: dict = Depends(require_role(ALL_ROLES)), db: Session = Depends(get_db)):
    summary = _load_summary_from_db(db)
    logger.info(f"dashboard summary served to user={user['user_id']}")
    return Envelope.ok(summary)

@router.get("/feed")
def get_feed(user: dict = Depends(require_role(ALL_ROLES)), db: Session = Depends(get_db)):
    feed_items = db.query(IncidentAlert).order_by(IncidentAlert.timestamp.asc()).all()
    feed = [
        FeedItem(
            id=item.id,
            title=item.title,
            district=item.district,
            severity=item.severity,
            timestamp=item.timestamp
        ) for item in feed_items
    ]
    return Envelope.ok(feed)
