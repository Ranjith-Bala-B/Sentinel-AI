import os
import sys
from datetime import datetime, timedelta
import random
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from common.database import engine, Base, SessionLocal
from common.models import (
    State, District, PoliceStation, Role, Permission, User, Officer,
    CrimeCategory, CrimeCase, Hotspot, CrimeNetwork, IncidentAlert,
    SimilarCase, CrimePrediction, PredictionModel, SystemSetting
)

def seed_database():
    print("[SEED] Resetting and creating database tables...")
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    db = SessionLocal()

    try:
        # 1. Seed State
        state = db.query(State).filter(State.code == "KA").first()
        if not state:
            state = State(name="Karnataka", code="KA")
            db.add(state)
            db.commit()
            db.refresh(state)
            print("[OK] State: Karnataka created.")

        # 2. Seed Districts
        KARNATAKA_DISTRICTS = [
            "Bagalkote", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
            "Bidar", "Chamarajanagara", "Chikkaballapura", "Chikkamagaluru", "Chitradurga",
            "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
            "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal",
            "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga",
            "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara", "Yadgir"
        ]

        district_objs = {}
        for d_name in KARNATAKA_DISTRICTS:
            d_obj = db.query(District).filter(District.name == d_name).first()
            if not d_obj:
                d_obj = District(state_id=state.id, name=d_name, code=d_name[:3].upper(), headquarters=f"{d_name} HQ")
                db.add(d_obj)
            district_objs[d_name] = d_obj
        db.commit()
        print(f"[OK] {len(KARNATAKA_DISTRICTS)} Districts verified.")

        # 3. Seed Police Stations
        STATION_MAPPING = {
            "Bengaluru Urban": ["Whitefield PS", "Koramangala PS", "Indiranagar PS", "M.G. Road PS", "Devanahalli PS"],
            "Mysuru": ["Nazarbad PS", "Vani Vilas PS", "K.R. Mohalla PS"],
            "Ballari": ["Ballari City PS", "Cowl Bazaar PS"],
            "Belagavi": ["Belagavi Town PS", "Camp PS"],
            "Dharwad": ["Hubballi Central PS", "Suburban PS"]
        }

        for dist_name, station_list in STATION_MAPPING.items():
            dist_obj = district_objs.get(dist_name)
            if dist_obj:
                for s_name in station_list:
                    station_obj = db.query(PoliceStation).filter(PoliceStation.name == s_name).first()
                    if not station_obj:
                        code = s_name.replace(" ", "-").upper()
                        db.add(PoliceStation(district_id=dist_obj.id, name=s_name, station_code=code, address=f"{s_name}, {dist_name}"))
        db.commit()
        print("[OK] Police Stations seeded.")

        # 4. Seed Roles
        ROLES = [
            ("Super Admin", "Full system oversight and state-wide administrative control"),
            ("State Admin", "State-wide crime analytics and command oversight"),
            ("District Officer", "District-level operational and officer management"),
            ("Police Officer", "Field incident registration and investigation tracking"),
            ("Analyst", "Data science and pattern analytics review"),
            ("Viewer", "Read-only dashboard access")
        ]

        role_objs = {}
        for r_name, r_desc in ROLES:
            r_obj = db.query(Role).filter(Role.name == r_name).first()
            if not r_obj:
                r_obj = Role(name=r_name, description=r_desc)
                db.add(r_obj)
            role_objs[r_name] = r_obj
        db.commit()
        print(f"[OK] {len(ROLES)} Roles seeded.")

        # 5. Seed Default Users & Officers
        USERS = [
            ("admin@ksp.gov.in", "admin123", "KSP Administrator", "Super Admin", "DSP-001", "Director General"),
            ("supervisor@ksp.gov.in", "supervisor123", "Dr. Ravishankar S", "State Admin", "DSP-002", "Superintendent"),
            ("analyst@ksp.gov.in", "analyst123", "Kavitha Gowda", "Analyst", "ANL-001", "Senior Crime Analyst"),
            ("investigator@ksp.gov.in", "investigator123", "Mahesh Kumar", "Police Officer", "INV-001", "Inspector")
        ]

        bengaluru_ps = db.query(PoliceStation).filter(PoliceStation.name == "Whitefield PS").first()
        bengaluru_ps_id = bengaluru_ps.id if bengaluru_ps else 1

        for email, pwd, name, r_name, badge, rank in USERS:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                r_obj = role_objs.get(r_name)
                user = User(
                    email=email,
                    password_hash=pwd,
                    name=name,
                    role=r_name.lower().replace(" ", "_"),
                    role_id=r_obj.id if r_obj else None,
                    badge_number=badge
                )
                db.add(user)
                db.commit()
                db.refresh(user)

                officer = Officer(
                    user_id=user.id,
                    police_station_id=bengaluru_ps_id,
                    rank=rank,
                    badge_number=badge,
                    assigned_cases_count=random.randint(5, 15),
                    resolved_cases_count=random.randint(2, 10)
                )
                db.add(officer)
        db.commit()
        print("[OK] Core Users & Officers seeded.")

        # 6. Seed Crime Categories
        CATEGORIES = [
            ("Theft", 40, "Property theft and unlawful taking of belongings"),
            ("Cybercrime", 65, "Online financial fraud, phishing, and digital identity theft"),
            ("Assault", 75, "Physical violence and bodily harm incidents"),
            ("Burglary", 60, "Illegal entry into premises to commit theft"),
            ("Vehicle theft", 50, "Motor vehicle and two-wheeler theft"),
            ("Fraud", 55, "Financial deception and forgery"),
            ("Narcotics", 80, "Illegal drug distribution and possession"),
            ("Robbery", 85, "Theft involving force or intimidation"),
            ("Homicide", 95, "Unlawful killing of individuals"),
            ("Extortion", 70, "Coerced financial extraction under threat")
        ]

        for cat_name, sev, desc in CATEGORIES:
            if not db.query(CrimeCategory).filter(CrimeCategory.name == cat_name).first():
                db.add(CrimeCategory(name=cat_name, severity_default=sev, description=desc))
        db.commit()
        print("[OK] Crime Categories seeded.")

        # 7. Seed Sample Crime Cases
        if db.query(CrimeCase).count() == 0:
            SAMPLE_CASES = [
                ("CR-2026-00101", "FIR-2026-0891", "Theft", "open", "Bengaluru Urban", "Whitefield PS", 45, "Night break-in at tech park premises stealing laptop hardware.", 29, "Male", "Software Engineer", "Urban", "Rajesh Kumar", 34, True, "Lockpicking backdoor", "Iron crowbar", "Tech Park Office", "Bicycle"),
                ("CR-2026-00102", "FIR-2026-0892", "Cybercrime", "pending", "Bengaluru Urban", "Devanahalli PS", 70, "Phishing scam targeting online banking credentials.", 42, "Female", "Bank Manager", "Urban", "Anand Sharma", 28, False, "Fake UPI QR code link", "Phishing Software", "Online Payment Gateway", "VPN Routing"),
                ("CR-2026-00103", "FIR-2026-0893", "Burglary", "solved", "Mysuru", "Nazarbad PS", 60, "Residential jewel theft reported during holiday weekend.", 58, "Male", "Businessman", "Semi-Urban", "Somashekhar N", 41, True, "Window grille cut", "Gas Cutter", "Independent House", "Auto Rickshaw"),
                ("CR-2026-00104", "FIR-2026-0894", "Assault", "open", "Ballari", "Ballari City PS", 80, "Street altercation following property dispute.", 35, "Male", "Agriculturalist", "Rural", "Prabhu G", 31, True, "Direct confrontation", "Wooden Bat", "Market Square", "Foot Escape"),
                ("CR-2026-00105", "FIR-2026-0895", "Vehicle theft", "solved", "Belagavi", "Belagavi Town PS", 50, "Two-wheeler stolen from shopping mall parking lot.", 24, "Female", "Student", "Urban", "Sunil V", 26, False, "Duplicate master key", "Master Key", "Public Parking", "Motorcycle Driveaway")
            ]

            now = datetime.now()
            for i, (cid, fir, ctype, st, dist, ps, sev, desc, vage, vgen, vemp, urb, off_name, off_age, repeat, mo, weap, target, escape) in enumerate(SAMPLE_CASES):
                case_date = now - timedelta(days=i * 3 + 1, hours=i * 2)
                case = CrimeCase(
                    crime_id=cid,
                    fir_number=fir,
                    crime_type=ctype,
                    status=st,
                    date_time=case_date,
                    district=dist,
                    police_station=ps,
                    severity_score=sev,
                    description=desc,
                    victim_age=vage,
                    victim_gender=vgen,
                    victim_employment=vemp,
                    urbanization=urb,
                    population_density=600 + i * 100,
                    offender_name=off_name,
                    offender_age=off_age,
                    offender_is_repeat=repeat,
                    modus_operandi=mo,
                    weapons_used=weap,
                    target_place=target,
                    escape_method=escape,
                    location_lat=12.9716 + (i * 0.05),
                    location_lng=77.5946 + (i * 0.05)
                )
                db.add(case)
            db.commit()
            print("[OK] Sample Crime Cases seeded.")

        # 8. Seed AI Prediction Models
        models = [
            ("Sentinel RiskPredict XGBoost", "2.1.0", "XGBoost Classifier", 0.91),
            ("Karnataka Spatial Hotspot NeuralNet", "1.4.2", "Spatial Convolutional Net", 0.88)
        ]

        for mname, mver, alg, acc in models:
            if not db.query(PredictionModel).filter(PredictionModel.name == mname).first():
                db.add(PredictionModel(name=mname, version=mver, algorithm=alg, accuracy_score=acc, is_active=True))
        db.commit()
        print("[OK] AI Models seeded.")

        # 9. Seed System Settings
        settings = [
            ("PLATFORM_NAME", "Sentinel AI - CrimeVision Platform"),
            ("STATE_NAME", "Karnataka State Police"),
            ("ALERT_SEVERITY_THRESHOLD", "75"),
            ("AUTO_DOSSIER_GENERATION", "true")
        ]

        for k, v in settings:
            if not db.query(SystemSetting).filter(SystemSetting.setting_key == k).first():
                db.add(SystemSetting(setting_key=k, setting_value=v))
        db.commit()
        print("[OK] System Settings seeded.")

        print("\n=========================================")
        print("SENTINEL-AI DATABASE SEEDING COMPLETE!")
        print("=========================================")

    except Exception as exc:
        db.rollback()
        print(f"[SEED ERROR] Failed to seed database: {exc}")
        raise exc
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
