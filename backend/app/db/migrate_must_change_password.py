"""
Startup migration: add must_change_password to Users if missing.
Runs once at app startup so the app works even before manual DB migration.
"""
import logging

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import engine

logger = logging.getLogger(__name__)


def run_migrate_must_change_password() -> None:
    """Add Users.must_change_password column if it does not exist."""
    try:
        url = str(engine.url)
        if "mssql" in url or "sqlserver" in url:
            _migrate_mssql()
        elif "sqlite" in url:
            _migrate_sqlite()
    except SQLAlchemyError as e:
        logger.warning("Migration must_change_password skipped or failed: %s", e)


def _migrate_mssql() -> None:
    with engine.connect() as conn:
        # Check if column already exists
        r = conn.execute(
            text(
                """
                SELECT 1 FROM sys.columns c
                INNER JOIN sys.tables t ON c.object_id = t.object_id
                WHERE t.name = N'Users' AND c.name = N'must_change_password'
                """
            )
        ).first()
        if r is not None:
            return
        # Find schema of Users table (e.g. dbo or custom)
        schema_row = conn.execute(
            text(
                """
                SELECT s.name FROM sys.tables t
                INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
                WHERE t.name = N'Users'
                """
            )
        ).first()
        if not schema_row:
            logger.warning("Users table not found in DB; migration skipped")
            return
        schema = schema_row[0]
        conn.execute(text(f"ALTER TABLE [{schema}].[Users] ADD must_change_password BIT NOT NULL DEFAULT 0"))
        conn.commit()
        logger.info("Added column %s.Users.must_change_password", schema)
