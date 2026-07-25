import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from common.database import SessionLocal
from common.models import CrimeCase, CrimeNetwork

db = SessionLocal()
print("Reading Crime Cases in SQLite:")
try:
    cases = db.query(CrimeCase).all()
    print(f"Total Cases: {len(cases)}")
    for c in cases:
        print(f"- ID: {c.crime_id}, FIR: {c.fir_number}, Station: {c.police_station}, Accused: {c.offender_name}")

    networks = db.query(CrimeNetwork).all()
    print(f"\nTotal Network Links: {len(networks)}")
    for n in networks:
        print(f"- {n.source_name} --[{n.connection_type}]--> {n.target_name}")

except Exception as e:
    print("Error:", e)
finally:
    db.close()
