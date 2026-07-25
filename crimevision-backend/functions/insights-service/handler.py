import sys
import json
from pathlib import Path

# Add project root to sys.path so 'common' module is importable
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from common.schemas import Envelope
from common.llm_client import generate_text, LlmError
from common.logger import get_logger

logger = get_logger("insights-service")

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

    return {
        "status_code": 200,
        "headers": headers,
        "body": json.dumps({"status": "success", "data": result})
    }
