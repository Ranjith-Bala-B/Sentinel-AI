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
            d_obj = District(state_id=state.id, name=d_name, code=d_name[:3].upper(), headquarters=f"{d_name} HQ")
            db.add(d_obj)
            district_objs[d_name] = d_obj
        db.commit()
        print(f"[OK] {len(KARNATAKA_DISTRICTS)} Districts verified.")

        # 3. Seed Police Stations
        STATION_MAPPING = {
            "Bengaluru Urban": ["Manipal Ps", "hebbal ps", "Whitefield PS", "Devanahalli PS"],
            "Mysuru": ["Mysuru PS", "Nazarbad PS"],
            "Ballari": ["hebbal ps", "Ballari City PS"],
            "Chikkaballapura": ["Mysuru PS"],
            "Davanagere": ["Mysuru PS"]
        }

        for dist_name, station_list in STATION_MAPPING.items():
            dist_obj = district_objs.get(dist_name)
            if dist_obj:
                for s_name in station_list:
                    if not db.query(PoliceStation).filter(PoliceStation.name == s_name, PoliceStation.district_id == dist_obj.id).first():
                        code = f"{s_name.replace(' ', '-').upper()}-{dist_obj.id}"
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
            r_obj = Role(name=r_name, description=r_desc)
            db.add(r_obj)
            role_objs[r_name] = r_obj
        db.commit()
        print(f"[OK] {len(ROLES)} Roles seeded.")

        # 5. Seed Core Users & Officers
        USERS = [
            ("admin@ksp.gov.in", "admin123", "KSP Administrator", "Super Admin", "DSP-001", "Director General"),
            ("supervisor@ksp.gov.in", "supervisor123", "Dr. Ravishankar S", "State Admin", "DSP-002", "Superintendent"),
            ("analyst@ksp.gov.in", "analyst123", "Kavitha Gowda", "Analyst", "ANL-001", "Senior Crime Analyst"),
            ("investigator@ksp.gov.in", "investigator123", "Mahesh Kumar", "Police Officer", "INV-001", "Inspector")
        ]

        bengaluru_ps = db.query(PoliceStation).filter(PoliceStation.name == "hebbal ps").first()
        ps_id = bengaluru_ps.id if bengaluru_ps else 1

        for email, pwd, name, r_name, badge, rank in USERS:
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
                police_station_id=ps_id,
                rank=rank,
                badge_number=badge,
                assigned_cases_count=3,
                resolved_cases_count=2
            )
            db.add(officer)
        db.commit()
        print("[OK] Core Users & Officers seeded.")

        # 6. Seed Crime Categories
        CATEGORIES = [
            ("Theft", 50, "Property theft and unlawful taking of belongings"),
            ("Cybercrime", 60, "Online financial fraud, phishing, and digital identity theft"),
            ("Burglary", 66, "Illegal entry into premises to commit theft"),
            ("Narcotics", 100, "Illegal drug distribution and possession")
        ]

        for cat_name, sev, desc in CATEGORIES:
            db.add(CrimeCategory(name=cat_name, severity_default=sev, description=desc))
        db.commit()
        print("[OK] Crime Categories seeded.")

        # 7. Seed Exact 5 Crime Cases from User Screenshots
        EXACT_CASES = [
            # (crime_id, fir_number, crime_type, status, district, police_station, severity_score, description, offender_name, offender_is_repeat, lat, lng, date_str)
            ("CR-2026-00006", "444/2026", "Cybercrime", "open", "Davanagere", "Mysuru PS", 67, "dvssdvvdvsd", "L Raja", False, 14.4644, 75.9218, "2026-07-24T14:00:00"),
            ("CR-2026-00004", "58/2026", "Narcotics", "open", "Chikkaballapura", "Mysuru PS", 100, "hvksdk v soldsdc", "Ragul", False, 13.4324, 77.7285, "2026-07-24T11:30:00"),
            ("CR-2026-00003", "248/2026", "Burglary", "pending", "Ballari", "hebbal ps", 66, "A case of Burglary registered at hebbal ps.", "Ranjith", True, 15.1394, 76.9214, "2026-07-24T09:15:00"),
            ("CR-2026-00002", "248/2026", "Cybercrime", "solved", "Bengaluru Urban", "hebbal ps", 60, "dsedrtfguhijopl[;lknj", "L Raja", True, 13.0358, 77.5970, "2026-07-22T16:45:00"),
            ("CR-2026-00001", "248/2026", "Theft", "closed", "Bengaluru Urban", "Manipal Ps", 50, "jiyccytcuoviipu[oh", "Arul", False, 12.9716, 77.5946, "2026-07-20T10:00:00")
        ]

        for cid, fir, ctype, st, dist, ps, sev, desc, off_name, repeat, lat, lng, dt_str in EXACT_CASES:
            case_date = datetime.fromisoformat(dt_str)
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
                victim_age=28,
                victim_gender="Male",
                victim_employment="Private Service",
                urbanization="Urban",
                population_density=1200,
                offender_name=off_name,
                offender_age=32,
                offender_is_repeat=repeat,
                modus_operandi="Digital phishing & unauthorized access" if ctype == "Cybercrime" else "House break-in",
                weapons_used="None" if ctype == "Cybercrime" else "Crowbar",
                target_place="Residential premises",
                escape_method="Motorcycle",
                location_lat=lat,
                location_lng=lng
            )
            db.add(case)
        db.commit()
        print("[OK] Exact 5 Crime Cases seeded.")

        # 8. Seed Exact Network Links from Screenshot 5
        NETWORKS = [
            ("L Raja", "accused", "CR-2026-00006", "crime", "perpetrated", 2),
            ("CR-2026-00006", "crime", "Mysuru PS (Davanagere)", "location", "occurred_at", 1),
            ("Ragul", "accused", "CR-2026-00004", "crime", "perpetrated", 2),
            ("CR-2026-00004", "crime", "Mysuru PS (Chikkaballapura)", "location", "occurred_at", 1),
            ("Ranjith", "accused", "CR-2026-00003", "crime", "perpetrated", 2),
            ("CR-2026-00003", "crime", "hebbal ps (Ballari)", "location", "occurred_at", 1),
            ("L Raja", "accused", "CR-2026-00002", "crime", "perpetrated", 2),
            ("CR-2026-00002", "crime", "hebbal ps (Bengaluru Urban)", "location", "occurred_at", 1),
            ("Arul", "accused", "CR-2026-00001", "crime", "perpetrated", 2),
            ("CR-2026-00001", "crime", "Manipal Ps (Bengaluru Urban)", "location", "occurred_at", 1),
        ]

        for s_name, s_type, t_name, t_type, conn_type, strg in NETWORKS:
            db.add(CrimeNetwork(
                source_name=s_name,
                source_type=s_type,
                target_name=t_name,
                target_type=t_type,
                connection_type=conn_type,
                strength=strg
            ))
        db.commit()
        print("[OK] Exact Crime Networks seeded.")

        # 9. Seed Hotspots
        HOTSPOTS = [
            ("Mysuru PS Area", 12.2958, 76.6394, 2, "High", "Establish 24x7 mobile patrolling beats around Mysuru PS limits."),
            ("hebbal ps Area", 13.0358, 77.5970, 2, "High", "Increase CCTV surveillance and night checkpoints near Hebbal junction."),
            ("Manipal Ps Area", 12.9716, 77.5946, 1, "Medium", "Deploy foot patrols near commercial banks and parking plazas.")
        ]

        for h_name, lat, lng, cnt, r_lvl, rec_act in HOTSPOTS:
            db.add(Hotspot(name=h_name, latitude=lat, longitude=lng, crime_count=cnt, risk_level=r_lvl, recommended_action=rec_act))
        db.commit()
        print("[OK] Hotspots seeded.")

        # 10. Seed Incident Feed Alerts
        ALERTS = [
            ("feed-CR-2026-00006", "New Cybercrime registered - FIR 444/2026", "Davanagere", "moderate", "10 mins ago"),
            ("feed-CR-2026-00004", "New Narcotics registered - FIR 58/2026", "Chikkaballapura", "critical", "1 hour ago"),
            ("feed-CR-2026-00003", "New Burglary registered - FIR 248/2026", "Ballari", "high", "3 hours ago"),
            ("feed-CR-2026-00002", "New Cybercrime registered - FIR 248/2026", "Bengaluru Urban", "high", "5 hours ago")
        ]

        for aid, title, dist, sev, ts in ALERTS:
            db.add(IncidentAlert(id=aid, title=title, district=dist, severity=sev, timestamp=ts, is_read=False))
        db.commit()
        print("[OK] Incident Feed Alerts seeded.")

        # 11. Seed Similar Cases
        SIMILAR = [
            ("CR-2026-00002", "CR-2026-00006", 92, "Identical Cybercrime phishing MO operated by suspect L Raja.", "Cross-reference IP logs with Davanagere cyber team."),
            ("CR-2026-00006", "CR-2026-00002", 92, "Identical Cybercrime phishing MO operated by suspect L Raja.", "Cross-reference IP logs with Bengaluru Urban cyber team.")
        ]

        for cid, scid, score, feats, lead in SIMILAR:
            db.add(SimilarCase(case_id=cid, similar_case_id=scid, similarity_score=score, common_features=feats, investigation_lead=lead))
        db.commit()
        print("[OK] Similar Cases seeded.")

        # 12. Seed AI Models & System Settings
        db.add(PredictionModel(name="Sentinel RiskPredict XGBoost", version="2.1.0", algorithm="XGBoost Classifier", accuracy_score=0.91, is_active=True))
        db.add(SystemSetting(setting_key="PLATFORM_NAME", setting_value="Sentinel AI - CrimeVision Platform"))
        db.add(SystemSetting(setting_key="STATE_NAME", setting_value="Karnataka State Police"))
        db.commit()

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
