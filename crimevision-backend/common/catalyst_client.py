"""Thin helpers around the Zoho Catalyst Python SDK for Data Store (ZCQL)
and Stratus file storage.

Kept as a narrow seam (like common/auth_guard.py) so functions never
import `zcatalyst_sdk` directly - this is the only file that would
need to change if the SDK's API surface shifts.
"""
from typing import Any


def get_catalyst_app(request):
    """Initializes the Catalyst app context for this request.

    Real implementation:
        import zcatalyst_sdk
        return zcatalyst_sdk.initialize(req=request)
    """
    import zcatalyst_sdk  # noqa: F401  (imported lazily; not installed in this sandbox)

    return zcatalyst_sdk.initialize(req=request)


def zcql_query(request, query: str) -> list[dict[str, Any]]:
    """Runs a ZCQL query against Catalyst Data Store and returns rows."""
    app = get_catalyst_app(request)
    zcql = app.zcql()
    result = zcql.execute_query(query)
    return [row[list(row.keys())[0]] for row in result]


def stratus_upload(request, bucket: str, key: str, data: bytes) -> str:
    """Uploads bytes to a Stratus bucket and returns the object key."""
    app = get_catalyst_app(request)
    stratus = app.stratus()
    stratus.bucket(bucket).put_object(key, data)
    return key
