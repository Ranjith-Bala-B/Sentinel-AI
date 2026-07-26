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

from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from common.database import engine, Base, SessionLocal, get_db
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
        # Automatically create missing tables if any
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            from common.models import CrimeCase
            count = db.query(CrimeCase).count()
            if count == 0:
                print("[STARTUP INFO] Initializing and seeding empty database tables...")
                from seed import seed_database
                seed_database()
            else:
                print(f"[STARTUP INFO] Database active with {count} records. No re-seeding required.")
        finally:
            db.close()
    except Exception as exc:
        print(f"[STARTUP WARN] Database auto-seed check error: {exc}")

# Include Routers for all dashboards
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
app.include_router(offenders.router, prefix="/repeat-offenders", tags=["repeat-offenders"])
app.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
app.include_router(sociological.router, prefix="/sociological", tags=["sociological"])
app.include_router(investigator.router, prefix="/investigator", tags=["investigator"])

@app.get("/api/heatmap")
def get_heatmap_api(db: Session = Depends(get_db)):
    from common.models import CrimeCase
    from common.schemas import Envelope
    cases = db.query(CrimeCase).filter(CrimeCase.location_lat.isnot(None), CrimeCase.location_lng.isnot(None)).all()
    heatmap_data = []
    for c in cases:
        sev_label = "High" if (c.severity_score or 50) >= 70 else "Medium" if (c.severity_score or 50) >= 40 else "Low"
        heatmap_data.append({
            "lat": c.location_lat,
            "lng": c.location_lng,
            "weight": max(1.0, round((c.severity_score or 50) / 20.0, 1)),
            "crime_type": c.crime_type,
            "severity": sev_label,
            "district": c.district,
            "police_station": c.police_station,
            "status": c.status,
            "date": c.date_time.strftime("%Y-%m-%d") if c.date_time else "",
            "crimeId": c.crime_id
        })
    return Envelope.ok(heatmap_data)

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
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    print(f"[UNHANDLED EXCEPTION] {request.method} {request.url.path}: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": str(exc) if str(exc) else "Internal server error",
            "detail": traceback.format_exc()
        }
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("X_CATALYST_PORT") or os.environ.get("PORT") or "8080")
    print(f"[INFO] Starting Sentinel AI FastAPI server on 0.0.0.0:{port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
