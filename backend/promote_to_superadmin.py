from app.db.session import SessionLocal
from app.models.user import User

def promote_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if admin:
            admin.is_super_admin = True
            admin.is_admin = True
            db.commit()
            print(f"User '{admin.username}' promoted to Super Admin.")
        else:
            print("User 'admin' not found.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    promote_admin()
