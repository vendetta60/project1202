from sqlalchemy import text
from app.db.session import SessionLocal

def list_users():
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT id, username, is_admin, is_super_admin FROM Users"))
        users = result.fetchall()
        print("Existing Users:")
        for u in users:
            print(f"ID: {u[0]}, Username: {u[1]}, Admin: {u[2]}, SuperAdmin: {u[3]}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
