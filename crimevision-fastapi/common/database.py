import os
import sqlite3
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Use absolute path for local SQLite database file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.environ.get("DATABASE_PATH", os.path.join(BASE_DIR, "crimevision.db"))
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Register custom MySQL-compatible datetime functions for SQLite
@event.listens_for(engine, "connect")
def connect(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        # 1. Custom weekday function (returns 0=Monday, 6=Sunday)
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

        # 2. Custom month function
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

        # 3. Custom year function
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

        # 4. Custom hour function
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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
