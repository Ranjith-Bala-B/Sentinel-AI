import sys
import json
from pathlib import Path

# Add project root to sys.path so 'common' module is importable
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from common.auth_guard import require_role, ALL_ROLES
from common.schemas import Envelope
from common.llm_client import generate_text, LlmError
from common.logger import get_logger

logger = get_logger("assistant-service")

@require_role(ALL_ROLES)
def handler(request, response, user):
    """POST /assistant/query - Grounded AI assistant for dashboard context."""
    method = request.get_request_method() if hasattr(request, "get_request_method") else "POST"
    
    if method != "POST":
        response.set_status(455)
        response.send(Envelope.fail("Method not allowed", "METHOD_NOT_ALLOWED").model_dump_json())
        return

    try:
        body_raw = request.get_request_body() if hasattr(request, "get_request_body") else "{}"
        body = json.loads(body_raw) if body_raw else {}
    except Exception:
        body = {}

    prompt = body.get("prompt", "")
    context = body.get("context", {})

    if not prompt:
        response.set_status(400)
        response.send(Envelope.fail("Prompt is required", "BAD_REQUEST").model_dump_json())
        return

    try:
        reply = generate_text(prompt, context)
    except LlmError as exc:
        logger.warning(f"LLM fallback engaged: {exc}")
        reply = (
            "Based on current dashboard analytics, active cases are currently tracked across high-risk districts. "
            "For specific module deep-dives, please navigate to Crime Hotspots or Network Analysis."
        )

    response.set_status(200)
    response.send(Envelope.ok({"reply": reply}).model_dump_json())
