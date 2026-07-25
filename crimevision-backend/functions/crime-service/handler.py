"""crime-service - Catalyst Advanced I/O function.

  GET /crimes            -> paginated, filterable list of crime records
  GET /crimes/{id}        -> single crime record with victim/offender detail
  GET /crimes/filters     -> distinct filter option values (districts,
                              stations, crime types) to populate the
                              Crime Analytics filter panel

Filters supported on GET /crimes: district, station, crimeType,
dateFrom, dateTo, victimAge, victimGender, offenderAge, status.
Translated to a parameterized ZCQL WHERE clause - never raw string
interpolation - to avoid injection.
"""
import sys
import os
from urllib.parse import parse_qs, urlparse

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from common.auth_guard import require_role, ALL_ROLES  # noqa: E402
from common.schemas import Envelope  # noqa: E402
from common.logger import get_logger  # noqa: E402
from common.analytics_schemas import (  # noqa: E402
    CrimeAnalyticsResponse, LabeledCount, YearlyPoint, HourlyPoint,
    SeasonalPoint, WeekdayPoint, AgeGroupPoint, GenderPoint, CategoryPoint,
)

logger = get_logger("crime-service")

ALLOWED_FILTERS = {
    "district", "station", "crimeType", "dateFrom", "dateTo",
    "victimAge", "victimGender", "offenderAge", "status",
}


def _parse_filters(request) -> dict:
    query = getattr(request, "get_query_string", lambda: "")() or ""
    parsed = parse_qs(query)
    return {k: v[0] for k, v in parsed.items() if k in ALLOWED_FILTERS}


def _build_zcql_where(filters: dict) -> str:
    """Builds a parameterized WHERE clause fragment from validated filters.

    In production, values are bound via the Catalyst ZCQL parameter API
    rather than concatenated, e.g. zcql.execute_query(query, params).
    This function only whitelists which columns may be filtered on.
    """
    clauses = []
    if "district" in filters:
        clauses.append("district_id = :district")
    if "station" in filters:
        clauses.append("station_id = :station")
    if "crimeType" in filters:
        clauses.append("crime_type = :crimeType")
    if "status" in filters:
        clauses.append("status = :status")
    if "dateFrom" in filters:
        clauses.append("date_time >= :dateFrom")
    if "dateTo" in filters:
        clauses.append("date_time <= :dateTo")
    return " AND ".join(clauses) if clauses else "1=1"


@require_role(ALL_ROLES)
def list_crimes(request, response, user):
    filters = _parse_filters(request)
    where_clause = _build_zcql_where(filters)
    logger.info(f"user={user['user_id']} listing crimes where {where_clause} params={filters}")

    # TODO: replace with common.catalyst_client.zcql_query(request, f"SELECT * FROM Crimes WHERE {where_clause} LIMIT 50")
    sample_rows = [
        {
            "crimeId": "CR-2026-04812",
            "firNumber": "112/2026",
            "district": filters.get("district", "Bengaluru Urban"),
            "station": "Whitefield PS",
            "crimeType": filters.get("crimeType", "Theft"),
            "dateTime": "2026-06-21T14:30:00+05:30",
            "status": filters.get("status", "pending"),
            "severityScore": 62,
        }
    ]
    response.set_status(200)
    response.send(Envelope.ok(sample_rows, meta={"page": 1, "total": len(sample_rows)}).model_dump_json())


@require_role(ALL_ROLES)
def get_filter_options(request, response, user):
    options = {
        "districts": ["Bengaluru Urban", "Mysuru", "Ballari", "Belagavi", "Hubballi-Dharwad", "Mangaluru"],
        "crimeTypes": ["Theft", "Cybercrime", "Assault", "Burglary", "Vehicle theft", "Fraud", "Narcotics"],
        "statuses": ["open", "pending", "solved"],
    }
    response.set_status(200)
    response.send(Envelope.ok(options).model_dump_json())


@require_role(ALL_ROLES)
def get_trends(request, response, user):
    filters = _parse_filters(request)
    where_clause = _build_zcql_where(filters)
    logger.info(f"user={user['user_id']} fetching trends where {where_clause} params={filters}")

    # TODO: replace each series below with a grouped ZCQL aggregate query,
    # e.g. SELECT crime_type, COUNT(*) FROM Crimes WHERE {where_clause} GROUP BY crime_type
    # scaled/filtered server-side rather than hardcoded, once Data Store is populated.
    result = CrimeAnalyticsResponse(
        monthlyTrend=[LabeledCount(label=m, count=c) for m, c in [
            ("Jan", 3820), ("Feb", 3610), ("Mar", 3990), ("Apr", 4120), ("May", 4380), ("Jun", 4290),
            ("Jul", 4510), ("Aug", 4460), ("Sep", 4610), ("Oct", 4780), ("Nov", 4920), ("Dec", 4720),
        ]],
        yearlyTrend=[YearlyPoint(year=y, count=c) for y, c in [
            ("2021", 41200), ("2022", 43850), ("2023", 45620), ("2024", 46980), ("2025", 47510), ("2026", 48213),
        ]],
        categoryBreakdown=[CategoryPoint(category=cat, count=c) for cat, c in [
            ("Theft", 12840), ("Cybercrime", 8320), ("Assault", 6210), ("Burglary", 5430),
            ("Vehicle theft", 4980), ("Fraud", 4310), ("Narcotics", 3120), ("Others", 3003),
        ]],
        timeOfDay=[HourlyPoint(hour=h, count=c) for h, c in [
            ("00-03", 1820), ("03-06", 1120), ("06-09", 2640), ("09-12", 3980),
            ("12-15", 4210), ("15-18", 5340), ("18-21", 6480), ("21-24", 3910),
        ]],
        seasonal=[SeasonalPoint(season=s, count=c) for s, c in [
            ("Winter", 10820), ("Summer", 13640), ("Monsoon", 11930), ("Festival period", 11823),
        ]],
        weekday=[WeekdayPoint(day=d, count=c) for d, c in [
            ("Mon", 6340), ("Tue", 6120), ("Wed", 6280), ("Thu", 6410), ("Fri", 7120), ("Sat", 8340), ("Sun", 7599),
        ]],
        victimByAge=[AgeGroupPoint(ageGroup=a, count=c) for a, c in [
            ("0-17", 3210), ("18-30", 14820), ("31-45", 15640), ("46-60", 9820), ("60+", 4723),
        ]],
        victimByGender=[GenderPoint(gender=g, count=c) for g, c in [
            ("Male", 27340), ("Female", 20120), ("Other", 753),
        ]],
        offenderByAge=[AgeGroupPoint(ageGroup=a, count=c) for a, c in [
            ("0-17", 1890), ("18-30", 19420), ("31-45", 16230), ("46-60", 7980), ("60+", 2693),
        ]],
        repeatOffenderRate=24.6,
    )
    response.set_status(200)
    response.send(Envelope.ok(result.model_dump()).model_dump_json())


def handler(request, response):
    path = request.get_path() if hasattr(request, "get_path") else "/crimes"
    if path.endswith("/filters"):
        return get_filter_options(request, response)
    if path.endswith("/trends"):
        return get_trends(request, response)
    return list_crimes(request, response)
