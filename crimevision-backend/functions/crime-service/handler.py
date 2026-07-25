import sys
import json
from pathlib import Path

# Add project root to sys.path so 'common' module is importable
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from common.schemas import Envelope
from common.analytics_schemas import CrimeAnalyticsResponse
from common.logger import get_logger

logger = get_logger("crime-service")

def handler(request, *args):
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://sentinel-ai-lzbugrhn.onslate.in",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
    }

    method = "GET"
    if hasattr(request, "get_request_method"):
        method = request.get_request_method()
    elif isinstance(request, dict) and "method" in request:
        method = request["method"]

    if method == "OPTIONS":
        return {
            "status_code": 204,
            "headers": headers,
            "body": ""
        }

    path = request.get_path_info() if hasattr(request, "get_path_info") else "/"

    if path.endswith("/filters") or "filter" in path:
        filters = {
            "districts": ["Bengaluru City", "Mysuru City", "Hubballi-Dharwad", "Mangaluru City", "Belagavi"],
            "crimeTypes": ["Cybercrime", "Property Crime", "Violent Crime", "Financial Fraud", "Narcotics"],
            "statuses": ["UNDER_INVESTIGATION", "CHARGE_SHEETED", "CLOSED", "PENDING_TRIAL"]
        }
        return {
            "status_code": 200,
            "headers": headers,
            "body": json.dumps({"status": "success", "data": filters})
        }

    # Default /crimes/trends or /crimes/analytics
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

    return {
        "status_code": 200,
        "headers": headers,
        "body": json.dumps({"status": "success", "data": data.model_dump()})
    }
