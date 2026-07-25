from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from common.auth_guard import require_role, ALL_ROLES
from common.database import get_db
from common.models import CrimeCase, CrimeNetwork, Hotspot, SimilarCase, IncidentAlert
from pydantic import BaseModel
from common.schemas import Envelope
from common.logger import get_logger
from common.analytics_schemas import (
    CrimeAnalyticsResponse, CrimeRecordItem, LabeledCount, YearlyPoint, HourlyPoint,
    SeasonalPoint, WeekdayPoint, AgeGroupPoint, GenderPoint, CategoryPoint,
    DistrictComparisonPoint, StationComparisonPoint,
)


logger = get_logger("crime-service")
router = APIRouter()

def apply_filters(query, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup=None, victimGender=None):
    if district and district.strip() and district.lower() not in ["all", "all districts", "all_districts"]:
        query = query.filter(CrimeCase.district == district)
    if station and station.strip() and station.lower() not in ["all", "all stations", "all_stations"]:
        query = query.filter(CrimeCase.police_station == station)
    if crimeType and crimeType.strip() and crimeType.lower() not in ["all", "all types", "all_types"]:
        query = query.filter(CrimeCase.crime_type == crimeType)
    if status and status.strip() and status.lower() not in ["all", "all statuses", "all_statuses"]:
        query = query.filter(CrimeCase.status == status)
    if dateFrom:
        try:
            clean_date = dateFrom.split("T")[0]
            d_from = datetime.strptime(clean_date, "%Y-%m-%d")
            query = query.filter(CrimeCase.date_time >= d_from)
        except Exception as e:
            logger.error(f"Error parsing dateFrom {dateFrom}: {e}")
    if dateTo:
        try:
            clean_date = dateTo.split("T")[0]
            d_to = datetime.strptime(clean_date, "%Y-%m-%d")
            query = query.filter(CrimeCase.date_time <= d_to)
        except Exception as e:
            logger.error(f"Error parsing dateTo {dateTo}: {e}")
    if victimGender and victimGender.strip() and victimGender.lower() not in ["all", "all genders", "all_genders"]:
        query = query.filter(CrimeCase.victim_gender == victimGender)
    if victimAgeGroup and victimAgeGroup.strip() and victimAgeGroup.lower() not in ["all", "all ages", "all_ages"]:
        if victimAgeGroup == "0-17":
            query = query.filter(CrimeCase.victim_age < 18)
        elif victimAgeGroup == "18-30":
            query = query.filter(CrimeCase.victim_age >= 18, CrimeCase.victim_age <= 30)
        elif victimAgeGroup == "31-45":
            query = query.filter(CrimeCase.victim_age >= 31, CrimeCase.victim_age <= 45)
        elif victimAgeGroup == "46-60":
            query = query.filter(CrimeCase.victim_age >= 46, CrimeCase.victim_age <= 60)
        elif victimAgeGroup == "60+":
            query = query.filter(CrimeCase.victim_age > 60)
    return query


@router.get("")
def list_crimes(
    district: Optional[str] = None,
    station: Optional[str] = None,
    crimeType: Optional[str] = None,
    status: Optional[str] = None,
    dateFrom: Optional[str] = None,
    dateTo: Optional[str] = None,
    victimAgeGroup: Optional[str] = None,
    victimGender: Optional[str] = None,
    page: int = 1,
    limit: int = 25,
    user: dict = Depends(require_role(ALL_ROLES)),
    db: Session = Depends(get_db)
):
    query = db.query(CrimeCase)
    query = apply_filters(query, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup, victimGender)
    
    total = query.count()
    offset = (page - 1) * limit
    results = query.order_by(CrimeCase.date_time.desc()).offset(offset).limit(limit).all()
    
    data = []
    for c in results:
        data.append({
            "crimeId": c.crime_id,
            "firNumber": c.fir_number,
            "district": c.district,
            "station": c.police_station,
            "crimeType": c.crime_type,
            "dateTime": c.date_time.isoformat() + "+05:30",
            "status": c.status,
            "severityScore": c.severity_score,
            "description": c.description,
            "offenderName": c.offender_name,
            "offenderIsRepeat": c.offender_is_repeat
        })
        
    return Envelope.ok(data, meta={"page": page, "limit": limit, "total": total})

@router.get("/filters")
def get_filter_options(user: dict = Depends(require_role(ALL_ROLES)), db: Session = Depends(get_db)):
    districts_db = [d[0] for d in db.query(CrimeCase.district).distinct().all() if d[0]]
    stations_db = [s[0] for s in db.query(CrimeCase.police_station).distinct().all() if s[0]]
    crime_types_db = [c[0] for c in db.query(CrimeCase.crime_type).distinct().all() if c[0]]
    statuses_db = [s[0] for s in db.query(CrimeCase.status).distinct().all() if s[0]]

    KARNATAKA_DISTRICTS = [
        "Bagalkote", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
        "Bidar", "Chamarajanagara", "Chikkaballapura", "Chikkamagaluru", "Chitradurga",
        "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
        "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal",
        "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga",
        "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara", "Yadgir"
    ]
    ALL_CRIME_TYPES = [
        "Theft", "Cybercrime", "Assault", "Burglary", "Vehicle theft",
        "Fraud", "Narcotics", "Robbery", "Homicide", "Extortion", "Domestic Violence", "Vandalism"
    ]
    
    districts = sorted(list(set(districts_db + KARNATAKA_DISTRICTS)))
    crime_types = sorted(list(set(crime_types_db + ALL_CRIME_TYPES)))
    stations = sorted(list(set(stations_db + ["Whitefield PS", "Devanahalli PS", "Nazarbad PS", "Ballari City PS", "Hubballi Central PS", "M.G. Road PS", "Koramangala PS", "Indiranagar PS"])))
    statuses = sorted(list(set(statuses_db + ["open", "pending", "solved", "closed"])))
    
    options = {
        "districts": districts,
        "stations": stations,
        "crimeTypes": crime_types,
        "statuses": statuses,
        "ageGroups": ["0-17", "18-30", "31-45", "46-60", "60+"],
        "genders": ["Male", "Female", "Other"]
    }
    return Envelope.ok(options)


@router.get("/trends")
def get_trends(
    district: Optional[str] = None,
    station: Optional[str] = None,
    crimeType: Optional[str] = None,
    status: Optional[str] = None,
    dateFrom: Optional[str] = None,
    dateTo: Optional[str] = None,
    victimAgeGroup: Optional[str] = None,
    victimGender: Optional[str] = None,
    user: dict = Depends(require_role(ALL_ROLES)),
    db: Session = Depends(get_db)
):
    logger.info(f"user={user['user_id']} fetching trends from MySQL")
    
    # 1. Base Query
    base_query = db.query(CrimeCase)
    base_query = apply_filters(base_query, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup, victimGender)
    
    # Check if there's any data matching
    total_matching = base_query.count()
    if total_matching == 0:
        # Avoid division by zero, return empty result structure
        return Envelope.ok(CrimeAnalyticsResponse(
            monthlyTrend=[], yearlyTrend=[], categoryBreakdown=[], timeOfDay=[],
            seasonal=[], weekday=[], victimByAge=[], victimByGender=[], offenderByAge=[],
            repeatOffenderRate=0.0, districtComparison=[], stationComparison=[]
        ))
        
    # 2. Monthly Trend
    months_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_data = db.query(
        func.month(CrimeCase.date_time).label("mth"),
        func.count(CrimeCase.id).label("cnt")
    ).group_by(func.month(CrimeCase.date_time))
    monthly_data = apply_filters(monthly_data, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup, victimGender)
    monthly_dict = {m[0]: m[1] for m in monthly_data.all()}
    
    monthly_trend = [
        LabeledCount(label=name, count=monthly_dict.get(i, 0))
        for i, name in enumerate(months_labels, 1)
    ]
    
    # 3. Yearly Trend
    yearly_data = db.query(
        func.year(CrimeCase.date_time).label("yr"),
        func.count(CrimeCase.id).label("cnt")
    ).group_by(func.year(CrimeCase.date_time))
    yearly_data = apply_filters(yearly_data, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup, victimGender)
    yearly_trend = [
        YearlyPoint(year=str(y[0]), count=y[1])
        for y in yearly_data.order_by(func.year(CrimeCase.date_time)).all()
    ]
    
    # 4. Category Breakdown
    cat_data = db.query(
        CrimeCase.crime_type.label("cat"),
        func.count(CrimeCase.id).label("cnt")
    ).group_by(CrimeCase.crime_type)
    cat_data = apply_filters(cat_data, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup, victimGender)
    category_breakdown = [
        CategoryPoint(category=c[0], count=c[1])
        for c in cat_data.order_by(func.count(CrimeCase.id).desc()).all()
    ]
    
    # 5. Time of Day (Hour blocks: 00-03, 03-06, etc.)
    hourly_counts = {"00-03": 0, "03-06": 0, "06-09": 0, "09-12": 0, "12-15": 0, "15-18": 0, "18-21": 0, "21-24": 0}
    hour_data = db.query(
        func.hour(CrimeCase.date_time).label("hr"),
        func.count(CrimeCase.id).label("cnt")
    ).group_by(func.hour(CrimeCase.date_time))
    hour_data = apply_filters(hour_data, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup, victimGender)
    for hr, cnt in hour_data.all():
        if hr < 3: hourly_counts["00-03"] += cnt
        elif hr < 6: hourly_counts["03-06"] += cnt
        elif hr < 9: hourly_counts["06-09"] += cnt
        elif hr < 12: hourly_counts["09-12"] += cnt
        elif hr < 15: hourly_counts["12-15"] += cnt
        elif hr < 18: hourly_counts["15-18"] += cnt
        elif hr < 21: hourly_counts["18-21"] += cnt
        else: hourly_counts["21-24"] += cnt
        
    time_of_day = [HourlyPoint(hour=h, count=c) for h, c in hourly_counts.items()]
    
    # 6. Seasonal (Winter, Summer, Monsoon, Festival period)
    seasons = {"Winter": 0, "Summer": 0, "Monsoon": 0, "Festival period": 0}
    season_data = db.query(
        func.month(CrimeCase.date_time).label("mth"),
        func.count(CrimeCase.id).label("cnt")
    ).group_by(func.month(CrimeCase.date_time))
    season_data = apply_filters(season_data, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup, victimGender)
    for mth, cnt in season_data.all():
        if mth in [12, 1, 2]: seasons["Winter"] += cnt
        elif mth in [3, 4, 5]: seasons["Summer"] += cnt
        elif mth in [6, 7, 8]: seasons["Monsoon"] += cnt
        else: seasons["Festival period"] += cnt
        
    seasonal = [SeasonalPoint(season=s, count=c) for s, c in seasons.items()]
    
    # 7. Weekdays (Mon, Tue, etc.)
    days_map = {0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri", 5: "Sat", 6: "Sun"}
    weekday_counts = {name: 0 for name in days_map.values()}
    # WEEKDAY() in MySQL returns 0 for Monday, 6 for Sunday
    weekday_data = db.query(
        func.weekday(CrimeCase.date_time).label("wday"),
        func.count(CrimeCase.id).label("cnt")
    ).group_by(func.weekday(CrimeCase.date_time))
    weekday_data = apply_filters(weekday_data, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup, victimGender)
    for wday, cnt in weekday_data.all():
        if wday in days_map:
            weekday_counts[days_map[wday]] = cnt
            
    weekday = [WeekdayPoint(day=d, count=c) for d, c in weekday_counts.items()]
    
    # 8. Victim Demographics (Age & Gender)
    age_groups = {"0-17": 0, "18-30": 0, "31-45": 0, "46-60": 0, "60+": 0}
    age_data = db.query(
        CrimeCase.victim_age.label("age"),
        func.count(CrimeCase.id).label("cnt")
    ).filter(CrimeCase.victim_age.isnot(None)).group_by(CrimeCase.victim_age)
    age_data = apply_filters(age_data, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup, victimGender)
    for age, cnt in age_data.all():
        if age < 18: age_groups["0-17"] += cnt
        elif age <= 30: age_groups["18-30"] += cnt
        elif age <= 45: age_groups["31-45"] += cnt
        elif age <= 60: age_groups["46-60"] += cnt
        else: age_groups["60+"] += cnt
        
    victim_by_age = [AgeGroupPoint(ageGroup=a, count=c) for a, c in age_groups.items()]
    
    gender_counts = {"Male": 0, "Female": 0, "Other": 0}
    gender_data = db.query(
        CrimeCase.victim_gender.label("gen"),
        func.count(CrimeCase.id).label("cnt")
    ).filter(CrimeCase.victim_gender.isnot(None)).group_by(CrimeCase.victim_gender)
    gender_data = apply_filters(gender_data, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup, victimGender)
    for gen, cnt in gender_data.all():
        if gen in gender_counts:
            gender_counts[gen] = cnt
        else:
            gender_counts["Other"] += cnt
            
    victim_by_gender = [GenderPoint(gender=g, count=c) for g, c in gender_counts.items()]
    
    # 9. Offender Demographics
    off_age_groups = {"0-17": 0, "18-30": 0, "31-45": 0, "46-60": 0, "60+": 0}
    off_age_data = db.query(
        CrimeCase.offender_age.label("age"),
        func.count(CrimeCase.id).label("cnt")
    ).filter(CrimeCase.offender_age.isnot(None)).group_by(CrimeCase.offender_age)
    off_age_data = apply_filters(off_age_data, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup, victimGender)
    for age, cnt in off_age_data.all():
        if age < 18: off_age_groups["0-17"] += cnt
        elif age <= 30: off_age_groups["18-30"] += cnt
        elif age <= 45: off_age_groups["31-45"] += cnt
        elif age <= 60: off_age_groups["46-60"] += cnt
        else: off_age_groups["60+"] += cnt
        
    offender_by_age = [AgeGroupPoint(ageGroup=a, count=c) for a, c in off_age_groups.items()]
    
    # 10. Repeat Offender Rate (Accused who are repeat offender / all cases with accused)
    repeat_cases = db.query(CrimeCase).filter(CrimeCase.offender_name.isnot(None))\
                     .filter(CrimeCase.offender_is_repeat == True)
    repeat_cases = apply_filters(repeat_cases, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup, victimGender).count()
    
    total_accused_cases = db.query(CrimeCase).filter(CrimeCase.offender_name.isnot(None))
    total_accused_cases = apply_filters(total_accused_cases, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup, victimGender).count()
    
    repeat_offender_rate = round((repeat_cases / total_accused_cases) * 100, 1) if total_accused_cases > 0 else 0.0
    
    # 11. District comparison for bar chart
    dist_comp = db.query(
        CrimeCase.district.label("dist"),
        func.count(CrimeCase.id).label("cnt")
    ).group_by(CrimeCase.district)
    dist_comp = apply_filters(dist_comp, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup, victimGender)
    district_comparison = [
        DistrictComparisonPoint(district=d[0] if d[0] else "Unknown", count=d[1])
        for d in dist_comp.order_by(func.count(CrimeCase.id).desc()).all()
    ]
    
    # 12. Police station comparison
    station_comp = db.query(
        CrimeCase.police_station.label("station"),
        func.count(CrimeCase.id).label("cnt")
    ).group_by(CrimeCase.police_station)
    station_comp = apply_filters(station_comp, district, station, crimeType, status, dateFrom, dateTo, victimAgeGroup, victimGender)
    station_comparison = [
        StationComparisonPoint(station=s[0] if s[0] else "Unknown", count=s[1])
        for s in station_comp.order_by(func.count(CrimeCase.id).desc()).limit(10).all()
    ]
    
    matching_cases = base_query.order_by(CrimeCase.date_time.desc()).limit(100).all()
    records_list = [
        CrimeRecordItem(
            crimeId=c.crime_id,
            firNumber=c.fir_number,
            district=c.district,
            station=c.police_station,
            crimeType=c.crime_type,
            dateTime=c.date_time.isoformat() if c.date_time else "",
            status=c.status,
            severityScore=c.severity_score,
            description=c.description or "",
            offenderName=c.offender_name,
            offenderIsRepeat=c.offender_is_repeat
        )
        for c in matching_cases
    ]

    result = CrimeAnalyticsResponse(
        records=records_list,
        monthlyTrend=monthly_trend,
        yearlyTrend=yearly_trend,
        categoryBreakdown=category_breakdown,
        timeOfDay=time_of_day,
        seasonal=seasonal,
        weekday=weekday,
        victimByAge=victim_by_age,
        victimByGender=victim_by_gender,
        offenderByAge=offender_by_age,
        repeatOffenderRate=repeat_offender_rate,
        districtComparison=district_comparison,
        stationComparison=station_comparison
    )
    return Envelope.ok(result)



class CrimeRegisterRequest(BaseModel):
    fir_number: str
    crime_type: str
    date_time: str
    district: str
    police_station: str
    status: str
    severity_score: int
    description: Optional[str] = None
    victim_age: Optional[int] = None
    victim_gender: Optional[str] = None
    victim_employment: Optional[str] = None
    victim_education: Optional[str] = None
    urbanization: Optional[str] = None
    population_density: Optional[int] = None
    offender_name: Optional[str] = None
    offender_age: Optional[int] = None
    offender_is_repeat: bool = False
    modus_operandi: Optional[str] = None
    weapons_used: Optional[str] = None
    target_place: Optional[str] = None
    escape_method: Optional[str] = None

@router.post("/register")
def register_crime(payload: CrimeRegisterRequest, user: dict = Depends(require_role(ALL_ROLES)), db: Session = Depends(get_db)):
    try:
        # clean datetime string
        clean_date = payload.date_time.replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_date)
    except Exception as e:
        dt = datetime.now()

    year = dt.year
    # Count existing cases for the year to get sequential number
    count_this_year = db.query(CrimeCase).filter(func.year(CrimeCase.date_time) == year).count()
    crime_id = f"CR-{year}-{count_this_year + 1:05d}"

    # Approximate GPS centers for districts
    DISTRICT_CENTERS = {
        "Bengaluru Urban": (12.9716, 77.5946),
        "Mysuru": (12.2958, 76.6394),
        "Ballari": (15.1394, 76.9214),
        "Belagavi": (15.8497, 74.4977),
        "Hubballi-Dharwad": (15.3647, 75.1240),
        "Mangaluru": (12.9141, 74.8560),
        "Tumakuru": (13.3379, 77.1173),
        "Udupi": (13.3409, 74.7421)
    }

    center = DISTRICT_CENTERS.get(payload.district, (12.9716, 77.5946))
    import random
    lat = center[0] + random.uniform(-0.04, 0.04)
    lng = center[1] + random.uniform(-0.04, 0.04)

    case = CrimeCase(
        crime_id=crime_id,
        fir_number=payload.fir_number,
        crime_type=payload.crime_type,
        status=payload.status,
        date_time=dt,
        district=payload.district,
        police_station=payload.police_station,
        severity_score=payload.severity_score,
        description=payload.description or f"A case of {payload.crime_type} registered at {payload.police_station}.",
        victim_age=payload.victim_age,
        victim_gender=payload.victim_gender,
        victim_employment=payload.victim_employment,
        victim_education=payload.victim_education,
        urbanization=payload.urbanization or "Urban",
        population_density=payload.population_density or 500,
        offender_name=payload.offender_name,
        offender_age=payload.offender_age,
        offender_is_repeat=payload.offender_is_repeat,
        modus_operandi=payload.modus_operandi,
        weapons_used=payload.weapons_used,
        target_place=payload.target_place,
        escape_method=payload.escape_method,
        location_lat=lat,
        location_lng=lng
    )

    db.add(case)
    db.commit()
    db.refresh(case)

    # 1. Dynamic network nodes linking
    if payload.offender_name:
        # Offender to Crime connection
        db.add(CrimeNetwork(
            source_name=payload.offender_name,
            source_type="accused",
            target_name=crime_id,
            target_type="crime",
            connection_type="perpetrated",
            strength=2
        ))
        # Crime to Location connection
        db.add(CrimeNetwork(
            source_name=crime_id,
            source_type="crime",
            target_name=f"{payload.police_station} ({payload.district})",
            target_type="location",
            connection_type="occurred_at",
            strength=1
        ))
        db.commit()

    # 2. Dynamic Hotspot update/creation
    hotspot_name = f"{payload.police_station} Area"
    hotspot = db.query(Hotspot).filter(Hotspot.name == hotspot_name).first()
    if hotspot:
        hotspot.crime_count += 1
        if hotspot.crime_count > 10:
            hotspot.risk_level = "High"
        elif hotspot.crime_count > 5:
            hotspot.risk_level = "Medium"
        else:
            hotspot.risk_level = "Low"
    else:
        hotspot = Hotspot(
            name=hotspot_name,
            latitude=lat,
            longitude=lng,
            crime_count=1,
            risk_level="Low",
            recommended_action=f"Establish foot patrols and CCTV surveillance near {payload.police_station} limits."
        )
        db.add(hotspot)
    db.commit()

    # 3. Dynamic IncidentAlert feed entry
    alert_id = f"feed-{case.crime_id}"
    alert = IncidentAlert(
        id=alert_id,
        title=f"New {payload.crime_type} registered - FIR {payload.fir_number}",
        district=payload.district,
        severity="critical" if payload.severity_score >= 80 else "high" if payload.severity_score >= 60 else "moderate" if payload.severity_score >= 40 else "low",
        timestamp="Just now",
        is_read=False
    )
    db.add(alert)
    db.commit()

    # 4. Dynamic Similar Cases linking
    similar_cases = db.query(CrimeCase).filter(
        CrimeCase.crime_type == payload.crime_type,
        CrimeCase.crime_id != crime_id
    ).limit(3).all()
    
    for sc in similar_cases:
        db.add(SimilarCase(
            case_id=crime_id,
            similar_case_id=sc.crime_id,
            similarity_score=random.randint(70, 95),
            common_features=f"Identical crime category ({payload.crime_type}) with matching MO patterns.",
            investigation_lead=f"Coordinate with {sc.police_station} investigator to cross-reference suspect files."
        ))
        db.add(SimilarCase(
            case_id=sc.crime_id,
            similar_case_id=crime_id,
            similarity_score=random.randint(70, 95),
            common_features=f"Identical crime category ({payload.crime_type}) with matching MO patterns.",
            investigation_lead=f"Coordinate with {payload.police_station} investigator to cross-reference suspect files."
        ))
    db.commit()

    return Envelope.ok({
        "crimeId": crime_id,
        "firNumber": case.fir_number,
        "status": case.status
    })


class StatusUpdateRequest(BaseModel):
    status: str

@router.patch("/{crime_id}/status")
def update_crime_status(
    crime_id: str,
    payload: StatusUpdateRequest,
    user: dict = Depends(require_role(ALL_ROLES)),
    db: Session = Depends(get_db)
):
    case = db.query(CrimeCase).filter(CrimeCase.crime_id == crime_id).first()
    if not case:
        case = db.query(CrimeCase).filter(CrimeCase.id == crime_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Crime record '{crime_id}' not found")

    case.status = payload.status
    db.commit()
    db.refresh(case)
    logger.info(f"Updated status for crime_id={crime_id} to '{payload.status}' by user={user.get('user_id')}")
    return Envelope.ok({"crimeId": case.crime_id, "status": case.status})


@router.delete("/{crime_id}")
def delete_crime(
    crime_id: str,
    user: dict = Depends(require_role(ALL_ROLES)),
    db: Session = Depends(get_db)
):
    case = db.query(CrimeCase).filter(CrimeCase.crime_id == crime_id).first()
    if not case:
        case = db.query(CrimeCase).filter(CrimeCase.id == crime_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Crime record '{crime_id}' not found")

    # Delete related alerts if any
    db.query(IncidentAlert).filter(IncidentAlert.id == f"feed-{case.crime_id}").delete()
    
    db.delete(case)
    db.commit()
    logger.info(f"Deleted crime_id={crime_id} by user={user.get('user_id')}")
    return Envelope.ok({"message": f"Crime record {crime_id} deleted successfully", "crimeId": crime_id})




