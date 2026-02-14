from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(settings.database_url)

with engine.connect() as conn:
    # Check count
    result = conn.execute(text("SELECT COUNT(*) FROM Appeals"))
    count = result.scalar()
    print(f"Total appeals in database: {count}")
    
    if count > 0:
        # Check first 1
        result = conn.execute(text("SELECT TOP 1 * FROM Appeals"))
        keys = result.keys()
        row = result.fetchone()
        print("\nSample Appeal Data:")
        for k, v in zip(keys, row):
            print(f"{k}: {v} (Type: {type(v)})")
    
    # Check users
    result = conn.execute(text("SELECT id, username, tab1, section_id FROM Users"))
    print("\nUsers:")
    for row in result:
        print(f"ID: {row[0]}, Username: {row[1]}, Admin (tab1): {row[2]}, Section: {row[3]}")
