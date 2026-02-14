import sys
import os
import hashlib

# Add backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.session import SessionLocal
from app.models.user import User

def create_admin():
    db = SessionLocal()
    try:
        # Check if 'admin' exists
        existing = db.query(User).filter(User.username == 'admin').first()
        if existing:
            print("User 'admin' already exists. Updating password to 'admin'...")
            existing.password = hashlib.sha256('admin'.encode()).hexdigest()
            existing.tab1 = True # Ensure admin access
            db.commit()
            print("Updated 'admin' user successfully.")
        else:
            print("Creating new 'admin' user...")
            new_admin = User(
                username='admin',
                surname='Admin',
                name='User',
                password=hashlib.sha256('admin'.encode()).hexdigest(),
                tab1=True, # Admin panel access
                section_id=None
            )
            db.add(new_admin)
            db.commit()
            print("Created 'admin' user successfully.")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
