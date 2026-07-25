import sys
from pathlib import Path

# Add project root to sys.path so 'common' module is importable
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from common.auth_guard import require_role, ALL_ROLES
from common.schemas import Envelope
from common.llm_client import generate_text, LlmError
from common.logger import get_logger

logger = get_logger("insights-service")

@require_role(ALL_ROLES)
def handler(request, response, user):
    """GET /insights/summary & GET /insights/district/{id}."""
    path = request.get_path_info() if hasattr(request, "get_path_info") else "/"

    context = {
        "district": "Bengaluru City",
        "total_cases": 480,
        "solved_rate": 74.5,
        "top_crime": "Cybercrime"
    }

    try:
        ai_summary = generate_text("Summarize key crime insights and strategic recommendations.", context)
    except LlmError:
        ai_summary = (
            "Cybercrime remains the primary incident driver in urban centers. "
            "Enhanced night patrols and cyber-forensic response units are recommended for high-risk zones."
        )

    result = {
        "summary": ai_summary,
        "keyFindings": [
            "High concentration of cyber fraud reported during evening hours.",
            "Repeat offender rates decreased by 3.5% across urban precincts."
        ],
        "recommendations": [
            "Increase digital awareness campaigns in Bengaluru City.",
            "Deploy specialized cyber response task force to Koramangala PS."
        ]
    }

    response.set_status(200)
    response.send(Envelope.ok(result).model_dump_json())
