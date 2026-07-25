"""Role-based access decorator applied to every Advanced I/O function.

Reads the Catalyst Auth bearer token attached by the frontend's
api-client, resolves it to a user + role via the Catalyst Auth SDK
(zcatalyst-sdk-node's Python peer / management API), and rejects the
request with a 403 envelope if the caller's role is not permitted.
"""
from functools import wraps
from typing import Callable, Iterable, Optional

from common.schemas import Envelope
from common.logger import get_logger

logger = get_logger("auth_guard")

ALL_ROLES = {"investigator", "analyst", "supervisor", "administrator"}


def resolve_user(request) -> Optional[dict]:
    """Resolves the bearer token to a Catalyst user profile.

    In production this calls the Catalyst Authentication management API
    with the token forwarded from the API Gateway. Left as a narrow
    seam so it can be swapped for the real SDK call without touching
    any function handler.
    """
    auth_header = request.get_header("Authorization") if hasattr(request, "get_header") else None
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    # TODO: replace with catalyst_app.userManagement().getUserDetails(token)
    return {"user_id": token, "role": "investigator"}


def require_role(allowed: Iterable[str] = ALL_ROLES) -> Callable:
    allowed_set = set(allowed)

    def decorator(handler: Callable) -> Callable:
        @wraps(handler)
        def wrapped(request, response, *args, **kwargs):
            user = resolve_user(request)
            if user is None:
                logger.info("Rejected unauthenticated request")
                response.set_status(401)
                response.send(Envelope.fail("Authentication required", "UNAUTHENTICATED").model_dump_json())
                return None
            if user["role"] not in allowed_set:
                logger.info(f"Rejected role={user['role']} - requires one of {allowed_set}")
                response.set_status(403)
                response.send(Envelope.fail("Insufficient role for this resource", "FORBIDDEN").model_dump_json())
                return None
            return handler(request, response, user, *args, **kwargs)

        return wrapped

    return decorator
