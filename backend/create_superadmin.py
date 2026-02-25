import hashlib
from app.db.session import SessionLocal
from app.models.user import User

def create_superadmin():
    db = SessionLocal()
    try:
        # Check if superadmin exists
        existing = db.query(User).filter(User.username == "superadmin").first()
        if existing:
            print("User 'superadmin' already exists.")
            existing.is_super_admin = True
            existing.is_admin = True
            db.commit()
            return

        password = "admin123"
        hashed_password = hashlib.sha256(password.encode("utf-8")).hexdigest()
        
        new_user = User(
            username="superadmin",
            password=hashed_password,
            surname="Super",
            name="Admin",
            is_admin=True,
            is_super_admin=True,
            is_deleted=False
        )
        db.add(new_user)
        db.commit()
        print(f"Super Admin created: username='superadmin', password='{password}'")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_superadmin()
