import sys
import os

# Add the backend directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.user import UserService
from app.services.audit import AuditService
from app.repositories.user import UserRepository
from app.repositories.audit_log import AuditLogRepository
from app.schemas.user import UserCreate
from app.models.user import User
import random
import string

def get_random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def verify_audit_logging():
    db = SessionLocal()
    try:
        user_repo = UserRepository(db)
        audit_repo = AuditLogRepository(db)
        audit_service = AuditService(audit_repo)
        user_service = UserService(user_repo, audit_service)

        # 1. Create a dummy admin user if not exists to act as creator
        admin = user_repo.get_by_username("admin")
        if not admin:
            print("Creating dummy admin for testing...")
            admin = User(username="admin", password="password", is_admin=True)
            db.add(admin)
            db.commit()
            db.refresh(admin)

        # 2. Create a new user via service
        new_username = "audit_test_" + get_random_string()
        payload = UserCreate(
            username=new_username,
            password="testpassword",
            surname="Test",
            name="User",
            section_id=None
        )

        print(f"Creating user: {new_username}...")
        created_user = user_service.create(payload, current_user=admin)
        print(f"User created with ID: {created_user.id}")

        # 3. Verify audit log
        print("Verifying audit log...")
        logs = audit_service.list_logs(entity_type="User", entity_id=created_user.id, action="CREATE")
        
        if logs and logs[0]:
            log = logs[0] # The list_logs returns (items, total) tuple since verification step 23 shows list_logs returning tuple. 
            # Wait, step 23 shows list_logs returns tuple[list[AuditLog], int]
            # So logs is (items, total)
            items, total = logs
            if total > 0:
                log_entry = items[0]
                print("SUCCESS: Audit log found!")
                print(f"  ID: {log_entry.id}")
                print(f"  Action: {log_entry.action}")
                print(f"  Entity: {log_entry.entity_type} #{log_entry.entity_id}")
                print(f"  Description: {log_entry.description}")
            else:
                 print("FAILURE: No audit logs found for created user.")
        else:
             print("FAILURE: service.list_logs returned unexpected format.")

    except Exception as e:
        with open("verification_result.txt", "w") as f:
            f.write(f"ERROR: {e}\n")
            import traceback
            traceback.print_exc(file=f)
    finally:
        db.close()

if __name__ == "__main__":
    # Redirect stdout to a file
    sys.stdout = open("verification_result.txt", "w")
    verify_audit_logging()
    sys.stdout.close()
