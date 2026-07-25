import os
import sys

# Add root folder to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from common.database import SessionLocal
from common.models import CrimeCase, CrimeNetwork
from sqlalchemy import func
from datetime import datetime

db = SessionLocal()
print("Connected to DB.")
try:
    # 1. Check current counts
    year = 2026
    count_this_year = db.query(CrimeCase).filter(func.year(CrimeCase.date_time) == year).count()
    crime_id = f"CR-{year}-{count_this_year + 1:05d}"
    print(f"Generated Crime ID: {crime_id}")

    # 2. Construct mock case
    case = CrimeCase(
        crime_id=crime_id,
        fir_number="248/2026",
        crime_type="Theft",
        status="open",
        date_time=datetime.now(),
        district="Bengaluru Urban",
        police_station="Hebbal PS",
        severity_score=50,
        description="Test case insertion",
        victim_age=25,
        victim_gender="Male",
        victim_employment="Employed",
        victim_education="Under Graduate",
        urbanization="Urban",
        population_density=400,
        offender_name="Ramesh B",
        offender_age=34,
        offender_is_repeat=True,
        modus_operandi="Test MO",
        weapons_used="None",
        target_place="Residences",
        escape_method="Foot",
        location_lat=12.97,
        location_lng=77.59
    )

    db.add(case)
    db.commit()
    print("CrimeCase committed successfully!")

    # 3. Add dynamic networks
    db.add(CrimeNetwork(
        source_name="Ramesh B",
        source_type="accused",
        target_name=crime_id,
        target_type="crime",
        connection_type="perpetrated",
        strength=2
    ))
    db.add(CrimeNetwork(
        source_name=crime_id,
        source_type="crime",
        target_name="Hebbal PS (Bengaluru Urban)",
        target_type="location",
        connection_type="occurred_at",
        strength=1
    ))
    db.commit()
    print("CrimeNetwork committed successfully!")

    # Verify query
    q_case = db.query(CrimeCase).filter(CrimeCase.crime_id == crime_id).first()
    print("Retrieved Case:", q_case.crime_id, "Accused:", q_case.offender_name)

    # Cleanup
    db.delete(q_case)
    networks = db.query(CrimeNetwork).filter(
        (CrimeNetwork.source_name == "Ramesh B") | (CrimeNetwork.source_name == crime_id)
    ).all()
    for n in networks:
        db.delete(n)
    db.commit()
    print("Cleanup successful.")

except Exception as e:
    import traceback
    print("Insertion failed:")
    traceback.print_exc()
finally:
    db.close()
