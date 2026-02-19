import sys
import os

# Add the parent directory to the path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.services.user import UserService
from app.repositories.user import UserRepository
from app.repositories.permission import UserRoleRepository, UserPermissionRepository, RoleRepository, PermissionGroupRepository
from app.schemas.user import UserCreate

def verify_rbac():
    db = SessionLocal()
    try:
        user_repo = UserRepository(db)
        user_service = UserService(user_repo)
        role_repo = RoleRepository(db)
        group_repo = PermissionGroupRepository(db)
        
        print("--- Starting RBAC Verification ---")
        
        # 1. Check if 'Viewer' role exists
        viewer_role = role_repo.get_by_name("Viewer")
        if not viewer_role:
            print("Viewer role not found, creating it...")
            viewer_role = role_repo.create({"name": "Viewer", "description": "Can view things"})
        
        # 2. Create a test user with role and group
        username = "rbac_test_user_unique"
        # Delete if exists
        existing = user_repo.get_by_username(username)
        if existing:
            print(f"User {username} already exists, deleting for fresh test...")
            db.delete(existing)
            db.commit()

        user_in = UserCreate(
            username=username,
            password="testpassword123",
            name="Test",
            surname="User",
            role_ids=[viewer_role.id]
        )
        
        print(f"Creating user {username} with role {viewer_role.name}...")
        new_user = user_service.create(user_in)
        
        # 3. Verify roles
        ur_repo = UserRoleRepository(db)
        roles = ur_repo.get_user_roles(new_user.id)
        role_names = [r.name for r in roles]
        print(f"Assigned roles: {role_names}")
        
        if "Viewer" in role_names:
            print("✅ SUCCESS: Role assigned correctly during user creation.")
        else:
            print("❌ FAILURE: Role not assigned.")
            
        # 4. Cleanup
        print("Cleaning up test user...")
        db.delete(new_user)
        db.commit()
        print("Verification complete.")
        
    finally:
        db.close()

if __name__ == "__main__":
    verify_rbac()
