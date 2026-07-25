"""insights-service - Catalyst Advanced I/O function.

  GET /insights/summary          -> state-wide AI Insights (crime summary,
                                     trend summary, top findings, recommendations)
  GET /insights/district/{id}    -> same, narrowed to one district
                                     (District Intelligence Report)

Generated narratives are produced by the LLM from real aggregate data
(never free-floating claims) and then cached in the AIInsights Data
Store table by a Cron job so this stays cheap to serve; this function
also supports on-demand regeneration for a fresh view.

The prompt requires the model to return strict JSON matching
InsightsResult below, which is parsed and validated before it ever
reaches the frontend - if parsing fails, we fall back to a
template-based (non-LLM) summary rather than showing malformed output.
"""
import json
import sys
import os
from typing import Optional

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from pydantic import BaseModel, ValidationError  # noqa: E402
from common.auth_guard import require_role, ALL_ROLES  # noqa: E402
from common.schemas import Envelope  # noqa: E402
from common.logger import get_logger  # noqa: E402
from common.llm_client import generate_text, LlmError  # noqa: E402

logger = get_logger("insights-service")

INSIGHTS_SYSTEM_PROMPT = (
    "You are an intelligence analyst assistant for Karnataka State Police. "
    "Given crime analytics data as JSON, produce a concise intelligence brief. "
    "Respond with STRICT JSON only, no markdown, matching exactly this shape: "
    '{"summary": string, "trendSummary": string, "topFindings": [string, ...], '
    '"recommendations": [string, ...]}. Base every statement only on the '
    "numbers provided. Do not invent data. topFindings and recommendations "
    "should each have 3-5 short items."
)


class InsightsResult(BaseModel):
    summary: str
    trendSummary: str
    topFindings: list[str]
    recommendations: list[str]


def _load_aggregates(district_id: Optional[str]) -> dict:
    """Reads the same precomputed aggregates dashboard-service serves,
    optionally scoped to one district. Seeded with sample data pending
    the DashboardAggregates table + nightly Cron job."""
    data = {
        "scope": district_id or "state-wide",
        "totalCrimes": 48213,
        "solvedRate": 66.0,
        "crimeGrowth": 4.1,
        "topCategories": [
            {"category": "Theft", "count": 12840},
            {"category": "Cybercrime", "count": 8320},
            {"category": "Assault", "count": 6210},
        ],
        "highRiskDistricts": ["Bengaluru Urban", "Mysuru", "Ballari"],
    }
    return data


def _template_fallback(data: dict) -> InsightsResult:
    """Deterministic, non-LLM summary used if the model call or JSON
    parsing fails - keeps the endpoint always returning something
    useful rather than an error."""
    top = data["topCategories"][0]["category"] if data["topCategories"] else "the leading category"
    return InsightsResult(
        summary=f"{data['scope'].title()} recorded {data['totalCrimes']} cases with a {data['solvedRate']}% solve rate.",
        trendSummary=f"Crime volume changed by {data['crimeGrowth']}% over the period.",
        topFindings=[f"{top} is the most reported crime category."],
        recommendations=["Review district-level allocation in the highest-risk areas."],
    )


def _generate_insights(data: dict) -> InsightsResult:
    raw = generate_text(
        prompt="Generate the intelligence brief for this data.",
        context=data,
        system_prompt=INSIGHTS_SYSTEM_PROMPT,
        max_tokens=700,
    )
    try:
        parsed = json.loads(raw)
        return InsightsResult(**parsed)
    except (json.JSONDecodeError, ValidationError) as exc:
        logger.info(f"LLM returned unparseable insights JSON, using fallback: {exc}")
        return _template_fallback(data)


@require_role(ALL_ROLES)
def get_summary(request, response, user):
    data = _load_aggregates(district_id=None)
    try:
        result = _generate_insights(data)
    except LlmError as exc:
        logger.info(f"LLM unavailable, using template fallback: {exc}")
        result = _template_fallback(data)

    logger.info(f"insights summary served to user={user['user_id']}")
    response.set_status(200)
    response.send(Envelope.ok(result.model_dump()).model_dump_json())


@require_role(ALL_ROLES)
def get_district(request, response, user, district_id: str):
    data = _load_aggregates(district_id=district_id)
    try:
        result = _generate_insights(data)
    except LlmError as exc:
        logger.info(f"LLM unavailable, using template fallback: {exc}")
        result = _template_fallback(data)

    response.set_status(200)
    response.send(Envelope.ok(result.model_dump()).model_dump_json())


def handler(request, response):
    path = request.get_path() if hasattr(request, "get_path") else "/insights/summary"
    if "/district/" in path:
        district_id = path.rsplit("/district/", 1)[1]
        return get_district(request, response, district_id)
    return get_summary(request, response)
