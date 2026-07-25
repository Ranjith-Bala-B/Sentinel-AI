import sys
import json
from pathlib import Path

# Add project root to sys.path so 'common' module is importable
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from common.auth_guard import require_role, ALL_ROLES
from common.schemas import Envelope
from common.analytics_schemas import CrimeAnalyticsResponse
from common.logger import get_logger

logger = get_logger("crime-service")

@require_role(ALL_ROLES)
def handler(request, response, user):
    """Handles GET /crimes/filters, GET /crimes/trends, POST /crimes/register."""
    path = request.get_path_info() if hasattr(request, "get_path_info") else "/"
    method = request.get_request_method() if hasattr(request, "get_request_method") else "GET"

    if path.endswith("/filters") and method == "GET":
        filters = {
            "districts": ["Bengaluru City", "Mysuru City", "Hubballi-Dharwad", "Mangaluru City", "Belagavi"],
            "crimeTypes": ["Cybercrime", "Property Crime", "Violent Crime", "Financial Fraud", "Narcotics"],
            "statuses": ["UNDER_INVESTIGATION", "CHARGE_SHEETED", "CLOSED", "PENDING_TRIAL"]
        }
        response.set_status(200)
        response.send(Envelope.ok(filters).model_dump_json())
        return

    if path.endswith("/trends") and method == "GET":
        data = CrimeAnalyticsResponse(
            monthlyTrend=[{"label": "Jan", "count": 120}, {"label": "Feb", "count": 140}, {"label": "Mar", "count": 110}],
            yearlyTrend=[{"year": "2024", "count": 1420}, {"year": "2025", "count": 1580}],
            categoryBreakdown=[{"category": "Cybercrime", "count": 450}, {"category": "Property Crime", "count": 320}],
            timeOfDay=[{"hour": "00:00", "count": 45}, {"hour": "06:00", "count": 20}, {"hour": "12:00", "count": 85}, {"hour": "18:00", "count": 110}],
            seasonal=[{"season": "Q1", "count": 380}, {"season": "Q2", "count": 410}, {"season": "Q3", "count": 390}, {"season": "Q4", "count": 400}],
            weekday=[{"day": "Mon", "count": 210}, {"day": "Tue", "count": 195}, {"day": "Wed", "count": 205}, {"day": "Thu", "count": 220}, {"day": "Fri", "count": 250}, {"day": "Sat", "count": 280}, {"day": "Sun", "count": 220}],
            victimByAge=[{"ageGroup": "18-30", "count": 520}, {"ageGroup": "31-50", "count": 640}, {"ageGroup": "51+", "count": 420}],
            victimByGender=[{"gender": "Male", "count": 820}, {"gender": "Female", "count": 760}],
            offenderByAge=[{"ageGroup": "18-25", "count": 340}, {"ageGroup": "26-40", "count": 580}, {"ageGroup": "41+", "count": 210}],
            repeatOffenderRate=18.4
        )
        response.set_status(200)
        response.send(Envelope.ok(data.model_dump()).model_dump_json())
        return

    if path.endswith("/register") and method == "POST":
        try:
            body_raw = request.get_request_body() if hasattr(request, "get_request_body") else "{}"
            body = json.loads(body_raw) if body_raw else {}
        except Exception:
            body = {}
        crime_id = f"FIR-2026-{user['user_id'][:4]}-998"
        response.set_status(201)
        response.send(Envelope.ok({"crimeId": crime_id, "status": "REGISTERED"}).model_dump_json())
        return

    response.set_status(404)
    response.send(Envelope.fail("Endpoint not found", "NOT_FOUND").model_dump_json())
