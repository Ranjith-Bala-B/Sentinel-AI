from sqlalchemy import (
    Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey, Table
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

# Many-to-Many Association Table: Roles <-> Permissions
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True)
)

# 1. State & Location Hierarchy
class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    districts = relationship("District", back_populates="state", cascade="all, delete-orphan")


class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=False)
    name = Column(String(100), index=True, nullable=False)
    code = Column(String(10), nullable=True)
    headquarters = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    state = relationship("State", back_populates="districts")
    police_stations = relationship("PoliceStation", back_populates="district", cascade="all, delete-orphan")


class PoliceStation(Base):
    __tablename__ = "police_stations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=False)
    name = Column(String(150), index=True, nullable=False)
    station_code = Column(String(50), unique=True, nullable=False)
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    district = relationship("District", back_populates="police_stations")
    officers = relationship("Officer", back_populates="police_station")


# 2. Access Control & User Management
class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=True)


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), unique=True, index=True, nullable=False) # Super Admin, State Admin, District Officer, Police Officer, Analyst, Viewer
    description = Column(String(255), nullable=True)

    permissions = relationship("Permission", secondary=role_permissions, backref="roles")
    users = relationship("User", back_populates="role_rel")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Police Officer")
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    badge_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    role_rel = relationship("Role", back_populates="users")
    officer_profile = relationship("Officer", back_populates="user", uselist=False)
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")


class Officer(Base):
    __tablename__ = "officers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    police_station_id = Column(Integer, ForeignKey("police_stations.id"), nullable=True)
    rank = Column(String(100), nullable=False)
    badge_number = Column(String(50), unique=True, nullable=False)
    phone_number = Column(String(20), nullable=True)
    assigned_cases_count = Column(Integer, default=0)
    resolved_cases_count = Column(Integer, default=0)

    user = relationship("User", back_populates="officer_profile")
    police_station = relationship("PoliceStation", back_populates="officers")


# 3. Crime & Case Management
class CrimeCategory(Base):
    __tablename__ = "crime_categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    severity_default = Column(Integer, default=50)
    description = Column(Text, nullable=True)


class CrimeCase(Base):
    __tablename__ = "crimes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    crime_id = Column(String(50), unique=True, index=True, nullable=False)
    fir_number = Column(String(50), nullable=False)
    crime_type = Column(String(100), index=True, nullable=False)
    status = Column(String(50), index=True, nullable=False, default="open")
    date_time = Column(DateTime, index=True, nullable=False)
    district = Column(String(100), index=True, nullable=False)
    police_station = Column(String(100), index=True, nullable=False)
    severity_score = Column(Integer, default=50)
    description = Column(Text, nullable=True)
    
    # Demographics & MO
    victim_age = Column(Integer, nullable=True)
    victim_gender = Column(String(20), nullable=True)
    victim_employment = Column(String(100), nullable=True)
    victim_education = Column(String(100), nullable=True)
    urbanization = Column(String(50), nullable=True)
    population_density = Column(Integer, nullable=True)
    offender_name = Column(String(255), nullable=True)
    offender_age = Column(Integer, nullable=True)
    offender_is_repeat = Column(Boolean, default=False)
    modus_operandi = Column(Text, nullable=True)
    weapons_used = Column(String(255), nullable=True)
    target_place = Column(String(255), nullable=True)
    escape_method = Column(String(255), nullable=True)
    
    # Coordinates
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    evidences = relationship("CrimeEvidence", back_populates="crime_case", cascade="all, delete-orphan")
    victims = relationship("Victim", back_populates="crime_case", cascade="all, delete-orphan")
    suspects = relationship("Suspect", back_populates="crime_case", cascade="all, delete-orphan")
    assignments = relationship("CaseAssignment", back_populates="crime_case", cascade="all, delete-orphan")


class Victim(Base):
    __tablename__ = "victims"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    crime_case_id = Column(Integer, ForeignKey("crimes.id"), nullable=False)
    name = Column(String(255), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    statement = Column(Text, nullable=True)

    crime_case = relationship("CrimeCase", back_populates="victims")


class Suspect(Base):
    __tablename__ = "suspects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    crime_case_id = Column(Integer, ForeignKey("crimes.id"), nullable=False)
    name = Column(String(255), nullable=False)
    alias = Column(String(100), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    is_repeat_offender = Column(Boolean, default=False)
    prior_convictions = Column(Integer, default=0)
    status = Column(String(50), default="suspect") # suspect, detained, arrested, acquitted

    crime_case = relationship("CrimeCase", back_populates="suspects")


class CrimeEvidence(Base):
    __tablename__ = "crime_evidences"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    crime_case_id = Column(Integer, ForeignKey("crimes.id"), nullable=False)
    title = Column(String(255), nullable=False)
    evidence_type = Column(String(50), nullable=False) # document, image, video, physical, forensic
    description = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    crime_case = relationship("CrimeCase", back_populates="evidences")
    images = relationship("CrimeImage", back_populates="evidence", cascade="all, delete-orphan")
    videos = relationship("CrimeVideo", back_populates="evidence", cascade="all, delete-orphan")


class CrimeImage(Base):
    __tablename__ = "crime_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    evidence_id = Column(Integer, ForeignKey("crime_evidences.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    caption = Column(String(255), nullable=True)

    evidence = relationship("CrimeEvidence", back_populates="images")


class CrimeVideo(Base):
    __tablename__ = "crime_videos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    evidence_id = Column(Integer, ForeignKey("crime_evidences.id"), nullable=False)
    video_url = Column(String(500), nullable=False)
    duration_seconds = Column(Integer, nullable=True)

    evidence = relationship("CrimeEvidence", back_populates="videos")


class CaseAssignment(Base):
    __tablename__ = "case_assignments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    crime_case_id = Column(Integer, ForeignKey("crimes.id"), nullable=False)
    officer_id = Column(Integer, ForeignKey("officers.id"), nullable=False)
    assigned_at = Column(DateTime, server_default=func.now())
    status = Column(String(50), default="active")

    crime_case = relationship("CrimeCase", back_populates="assignments")
    officer = relationship("Officer")


class CaseStatus(Base):
    __tablename__ = "case_statuses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    status_name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), nullable=True)


# 4. Networks & Hotspots
class CrimeNetwork(Base):
    __tablename__ = "crime_networks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_name = Column(String(255), index=True, nullable=False)
    source_type = Column(String(50), nullable=False)
    target_name = Column(String(255), index=True, nullable=False)
    target_type = Column(String(50), nullable=False)
    connection_type = Column(String(100), nullable=False)
    strength = Column(Integer, default=1)


class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    crime_count = Column(Integer, default=0)
    risk_level = Column(String(50), nullable=False)
    recommended_action = Column(Text, nullable=True)


class CrimePrediction(Base):
    __tablename__ = "crime_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    district = Column(String(100), index=True, nullable=False)
    police_station = Column(String(100), nullable=True)
    predicted_crime_type = Column(String(100), nullable=False)
    risk_score = Column(Float, nullable=False) # 0.0 to 1.0
    confidence_score = Column(Float, nullable=False) # 0.0 to 1.0
    forecast_period = Column(String(50), nullable=False)
    recommended_patrols = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class CrimeStatistic(Base):
    __tablename__ = "crime_statistics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    district = Column(String(100), index=True, nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    total_crimes = Column(Integer, default=0)
    solved_crimes = Column(Integer, default=0)
    pending_crimes = Column(Integer, default=0)
    conviction_rate = Column(Float, default=0.0)


class CrimeHistory(Base):
    __tablename__ = "crime_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    crime_id = Column(String(50), index=True, nullable=False)
    action_taken = Column(String(255), nullable=False)
    performed_by = Column(String(255), nullable=False)
    timestamp = Column(DateTime, server_default=func.now())


class CrimeHeatmap(Base):
    __tablename__ = "crime_heatmaps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    district = Column(String(100), index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    intensity = Column(Float, default=1.0)
    weight = Column(Float, default=1.0)


# 5. AI & Audit Persistence
class AIInferenceHistory(Base):
    __tablename__ = "ai_inference_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    model_name = Column(String(100), nullable=False)
    model_version = Column(String(50), default="1.0.0")
    prompt_query = Column(Text, nullable=True)
    response_text = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    execution_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class PredictionModel(Base):
    __tablename__ = "prediction_models"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    version = Column(String(50), nullable=False)
    algorithm = Column(String(100), nullable=False)
    accuracy_score = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    trained_at = Column(DateTime, server_default=func.now())


class SimilarCase(Base):
    __tablename__ = "similar_cases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    case_id = Column(String(50), index=True, nullable=False)
    similar_case_id = Column(String(50), nullable=False)
    similarity_score = Column(Integer, nullable=False)
    common_features = Column(Text, nullable=True)
    investigation_lead = Column(Text, nullable=True)


class IncidentAlert(Base):
    __tablename__ = "incidents_feed"

    id = Column(String(50), primary_key=True)
    title = Column(String(255), nullable=False)
    district = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)
    timestamp = Column(String(100), nullable=False)
    is_read = Column(Boolean, default=False)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_email = Column(String(255), nullable=False)
    action = Column(String(255), nullable=False)
    resource = Column(String(255), nullable=False)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, server_default=func.now())


class DashboardCache(Base):
    __tablename__ = "dashboard_cache"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cache_key = Column(String(100), unique=True, index=True, nullable=False)
    data_json = Column(Text, nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    setting_key = Column(String(100), unique=True, index=True, nullable=False)
    setting_value = Column(Text, nullable=False)


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_token = Column(String(500), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="sessions")
