import json
import sys
from pathlib import Path

# Add project root to sys.path so 'common' modules are importable
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

def handler(request, *args):
    """
    Zoho Catalyst Advanced I/O Function Entry Point.
    Accepts single 'request' argument passed by Catalyst Python runtime.
    Supports optional second positional parameter (*args) for runtime compatibility.
    """
    # 1. Handle CORS Preflight OPTIONS Request
    method = "GET"
    if hasattr(request, "get_request_method"):
        method = request.get_request_method()
    elif isinstance(request, dict) and "method" in request:
        method = request["method"]

    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }

    if method == "OPTIONS":
        return {
            "status_code": 200,
            "headers": headers,
            "body": ""
        }

    # 2. Build Full Dashboard Analytics Payload matching both TypeScript domain schema & snake_case schema
    response_payload = {
        "status": "success",
        "data": {
            # Full TypeScript domain model fields for DashboardSummaryResponse
            "kpis": {
                "totalCrimes": 1580,
                "crimesThisMonth": 145,
                "crimeRateChange": -4.2,
                "activeInvestigations": 440,
                "repeatOffenders": 184,
                "highRiskDistricts": 4,
                "activeAlerts": 12
            },
            "crimeByCategory": [
                {"category": "Cybercrime", "count": 520},
                {"category": "Property Crime", "count": 410},
                {"category": "Violent Crime", "count": 280},
                {"category": "Narcotics", "count": 210},
                {"category": "Financial Fraud", "count": 160}
            ],
            "districtRanking": [
                {"district": "Bengaluru City", "count": 480, "riskLevel": "high"},
                {"district": "Mysuru City", "count": 310, "riskLevel": "moderate"},
                {"district": "Hubballi-Dharwad", "count": 240, "riskLevel": "moderate"},
                {"district": "Mangaluru City", "riskLevel": "low"}
            ],
            "topStations": [
                {"station": "Koramangala PS", "district": "Bengaluru City", "solvedRate": 84.5, "caseload": 120},
                {"station": "Devaraja PS", "district": "Mysuru City", "solvedRate": 79.2, "caseload": 95}
            ],
            "monthlyTrend": [
                {"label": "Jan", "crimes": 130, "solved": 95},
                {"label": "Feb", "crimes": 145, "solved": 102},
                {"label": "Mar", "crimes": 125, "solved": 98}
            ],
            "feed": [
                {"id": "F1", "title": "Spike in online phishing reports", "district": "Bengaluru City", "severity": "high", "timestamp": "10 mins ago"}
            ],
            "statusBreakdown": [
                {"status": "Under Investigation", "count": 440, "percentage": 27.8},
                {"status": "Charge Sheeted", "count": 820, "percentage": 51.9},
                {"status": "Closed", "count": 320, "percentage": 20.3}
            ],
            # Aliased snake_case fields
            "total_crimes": 1580,
            "crime_categories": [
                {"category": "Cybercrime", "count": 520},
                {"category": "Property Crime", "count": 410},
                {"category": "Violent Crime", "count": 280},
                {"category": "Narcotics", "count": 210},
                {"category": "Financial Fraud", "count": 160}
            ],
            "crime_trends": [
                {"label": "Jan", "count": 130},
                {"label": "Feb", "count": 145},
                {"label": "Mar", "count": 125}
            ],
            "hotspots": [
                {"district": "Bengaluru City", "riskLevel": "HIGH", "count": 480},
                {"district": "Mysuru City", "riskLevel": "MEDIUM", "count": 310},
                {"district": "Hubballi-Dharwad", "riskLevel": "MEDIUM", "count": 240},
                {"district": "Mangaluru City", "riskLevel": "LOW", "count": 190}
            ]
        }
    }

    body_json = json.dumps(response_payload)

    # 3. Handle dual response mechanisms:
    if args and hasattr(args[0], "send"):
        res = args[0]
        if hasattr(res, "set_status"):
            res.set_status(200)
        if hasattr(res, "set_header"):
            for k, v in headers.items():
                res.set_header(k, v)
        res.send(body_json)
        return

    if hasattr(request, "get_response"):
        res = request.get_response()
        if hasattr(res, "set_status"):
            res.set_status(200)
        if hasattr(res, "set_header"):
            for k, v in headers.items():
                res.set_header(k, v)
        if hasattr(res, "send"):
            res.send(body_json)
            return

    # Return direct JSON dictionary for Catalyst response format
    return {
        "status": "success",
        "data": response_payload["data"]
    }
