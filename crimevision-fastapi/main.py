import sys
import os
import platform
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
deps_dir = BASE_DIR / "dependencies"

# Add bundled Linux x86_64 dependencies if on Linux / Catalyst container environment
if platform.system().lower() != "windows":
    if os.path.exists(deps_dir) and str(deps_dir) not in sys.path:
        sys.path.insert(0, str(deps_dir))

for p in [
    "/catalyst/dependencies",
    "/app/dependencies",
    os.path.expanduser("~/.local/lib/python3.11/site-packages"),
    os.path.expanduser("~/.local/lib/python3/site-packages"),
    "/var/lang/lib/python3.11/site-packages",
    "/var/lang/lib/python3/site-packages"
]:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from common.database import engine, Base, SessionLocal
from common.models import User
from routers import (
    auth, crimes, dashboard, assistant, insights,
    geospatial, hotspots, networks, offenders,
    predictions, sociological, investigator, admin
)

app = FastAPI(title="Sentinel AI - CrimeVision API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sentinel-ai-uoziitvq.onslate.in",
        "https://sentinel-ai-lzbugrhn.onslate.in",
        "https://sentinel-ai-60073690708.development.catalystserverless.in",
        "https://sentinel-ai-frontend-50044342253.development.catalystappsail.in",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:9000"
    ],
    allow_origin_regex=r"https://.*\.(onslate\.in|catalystserverless\.in|catalystappsail\.in)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    try:
        from seed import seed_database
        db = SessionLocal()
        try:
            from common.models import CrimeCase
            if db.query(CrimeCase).count() == 0:
                print("[STARTUP INFO] Initializing and seeding database tables...")
                seed_database()
        finally:
            db.close()
    except Exception as exc:
        print(f"[STARTUP WARN] Database auto-seed error: {exc}")

# Include Routers for all 10 dashboards
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(crimes.router, prefix="/crimes", tags=["crimes"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(assistant.router, prefix="/assistant", tags=["assistant"])
app.include_router(insights.router, prefix="/insights", tags=["insights"])
app.include_router(geospatial.router, prefix="/geospatial", tags=["geospatial"])
app.include_router(hotspots.router, prefix="/hotspots", tags=["hotspots"])
app.include_router(networks.router, prefix="/networks", tags=["networks"])
app.include_router(offenders.router, prefix="/offenders", tags=["offenders"])
app.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
app.include_router(sociological.router, prefix="/sociological", tags=["sociological"])
app.include_router(investigator.router, prefix="/investigator", tags=["investigator"])

@app.get("/")
def root():
    return {
        "status": "success",
        "message": "Sentinel AI Backend Running"
    }

@app.get("/health")
@app.get("/healthz")
def health():
    return {"status": "ok"}

@app.get("/version")
def version():
    return {
        "status": "success",
        "version": "1.0.0",
        "app": "Sentinel AI - CrimeVision API",
        "environment": "production"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    print(f"[UNHANDLED EXCEPTION] {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error",
            "detail": str(exc) if os.environ.get("DEBUG") == "true" else "An unexpected error occurred"
        }
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("X_CATALYST_PORT") or os.environ.get("PORT") or "8080")
    print(f"[INFO] Starting Sentinel AI FastAPI server on 0.0.0.0:{port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
