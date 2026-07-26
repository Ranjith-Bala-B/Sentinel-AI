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
from common.database import engine, Base, SessionLocal, get_db, verify_db_connection, check_database_health, verify_crud_operations
from common.logger import get_logger
from routers import (
    auth, crimes, dashboard, assistant, insights,
    geospatial, hotspots, networks, offenders,
    predictions, sociological, investigator, admin
)

logger = get_logger("main-service")
app = FastAPI(title="Sentinel AI - CrimeVision API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sentinel-ai-uoziitvq.onslate.in",
        "https://sentinel-ai-lzbugrhn.onslate.in",
        "https://sentinel-ai-60073690708.development.catalystserverless.in",
        "https://sentinel-ai-frontend-50044342253.development.catalystappsail.in",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:9000",
        "http://localhost:8000"
    ],
    allow_origin_regex=r"https://.*\.(onslate\.in|catalystserverless\.in|catalystappsail\.in)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    try:
        logger.info("Initializing Sentinel AI Backend startup sequence...")
        db_connected = verify_db_connection(max_retries=3, retry_delay=1.0)
        
        if db_connected:
            Base.metadata.create_all(bind=engine)
            db = SessionLocal()
            try:
                from common.models import CrimeCase
                import datetime
                
                is_healthy, db_name, _ = check_database_health()
                
                # Fetch Table Count using raw SQL depending on dialect
                table_count = "Unknown"
                try:
                    if "sqlite" in str(engine.url):
                        table_count = db.execute("SELECT count(*) FROM sqlite_master WHERE type='table'").scalar()
                    else:
                        table_count = db.execute(f"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '{db_name}'").scalar()
                except Exception as e:
                    pass
                
                total_cases = db.query(CrimeCase).count()
                
                # ASCII Art Logging
                print("\n==============================")
                print("Sentinel-AI Startup")
                print("==============================")
                print("✓ MySQL Connected" if "mysql" in str(engine.url).lower() else "✓ Database Connected")
                print(f"Database: {db_name}")
                print(f"Tables Found: {table_count}")
                print(f"Total Cases: {total_cases}")
                print("==============================\n")
                
                logger.info(f"Database active with {total_cases} records.")
                
                if total_cases == 0:
                    logger.info("Initializing and seeding database tables...")
                    from seed import seed_database
                    seed_database()
                    
                # Verify CRUD
                verify_crud_operations(db)
                
            finally:
                db.close()
        else:
            is_healthy, db_name, exc = check_database_health()
            print("\n✗ MySQL Connection Failed" if "mysql" in str(engine.url).lower() else "\n✗ Database Connection Failed")
            print(f"Reason: {exc}")
            logger.warning("Database connection unavailable at startup. Server starting in standalone mode.")
    except Exception as exc:
        logger.error(f"Startup warning (non-fatal): {exc}", exc_info=True)

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

@app.get("/api/dashboard")
def api_dashboard(db: Session = Depends(get_db)):
    from routers.dashboard import _load_summary_from_db
    from common.schemas import Envelope
    return Envelope.ok(_load_summary_from_db(db))

@app.get("/api/crimes")
def api_crimes(db: Session = Depends(get_db)):
    from common.models import CrimeCase
    from common.schemas import Envelope
    cases = db.query(CrimeCase).order_by(CrimeCase.date_time.desc()).limit(100).all()
    # Convert SQLAlchemy objects to dicts for Pydantic serialization
    cases_list = []
    for c in cases:
        cases_list.append({
            "crime_id": c.crime_id,
            "fir_number": c.fir_number,
            "crime_type": c.crime_type,
            "status": c.status,
            "district": c.district,
            "police_station": c.police_station,
            "severity_score": c.severity_score
        })
    return Envelope.ok(cases_list)

@app.get("/api/analytics")
def api_analytics():
    from common.schemas import Envelope
    return Envelope.ok({"status": "active", "message": "Analytics engine running"})

@app.get("/")
def root():
    return {
        "status": "success",
        "message": "Sentinel AI Backend Running"
    }

@app.get("/health")
@app.get("/healthz")
def health(db: Session = Depends(get_db)):
    from fastapi import HTTPException
    import datetime
    
    is_healthy, db_name, exc = check_database_health()
    
    if is_healthy:
        from common.models import CrimeCase
        try:
            total_cases = db.query(CrimeCase).count()
        except Exception:
            total_cases = 0
            
        return {
            "status": "healthy",
            "database": "connected",
            "database_name": db_name,
            "server": "MySQL" if "mysql" in str(engine.url).lower() else "SQLite",
            "message": "Database connection successful",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "total_cases": total_cases
        }
    else:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "message": "Unable to connect to MySQL",
                "error": str(exc)
            }
        )

@app.get("/database/info")
def database_info():
    is_healthy, db_name, exc = check_database_health()
    if not is_healthy:
        return {"status": "unhealthy", "error": str(exc)}
    
    table_names = list(Base.metadata.tables.keys())
    return {
        "database": db_name,
        "server": "MySQL" if "mysql" in str(engine.url).lower() else "SQLite",
        "tables": table_names
    }

@app.get("/database/ping")
def database_ping(db: Session = Depends(get_db)):
    try:
        from sqlalchemy import text
        if "sqlite" in str(engine.url):
            result = db.execute(text("SELECT datetime('now')")).scalar()
        else:
            result = db.execute(text("SELECT NOW()")).scalar()
            
        return {
            "status": "connected",
            "mysql_time": str(result)
        }
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}

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
    logger.error(f"[UNHANDLED EXCEPTION] {request.method} {request.url.path}: {exc}", exc_info=True)
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
    port = int(os.environ.get("X_CATALYST_PORT") or os.environ.get("PORT") or "9000")
    logger.info(f"Starting Sentinel AI FastAPI server on 0.0.0.0:{port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
