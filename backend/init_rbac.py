"""
Initialize RBAC system with default permissions and roles
Run this script after database is created to set up the RBAC system
"""
import sys
from sqlalchemy.orm import Session

# Add parent directory to path
sys.path.insert(0, '..')

from app.db.session import SessionLocal
from app.models.permission import Permission, Role, RolePermission, PermissionGroup, PermissionGroupItem
from app.models.user import User


def init_permissions(db: Session):
    """Create default permissions"""
    permissions_data = [
        # Appeals permissions
        ("view_appeals", "View Appeals", "View appeal list", "appeals"),
        ("create_appeal", "Create Appeal", "Create new appeal", "appeals"),
        ("edit_appeal", "Edit Appeal", "Edit appeal details", "appeals"),
        ("delete_appeal", "Delete Appeal", "Delete appeal", "appeals"),
        ("view_appeal_details", "View Appeal Details", "View detailed appeal information", "appeals"),
        ("assign_appeal", "Assign Appeal", "Assign appeal to executor", "appeals"),
        ("complete_appeal", "Complete Appeal", "Mark appeal as completed", "appeals"),
        ("export_appeals", "Export Appeals", "Export appeals to file", "appeals"),
        
        # Users permissions
        ("view_users", "View Users", "View user list", "users"),
        ("create_user", "Create User", "Create new user", "users"),
        ("edit_user", "Edit User", "Edit user details", "users"),
        ("delete_user", "Delete User", "Delete user", "users"),
        ("manage_user_roles", "Manage User Roles", "Assign or revoke user roles", "users"),
        ("manage_user_permissions", "Manage User Permissions", "Grant or deny user permissions", "users"),
        ("reset_user_password", "Reset User Password", "Reset user password", "users"),
        
        # Reports permissions
        ("view_reports", "View Reports", "View reports", "reports"),
        ("create_report", "Create Report", "Generate reports", "reports"),
        ("export_report", "Export Report", "Export reports", "reports"),
        ("manage_report_templates", "Manage Report Templates", "Create and edit report templates", "reports"),
        
        # Audit permissions
        ("view_audit_logs", "View Audit Logs", "View system audit logs", "audit"),
        ("export_audit_logs", "Export Audit Logs", "Export audit logs", "audit"),
        
        # Citizens permissions
        ("view_citizens", "View Citizens", "View citizen list", "citizens"),
        ("create_citizen", "Create Citizen", "Register new citizen", "citizens"),
        ("edit_citizen", "Edit Citizen", "Edit citizen details", "citizens"),
        ("delete_citizen", "Delete Citizen", "Delete citizen record", "citizens"),
        
        # Admin permissions
        ("manage_roles", "Manage Roles", "Create, edit, delete roles", "admin"),
        ("manage_permissions", "Manage Permissions", "Create and configure permissions", "admin"),
        ("manage_permission_groups", "Manage Permission Groups", "Create and edit permission groups", "admin"),
        ("access_admin_panel", "Access Admin Panel", "Access system administration panel", "admin"),
        ("system_configuration", "System Configuration", "Configure system settings", "admin"),
    ]
    
    existing_codes = {p.code for p in db.query(Permission).all()}
    
    for code, name, description, category in permissions_data:
        if code not in existing_codes:
            permission = Permission(
                code=code,
                name=name,
                description=description,
                category=category,
                is_active=True
            )
            db.add(permission)
            print(f"Created permission: {code}")
    
    db.commit()


def init_roles(db: Session):
    """Create default roles"""
    
    # Get all permissions by category for easier assignment
    all_permissions = db.query(Permission).all()
    perm_dict = {p.code: p for p in all_permissions}
    
    # System Admin Role - has all permissions
    admin_role = db.query(Role).filter(Role.name == "System Admin").first()
    if not admin_role:
        admin_role = Role(
            name="System Admin",
            description="System administrator with full access",
            is_system=True,
            is_active=True
        )
        db.add(admin_role)
        db.flush()
        
        # Assign all permissions
        for permission in all_permissions:
            rp = RolePermission(role_id=admin_role.id, permission_id=permission.id)
            db.add(rp)
        
        print("Created role: System Admin")
    
    # Appeals Manager Role
    appeals_manager = db.query(Role).filter(Role.name == "Appeals Manager").first()
    if not appeals_manager:
        appeals_manager = Role(
            name="Appeals Manager",
            description="Can manage appeals lifecycle",
            is_system=False,
            is_active=True
        )
        db.add(appeals_manager)
        db.flush()
        
        appeals_perms = ["view_appeals", "create_appeal", "edit_appeal", "delete_appeal",
                        "view_appeal_details", "assign_appeal", "complete_appeal", "export_appeals",
                        "view_citizens"]
        for perm_code in appeals_perms:
            if perm_code in perm_dict:
                rp = RolePermission(role_id=appeals_manager.id, permission_id=perm_dict[perm_code].id)
                db.add(rp)
        
        print("Created role: Appeals Manager")
    
    # Report Analyst Role
    analyst = db.query(Role).filter(Role.name == "Report Analyst").first()
    if not analyst:
        analyst = Role(
            name="Report Analyst",
            description="Can view and generate reports",
            is_system=False,
            is_active=True
        )
        db.add(analyst)
        db.flush()
        
        analyst_perms = ["view_appeals", "view_appeal_details", "view_reports", "create_report", "export_report",
                        "view_audit_logs", "view_citizens"]
        for perm_code in analyst_perms:
            if perm_code in perm_dict:
                rp = RolePermission(role_id=analyst.id, permission_id=perm_dict[perm_code].id)
                db.add(rp)
        
        print("Created role: Report Analyst")
    
    # Viewer Role - read-only access
    viewer = db.query(Role).filter(Role.name == "Viewer").first()
    if not viewer:
        viewer = Role(
            name="Viewer",
            description="Read-only access to system",
            is_system=False,
            is_active=True
        )
        db.add(viewer)
        db.flush()
        
        viewer_perms = ["view_appeals", "view_appeal_details", "view_reports", "view_citizens"]
        for perm_code in viewer_perms:
            if perm_code in perm_dict:
                rp = RolePermission(role_id=viewer.id, permission_id=perm_dict[perm_code].id)
                db.add(rp)
        
        print("Created role: Viewer")
    
    db.commit()


def init_permission_groups(db: Session):
    """Create permission group templates"""
    
    all_permissions = db.query(Permission).all()
    perm_dict = {p.code: p for p in all_permissions}
    
    groups_data = [
        {
            "name": "Appeals Manager Group",
            "description": "Template for appeals management team",
            "permissions": ["view_appeals", "create_appeal", "edit_appeal", "delete_appeal",
                          "view_appeal_details", "assign_appeal", "complete_appeal", "export_appeals",
                          "view_citizens"]
        },
        {
            "name": "Report Generator Group",
            "description": "Template for report generation and analysis",
            "permissions": ["view_appeals", "view_appeal_details", "view_reports", "create_report",
                          "export_report", "view_audit_logs"]
        },
        {
            "name": "User Administrator Group",
            "description": "Template for user management",
            "permissions": ["view_users", "create_user", "edit_user", "delete_user",
                          "manage_user_roles", "manage_user_permissions", "reset_user_password"]
        },
        {
            "name": "Citizen Support Group",
            "description": "Template for citizen support staff",
            "permissions": ["view_citizens", "create_citizen", "edit_citizen", "view_appeals",
                          "view_appeal_details"]
        },
    ]
    
    existing_names = {g.name for g in db.query(PermissionGroup).all()}
    
    for group_data in groups_data:
        if group_data["name"] not in existing_names:
            group = PermissionGroup(
                name=group_data["name"],
                description=group_data["description"],
                is_template=True,
                is_active=True
            )
            db.add(group)
            db.flush()
            
            for perm_code in group_data["permissions"]:
                if perm_code in perm_dict:
                    pgi = PermissionGroupItem(
                        group_id=group.id,
                        permission_id=perm_dict[perm_code].id
                    )
                    db.add(pgi)
            
            print(f"Created permission group: {group_data['name']}")
    
    db.commit()


def create_default_admin(db: Session):
    """Create default admin user if none exists with admin role"""
    # Check if any admin user exists
    from app.core.security import hash_password
    
    admins = db.query(User).filter(User.tab1 == True).all()
    
    if not admins:
        # Create default admin user
        admin_role = db.query(Role).filter(Role.name == "System Admin").first()
        
        if admin_role:
            admin_user = User(
                surname="System",
                name="Administrator",
                username="admin",
                password=hash_password("admin123"),  # Default password - SHOULD BE CHANGED
                section_id=None,
                tab1=True,  # Keep legacy admin flag for backward compatibility
                is_deleted=False
            )
            db.add(admin_user)
            db.flush()
            
            # Assign System Admin role
            from app.models.permission import UserRole
            user_role = UserRole(user_id=admin_user.id, role_id=admin_role.id)
            db.add(user_role)
            
            db.commit()
            print(f"Created default admin user: admin (password: admin123)")
            print("⚠️  IMPORTANT: Change the default password immediately!")


def run_initialization():
    """Run the full initialization"""
    print("\n" + "="*60)
    print("Initializing RBAC System")
    print("="*60 + "\n")
    
    db = SessionLocal()
    
    try:
        print("Step 1: Creating permissions...")
        init_permissions(db)
        print("✓ Permissions initialized\n")
        
        print("Step 2: Creating roles...")
        init_roles(db)
        print("✓ Roles initialized\n")
        
        print("Step 3: Creating permission group templates...")
        init_permission_groups(db)
        print("✓ Permission groups initialized\n")
        
        print("Step 4: Setting up default admin user...")
        create_default_admin(db)
        print("✓ Default admin user ready\n")
        
        print("="*60)
        print("RBAC System initialization completed successfully!")
        print("="*60)
        print("\nYou can now:")
        print("1. Login as admin user with username 'admin'")
        print("2. Create additional users and assign roles/permissions")
        print("3. Create custom permission groups")
        print("4. Manage user permissions via the admin panel")
        
    except Exception as e:
        print(f"\n❌ Error during initialization: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    run_initialization()
