from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException

from app.core.config import settings


connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    fast_executemany=True if "mssql" in settings.database_url else False,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        # IMPORTANT: Frontend treats HTTP 503 as "maintenance mode" and forces logout.
        # Use 502 for DB connectivity issues so users aren't bounced back to login.
        raise HTTPException(status_code=502, detail=f"Database unavailable: {e.__class__.__name__}")
    finally:
        db.close()

