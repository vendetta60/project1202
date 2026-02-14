import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.session import SessionLocal
from app.models.user import User

def find_admins():
    db = SessionLocal()
    try:
        admins = db.query(User).filter(User.tab1 == True).all()
        print(f"Found {len(admins)} admin users (tab1=True):")
        for admin in admins:
            print(f"ID: {admin.id}, Username: {admin.username}, Name: {admin.name} {admin.surname}")
        
        if not admins:
            print("No admin users found.")
            # Check for 'admin' user
            admin_user = db.query(User).filter(User.username == 'admin').first()
            if admin_user:
                print(f"Found user 'admin' (ID: {admin_user.id}) but tab1 is False.")
            else:
                print("User 'admin' not found.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    find_admins()
