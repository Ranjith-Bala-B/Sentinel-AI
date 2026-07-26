import os
import sqlite3
import time
import urllib.parse
from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from common.logger import get_logger

logger = get_logger("database-service")

# Load environment variables
load_dotenv()

RAW_DB_URL = os.environ.get("DATABASE_URL")
MYSQL_HOST = os.environ.get("MYSQL_HOST")
MYSQL_PORT = os.environ.get("MYSQL_PORT", "3306")
MYSQL_USER = os.environ.get("MYSQL_USER", "root")
MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD")
MYSQL_DATABASE = os.environ.get("MYSQL_DATABASE", "sentinel_ai")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.environ.get("DATABASE_PATH", os.path.join(BASE_DIR, "crimevision.db"))

# Resolve Database URL
if RAW_DB_URL:
    if RAW_DB_URL.startswith("mysql://"):
        DATABASE_URL = RAW_DB_URL.replace("mysql://", "mysql+pymysql://", 1)
    else:
        DATABASE_URL = RAW_DB_URL
elif MYSQL_HOST or MYSQL_PASSWORD:
    encoded_pwd = urllib.parse.quote_plus(MYSQL_PASSWORD) if MYSQL_PASSWORD else ""
    DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{encoded_pwd}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
else:
    DATABASE_URL = f"sqlite:///{DB_PATH}"

# Ensure @ in raw mysql passwords is URL encoded (%40)
if "mysql" in DATABASE_URL and "@" in DATABASE_URL:
    # Check if there are multiple @ symbols (e.g. mysql+pymysql://user:pass@word@host:3306/db)
    parts = DATABASE_URL.split("@")
    if len(parts) > 2:
        user_pass_part = "@".join(parts[:-1])
        host_db_part = parts[-1]
        scheme, user_pass = user_pass_part.split("://", 1)
        if ":" in user_pass:
            user, pwd = user_pass.split(":", 1)
            encoded_pwd = urllib.parse.quote_plus(pwd)
            DATABASE_URL = f"{scheme}://{user}:{encoded_pwd}@{host_db_part}"

logger.info(f"Database dialect configured: {DATABASE_URL.split('://')[0]}")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        pool_size=10,
        max_overflow=20
    )

# Register custom MySQL-compatible datetime functions for SQLite fallback
@event.listens_for(engine, "connect")
def connect(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        def weekday(date_str):
            if not date_str:
                return None
            try:
                from datetime import datetime
                dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                return dt.weekday()
            except Exception:
                try:
                    dt = datetime.strptime(date_str.split(".")[0], "%Y-%m-%d %H:%M:%S")
                    return dt.weekday()
                except Exception:
                    return 0

        def month(date_str):
            if not date_str:
                return None
            try:
                from datetime import datetime
                dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                return dt.month
            except Exception:
                try:
                    dt = datetime.strptime(date_str.split(".")[0], "%Y-%m-%d %H:%M:%S")
                    return dt.month
                except Exception:
                    parts = date_str.split("-")
                    if len(parts) >= 2:
                        return int(parts[1])
                    return 1

        def year(date_str):
            if not date_str:
                return None
            try:
                from datetime import datetime
                dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                return dt.year
            except Exception:
                try:
                    dt = datetime.strptime(date_str.split(".")[0], "%Y-%m-%d %H:%M:%S")
                    return dt.year
                except Exception:
                    parts = date_str.split("-")
                    if len(parts) >= 1:
                        return int(parts[0])
                    return 2026

        def hour(date_str):
            if not date_str:
                return None
            try:
                from datetime import datetime
                dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                return dt.hour
            except Exception:
                try:
                    dt = datetime.strptime(date_str.split(".")[0], "%Y-%m-%d %H:%M:%S")
                    return dt.hour
                except Exception:
                    parts = date_str.split(" ")
                    if len(parts) >= 2:
                        subparts = parts[1].split(":")
                        if len(subparts) >= 1:
                            return int(subparts[0])
                    return 12

        dbapi_connection.create_function("weekday", 1, weekday)
        dbapi_connection.create_function("month", 1, month)
        dbapi_connection.create_function("year", 1, year)
        dbapi_connection.create_function("hour", 1, hour)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def check_database_health() -> tuple[bool, str, Exception | None]:
    """Verifies active connection to database and returns (is_healthy, db_name, exception)."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            db_name = conn.execute(text("SELECT DATABASE()")).scalar()
        return True, db_name or "sqlite", None
    except Exception as exc:
        logger.warning(f"Database health ping failed: {exc}")
        return False, "", exc

def verify_db_connection(max_retries: int = 3, retry_delay: float = 1.0) -> bool:
    """Retry logic for database connection at startup."""
    for attempt in range(1, max_retries + 1):
        is_healthy, db_name, _ = check_database_health()
        if is_healthy:
            logger.info(f"Database connection verified on attempt {attempt}.")
            return True
        logger.warning(f"Database connection attempt {attempt}/{max_retries} failed. Retrying in {retry_delay}s...")
        time.sleep(retry_delay)
    logger.error(f"Failed to connect to database after {max_retries} attempts.")
    return False

def verify_crud_operations(db) -> bool:
    from common.models import CrimeCase
    from datetime import datetime
    import uuid

    test_crime_id = f"TEST-CRUD-{uuid.uuid4().hex[:6].upper()}"
    logger.info("Starting CRUD Verification...")
    
    try:
        # Create
        new_case = CrimeCase(
            crime_id=test_crime_id,
            fir_number="TEST-FIR-000",
            crime_type="System Test",
            date_time=datetime.utcnow(),
            district="Test District",
            police_station="Test Station",
            status="open",
            description="System CRUD validation test."
        )
        db.add(new_case)
        db.commit()
        db.refresh(new_case)
        logger.info("✓ CREATE Passed")

        # Read
        read_case = db.query(CrimeCase).filter(CrimeCase.crime_id == test_crime_id).first()
        if not read_case:
            raise Exception("Failed to read the created case.")
        logger.info("✓ READ Passed")

        # Update
        read_case.status = "closed"
        db.commit()
        db.refresh(read_case)
        if read_case.status != "closed":
            raise Exception("Failed to update the case status.")
        logger.info("✓ UPDATE Passed")

        # Delete
        db.delete(read_case)
        db.commit()
        verify_deleted = db.query(CrimeCase).filter(CrimeCase.crime_id == test_crime_id).first()
        if verify_deleted:
            raise Exception("Failed to delete the case.")
        logger.info("✓ DELETE Passed")

        return True
    except Exception as e:
        logger.error(f"✗ CRUD Verification Failed: {e}")
        db.rollback()
        return False

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
