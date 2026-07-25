import sys
from pathlib import Path

# Add project root to sys.path so 'common' module is importable
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from common.auth_guard import require_role, ALL_ROLES
from common.schemas import Envelope, DashboardSummary
from common.logger import get_logger

logger = get_logger("dashboard-service")

@require_role(ALL_ROLES)
def handler(request, response, user):
    """GET /dashboard/summary & GET /dashboard/feed."""
    path = request.get_path_info() if hasattr(request, "get_path_info") else "/"

    if path.endswith("/feed"):
        feed_items = [
            {"id": "F1", "title": "Spike in online phishing reports", "district": "Bengaluru City", "severity": "HIGH", "timestamp": "10 mins ago"},
            {"id": "F2", "title": "Repeat offender detected in precinct", "district": "Mysuru City", "severity": "MEDIUM", "timestamp": "25 mins ago"}
        ]
        response.set_status(200)
        response.send(Envelope.ok(feed_items).model_dump_json())
        return

    # Default /dashboard/summary
    data = DashboardSummary(
        kpis={
            "totalCrimes": 1580,
            "totalCrimesDelta": -4.2,
            "solvedCases": 1140,
            "solvedRate": 72.15,
            "pendingCases": 440,
            "repeatOffenders": 184,
            "highRiskDistricts": 4,
            "crimeGrowth": 1.8,
            "activeAlerts": 12
        },
        crimeByCategory=[
            {"category": "Cybercrime", "count": 520},
            {"category": "Property Crime", "count": 410},
            {"category": "Violent Crime", "count": 280},
            {"category": "Narcotics", "count": 210},
            {"category": "Financial Fraud", "count": 160}
        ],
        districtRanking=[
            {"district": "Bengaluru City", "count": 480, "riskLevel": "HIGH"},
            {"district": "Mysuru City", "count": 310, "riskLevel": "MEDIUM"},
            {"district": "Hubballi-Dharwad", "count": 240, "riskLevel": "MEDIUM"},
            {"district": "Mangaluru City", "count": 190, "riskLevel": "LOW"}
        ],
        topStations=[
            {"station": "Koramangala PS", "district": "Bengaluru City", "solvedRate": 84.5, "caseload": 120},
            {"station": "Devaraja PS", "district": "Mysuru City", "solvedRate": 79.2, "caseload": 95}
        ],
        monthlyTrend=[
            {"label": "Jan", "crimes": 130, "solved": 95},
            {"label": "Feb", "crimes": 145, "solved": 102},
            {"label": "Mar", "crimes": 125, "solved": 98}
        ],
        feed=[
            {"id": "F1", "title": "Spike in online phishing reports", "district": "Bengaluru City", "severity": "HIGH", "timestamp": "10 mins ago"}
        ]
    )
    response.set_status(200)
    response.send(Envelope.ok(data.model_dump()).model_dump_json())
