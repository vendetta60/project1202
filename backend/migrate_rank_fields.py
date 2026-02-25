from sqlalchemy import text
from app.db.session import SessionLocal

def update_db():
    db = SessionLocal()
    try:
        # Check if is_admin column exists
        db.execute(text("ALTER TABLE Users ADD is_admin BIT DEFAULT 0"))
        print("Column 'is_admin' added.")
    except Exception as e:
        print(f"Column 'is_admin' might already exist or error: {e}")
        db.rollback()

    try:
        # Check if is_super_admin column exists
        db.execute(text("ALTER TABLE Users ADD is_super_admin BIT DEFAULT 0"))
        print("Column 'is_super_admin' added.")
    except Exception as e:
        print(f"Column 'is_super_admin' might already exist or error: {e}")
        db.rollback()

    try:
        db.commit()
    except Exception as e:
        print(f"Error during commit: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_db()
