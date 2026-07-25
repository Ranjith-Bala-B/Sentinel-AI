"""auth-service — Catalyst Advanced I/O function.

Responsibilities:
  GET  /auth/me                -> resolves the bearer token to the app-level
                                   user profile (role, district scope) stored
                                   in the Users Data Store table.
  POST /auth/assign-role       -> administrator-only: updates a user's role.

Actual sign-in/sign-out/password-reset are handled client-side by the
Catalyst Authentication Web SDK (see catalyst/client.ts on the frontend) -
this function only manages the *application* profile layered on top of
the Catalyst-managed identity.
"""
import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from common.auth_guard import require_role, ALL_ROLES  # noqa: E402
from common.schemas import Envelope  # noqa: E402
from common.logger import get_logger  # noqa: E402

logger = get_logger("auth-service")


@require_role(ALL_ROLES)
def get_me(request, response, user):
    profile = {
        "userId": user["user_id"],
        "role": user["role"],
        "districtScope": "ALL",
    }
    response.set_status(200)
    response.send(Envelope.ok(profile).model_dump_json())


@require_role(["administrator"])
def assign_role(request, response, user):
    body = json.loads(request.get_body() or "{}")
    target_user_id = body.get("userId")
    new_role = body.get("role")
    if not target_user_id or new_role not in {"investigator", "analyst", "supervisor", "administrator"}:
        response.set_status(400)
        response.send(Envelope.fail("userId and a valid role are required").model_dump_json())
        return
    # TODO: persist via ZCQL UPDATE Users SET role = :role WHERE user_id = :target_user_id
    logger.info(f"admin={user['user_id']} set role={new_role} for user={target_user_id}")
    response.set_status(200)
    response.send(Envelope.ok({"userId": target_user_id, "role": new_role}).model_dump_json())


def handler(request, response):
    """Catalyst Advanced I/O entry point - routes on method + path."""
    path = request.get_path() if hasattr(request, "get_path") else "/auth/me"
    method = request.get_method() if hasattr(request, "get_method") else "GET"

    if path.endswith("/assign-role") and method == "POST":
        return assign_role(request, response)
    return get_me(request, response)
