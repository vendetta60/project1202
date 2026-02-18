from sqlalchemy import create_engine, text
from app.core.config import settings

def alter_schema():
    print(f"Connecting to: {settings.database_url}")
    engine = create_engine(settings.database_url)
    with engine.connect() as conn:
        print("Altering r_num column to NVARCHAR(50)...")
        # For MSSQL, we use ALTER TABLE ... ALTER COLUMN
        conn.execute(text("ALTER TABLE Executors ALTER COLUMN r_num NVARCHAR(50)"))
        conn.commit()
        print("Successfully altered r_num column.")

if __name__ == "__main__":
    try:
        alter_schema()
    except Exception as e:
        print(f"Error: {e}")
