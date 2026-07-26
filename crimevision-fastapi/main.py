import sys
import os
from pathlib import Path

# Ensure crimevision-fastapi directory is in sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from common.database import engine, Base, SessionLocal
from common.models import User
from routers import (
    auth, crimes, dashboard, assistant, insights,
    geospatial, hotspots, networks, offenders,
    predictions, sociological, investigator, admin
)

app = FastAPI(title="CrimeVision API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    try:
        Base.metadata.create_all(engine)
        db = SessionLocal()
        try:
            if db.query(User).count() == 0:
                users = [
                    User(email="admin@ksp.gov.in", password_hash="admin123", name="KSP Administrator", role="administrator"),
                    User(email="supervisor@ksp.gov.in", password_hash="supervisor123", name="Dr. Ravishankar S", role="supervisor"),
                    User(email="analyst@ksp.gov.in", password_hash="analyst123", name="Kavitha Gowda", role="analyst"),
                    User(email="investigator@ksp.gov.in", password_hash="investigator123", name="Mahesh Kumar", role="investigator"),
                ]
                db.add_all(users)
                db.commit()
        finally:
            db.close()
    except Exception as exc:
        print(f"Startup database initialization error: {exc}")

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
    return {"message": "CrimeVision API is running"}

if __name__ == "__main__":
    import os
    import uvicorn
    port_str = os.environ.get("X_CATALYST_PORT") or os.environ.get("PORT") or "8080"
    port = int(port_str)
    uvicorn.run(app, host="0.0.0.0", port=port)
