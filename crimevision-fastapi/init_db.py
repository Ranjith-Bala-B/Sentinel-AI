import os
import sys
from sqlalchemy.orm import sessionmaker

# Add current folder to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from common.database import engine, Base, SessionLocal
from common.models import User, CrimeCase, CrimeNetwork, Hotspot, SimilarCase, IncidentAlert

print("=========================================")
print("Initializing SQLite Database (Empty state)")
print("=========================================")

# Re-create tables
Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)
print("Database schema created.")

db = SessionLocal()

# Seed default users
users = [
    User(email="admin@ksp.gov.in", password_hash="admin123", name="KSP Administrator", role="administrator"),
    User(email="supervisor@ksp.gov.in", password_hash="supervisor123", name="Dr. Ravishankar S", role="supervisor"),
    User(email="analyst@ksp.gov.in", password_hash="analyst123", name="Kavitha Gowda", role="analyst"),
    User(email="investigator@ksp.gov.in", password_hash="investigator123", name="Mahesh Kumar", role="investigator"),
]
db.add_all(users)
db.commit()
db.close()

print("Cleared all crime cases, network nodes, and timelines.")
print("Seeded default KSP accounts successfully.")
