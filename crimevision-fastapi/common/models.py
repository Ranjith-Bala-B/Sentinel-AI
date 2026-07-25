from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # administrator, supervisor, analyst, investigator
    created_at = Column(DateTime, server_default=func.now())

class CrimeCase(Base):
    __tablename__ = "crimes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    crime_id = Column(String(50), unique=True, index=True, nullable=False)
    fir_number = Column(String(50), nullable=False)
    crime_type = Column(String(100), index=True, nullable=False)  # Theft, Cybercrime, etc.
    status = Column(String(50), index=True, nullable=False)  # open, pending, solved
    date_time = Column(DateTime, index=True, nullable=False)
    district = Column(String(100), index=True, nullable=False)
    police_station = Column(String(100), index=True, nullable=False)
    severity_score = Column(Integer, default=50)
    description = Column(Text, nullable=True)
    
    # Victim Demographics
    victim_age = Column(Integer, nullable=True)
    victim_gender = Column(String(20), nullable=True)
    victim_employment = Column(String(100), nullable=True)
    victim_education = Column(String(100), nullable=True)
    
    # Sociological Variables
    urbanization = Column(String(50), nullable=True)  # Urban, Semi-Urban, Rural
    population_density = Column(Integer, nullable=True)
    
    # Offender & MO
    offender_name = Column(String(255), nullable=True)
    offender_age = Column(Integer, nullable=True)
    offender_is_repeat = Column(Boolean, default=False)
    modus_operandi = Column(Text, nullable=True)
    weapons_used = Column(String(255), nullable=True)
    target_place = Column(String(255), nullable=True)
    escape_method = Column(String(255), nullable=True)
    
    # Geospatial coordinates
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

class CrimeNetwork(Base):
    __tablename__ = "crime_networks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_name = Column(String(255), index=True, nullable=False)
    source_type = Column(String(50), nullable=False)  # gang, accused, victim, location, vehicle
    target_name = Column(String(255), index=True, nullable=False)
    target_type = Column(String(50), nullable=False)  # gang, accused, victim, location, vehicle
    connection_type = Column(String(100), nullable=False)  # member, accomplice, arrested_at, etc.
    strength = Column(Integer, default=1)

class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    crime_count = Column(Integer, default=0)
    risk_level = Column(String(50), nullable=False)  # High, Medium, Low
    recommended_action = Column(Text, nullable=True)

class SimilarCase(Base):
    __tablename__ = "similar_cases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    case_id = Column(String(50), index=True, nullable=False)
    similar_case_id = Column(String(50), nullable=False)
    similarity_score = Column(Integer, nullable=False)  # 0 to 100
    common_features = Column(Text, nullable=True)
    investigation_lead = Column(Text, nullable=True)

class IncidentAlert(Base):
    __tablename__ = "incidents_feed"

    id = Column(String(50), primary_key=True)
    title = Column(String(255), nullable=False)
    district = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)  # critical, high, moderate, low
    timestamp = Column(String(100), nullable=False)
    is_read = Column(Boolean, default=False)
