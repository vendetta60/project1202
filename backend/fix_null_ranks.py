from sqlalchemy import text
from app.db.session import SessionLocal

def fix_nulls():
    db = SessionLocal()
    try:
        # Set is_admin = 1 for users who were admins in the old system (tab1=1)
        # And set 0 for everyone else where it's NULL
        print("Updating is_admin...")
        db.execute(text("UPDATE Users SET is_admin = 1 WHERE tab1 = 1 AND is_admin IS NULL"))
        db.execute(text("UPDATE Users SET is_admin = 0 WHERE is_admin IS NULL"))
        
        print("Updating is_super_admin...")
        db.execute(text("UPDATE Users SET is_super_admin = 0 WHERE is_super_admin IS NULL"))
        
        # Ensure superadmin is indeed a superadmin
        db.execute(text("UPDATE Users SET is_super_admin = 1, is_admin = 1 WHERE username = 'superadmin'"))
        
        db.commit()
        print("Database updated successfully.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_nulls()
