import sys
import json
from pathlib import Path

# Add project root to sys.path so 'common' module is importable
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from common.auth_guard import require_role, ALL_ROLES
from common.schemas import Envelope
from common.logger import get_logger

logger = get_logger("auth-service")

def handler(request, response):
    """Handles GET /auth/me, POST /auth/login, POST /auth/assign-role."""
    path = request.get_path_info() if hasattr(request, "get_path_info") else "/"
    method = request.get_request_method() if hasattr(request, "get_request_method") else "GET"

    try:
        body_raw = request.get_request_body() if hasattr(request, "get_request_body") else "{}"
        body = json.loads(body_raw) if body_raw else {}
    except Exception:
        body = {}

    if path.endswith("/login") and method == "POST":
        email = body.get("email")
        password = body.get("password")

        if not email or not password:
            response.set_status(400)
            response.send(Envelope.fail("Email and password are required", "BAD_REQUEST").model_dump_json())
            return

        role = "administrator" if "admin" in email else "supervisor" if "supervisor" in email else "analyst" if "analyst" in email else "investigator"
        user_id = f"user-{email.split('@')[0]}"

        response.set_status(200)
        response.send(Envelope.ok({
            "token": f"Bearer {user_id}",
            "user": {
                "userId": user_id,
                "email": email,
                "name": email.split("@")[0].replace(".", " ").title(),
                "role": role
            }
        }).model_dump_json())
        return

    if path.endswith("/me") and method == "GET":
        @require_role(ALL_ROLES)
        def _get_me(req, resp, user):
            resp.set_status(200)
            resp.send(Envelope.ok({
                "userId": user["user_id"],
                "email": f"{user['user_id']}@ksp.gov.in",
                "name": user["user_id"].capitalize(),
                "role": user["role"],
                "districtScope": "ALL"
            }).model_dump_json())
        _get_me(request, response)
        return

    if path.endswith("/assign-role") and method == "POST":
        @require_role({"administrator"})
        def _assign(req, resp, user):
            target_id = body.get("userId")
            new_role = body.get("role")
            if not target_id or new_role not in ALL_ROLES:
                resp.set_status(400)
                resp.send(Envelope.fail("Invalid userId or role", "BAD_REQUEST").model_dump_json())
                return
            resp.set_status(200)
            resp.send(Envelope.ok({"userId": target_id, "role": new_role}).model_dump_json())
        _assign(request, response)
        return

    response.set_status(404)
    response.send(Envelope.fail("Endpoint not found", "NOT_FOUND").model_dump_json())
