"""
Bootstrap default roles on application startup
"""
from sqlalchemy.orm import Session

from app.models.role import Role
from app.services.role import DEFAULT_ROLES


def bootstrap_roles(db: Session) -> None:
    """
    Create default system roles if they don't exist
    """
    for role_name, role_config in DEFAULT_ROLES.items():
        # Check if role already exists
        existing_role = db.query(Role).filter(Role.name == role_name).first()
        
        if not existing_role:
            role = Role(
                name=role_name,
                description=role_config["description"],
                permissions=role_config["permissions"],
                is_system=role_config["is_system"],
            )
            db.add(role)
            print(f"Created system role: {role_name}")
        else:
            # Update permissions for existing system roles
            if existing_role.is_system:
                existing_role.permissions = role_config["permissions"]
                existing_role.description = role_config["description"]
                print(f"Updated system role: {role_name}")
    
    db.commit()
    print("Role bootstrap completed")
