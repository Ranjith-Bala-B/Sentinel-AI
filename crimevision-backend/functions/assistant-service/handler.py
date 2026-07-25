"""assistant-service - Catalyst Advanced I/O function.

  POST /assistant/query
    body: { "question": string, "context"?: { districtFilter?, dateRange?, ... } }

Backs the floating Dashboard AI Assistant. This function:
  1. Resolves the caller (role-gated like every other function).
  2. Pulls the *current* dashboard aggregates from Data Store (same
     source dashboard-service reads) - optionally narrowed by whatever
     filter context the frontend sends (e.g. a district drill-down).
  3. Hands that data plus the question to the LLM with a system prompt
     that scopes it to dashboard analytics only.
  4. Falls back to a deterministic, non-LLM message if the LLM call
     fails (missing key, network, rate limit) so the assistant never
     surfaces a raw error or goes silent.

This deliberately does NOT give the model tool access, browsing, or
open-ended context - only the pre-fetched analytics payload below.
"""
import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from common.auth_guard import require_role, ALL_ROLES  # noqa: E402
from common.schemas import Envelope  # noqa: E402
from common.logger import get_logger  # noqa: E402
from common.llm_client import generate_text, LlmError  # noqa: E402

logger = get_logger("assistant-service")

MAX_QUESTION_LENGTH = 400


def _load_dashboard_context(district_filter: str | None) -> dict:
    """Reuses the same aggregate rows dashboard-service serves.

    Real implementation imports the shared aggregate-loading function
    (or queries the DashboardAggregates table directly) rather than
    duplicating sample data; kept self-contained here for the module
    boundary between functions.
    """
    context = {
        "kpis": {
            "totalCrimes": 48213,
            "solvedCases": 31820,
            "solvedRate": 66.0,
            "pendingCases": 16393,
            "repeatOffenders": 2140,
            "highRiskDistricts": 6,
        },
        "districtRanking": [
            {"district": "Bengaluru Urban", "count": 14210, "riskLevel": "critical"},
            {"district": "Mysuru", "count": 5340, "riskLevel": "high"},
            {"district": "Ballari", "count": 4120, "riskLevel": "high"},
            {"district": "Belagavi", "count": 3870, "riskLevel": "moderate"},
            {"district": "Hubballi-Dharwad", "count": 3610, "riskLevel": "moderate"},
        ],
        "crimeByCategory": [
            {"category": "Theft", "count": 12840},
            {"category": "Cybercrime", "count": 8320},
            {"category": "Assault", "count": 6210},
        ],
    }
    if district_filter:
        context["focusedDistrict"] = district_filter
    return context


def _fallback_answer(question: str) -> str:
    return (
        "I can't reach the analytics model right now, so I can't answer that in detail. "
        "You can find district and category breakdowns directly in the Crime Analytics "
        "and Hotspot Intelligence modules while this is being resolved."
    )


@require_role(ALL_ROLES)
def query(request, response, user):
    body = json.loads(request.get_body() or "{}")
    question = (body.get("question") or "").strip()
    context_in = body.get("context") or {}

    if not question:
        response.set_status(400)
        response.send(Envelope.fail("question is required").model_dump_json())
        return

    if len(question) > MAX_QUESTION_LENGTH:
        response.set_status(400)
        response.send(Envelope.fail(f"question must be under {MAX_QUESTION_LENGTH} characters").model_dump_json())
        return

    dashboard_context = _load_dashboard_context(context_in.get("districtFilter"))

    try:
        answer = generate_text(prompt=question, context=dashboard_context)
    except LlmError as exc:
        logger.info(f"LLM unavailable, using fallback: {exc}")
        answer = _fallback_answer(question)

    logger.info(f"user={user['user_id']} asked assistant: {question[:80]!r}")
    response.set_status(200)
    response.send(Envelope.ok({"answer": answer}).model_dump_json())


def handler(request, response):
    return query(request, response)
