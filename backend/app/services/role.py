from fastapi import HTTPException
from typing import Dict, List

from app.models.role import Role
from app.repositories.role import RoleRepository
from app.schemas.role import RoleCreate, RoleUpdate


# Predefined permissions
PERMISSIONS = {
    "users": ["users:view", "users:create", "users:edit", "users:delete", "users:manage_roles"],
    "roles": ["roles:view", "roles:create", "roles:edit", "roles:delete"],
    "org_units": ["org_units:view", "org_units:create", "org_units:edit", "org_units:delete"],
    "citizens": ["citizens:view", "citizens:create", "citizens:edit", "citizens:delete"],
    "appeals": ["appeals:view", "appeals:create", "appeals:edit", "appeals:delete", "appeals:view_all"],
}

# Default role configurations
DEFAULT_ROLES = {
    "Super Admin": {
        "description": "Full system access with all permissions",
        "permissions": [perm for perms in PERMISSIONS.values() for perm in perms],
        "is_system": True,
    },
    "Admin": {
        "description": "Administrative access to manage users and organization",
        "permissions": [
            "users:view", "users:create", "users:edit", "users:manage_roles",
            "org_units:view", "org_units:create", "org_units:edit",
            "citizens:view", "citizens:create", "citizens:edit",
            "appeals:view_all", "appeals:view", "appeals:edit",
        ],
        "is_system": True,
    },
    "Operator": {
        "description": "Can manage appeals and citizens within assigned organization",
        "permissions": [
            "citizens:view", "citizens:create", "citizens:edit",
            "appeals:view", "appeals:create", "appeals:edit",
        ],
        "is_system": True,
    },
    "Viewer": {
        "description": "Read-only access to appeals and citizens",
        "permissions": [
            "citizens:view",
            "appeals:view",
        ],
        "is_system": True,
    },
}


class RoleService:
    def __init__(self, repo: RoleRepository):
        self.repo = repo

    def list(self) -> List[Role]:
        """Get all roles"""
        return self.repo.list()

    def get(self, role_id: int) -> Role:
        """Get role by ID"""
        role = self.repo.get(role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        return role

    def create(self, payload: RoleCreate) -> Role:
        """Create new role"""
        # Check if role name already exists
        if self.repo.get_by_name(payload.name):
            raise HTTPException(status_code=409, detail="Role name already exists")
        
        # Validate permissions
        valid_permissions = [perm for perms in PERMISSIONS.values() for perm in perms]
        for perm in payload.permissions:
            if perm not in valid_permissions:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid permission: {perm}"
                )
        
        role = Role(
            name=payload.name,
            description=payload.description,
            permissions=payload.permissions,
            is_system=False,
        )
        return self.repo.create(role)

    def update(self, role_id: int, payload: RoleUpdate) -> Role:
        """Update existing role"""
        role = self.get(role_id)
        
        # Cannot update system roles
        if role.is_system:
            raise HTTPException(
                status_code=400,
                detail="Cannot update system role"
            )
        
        # Check name uniqueness if changing name
        if payload.name and payload.name != role.name:
            if self.repo.get_by_name(payload.name):
                raise HTTPException(status_code=409, detail="Role name already exists")
            role.name = payload.name
        
        if payload.description is not None:
            role.description = payload.description
        
        if payload.permissions is not None:
            # Validate permissions
            valid_permissions = [perm for perms in PERMISSIONS.values() for perm in perms]
            for perm in payload.permissions:
                if perm not in valid_permissions:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid permission: {perm}"
                    )
            role.permissions = payload.permissions
        
        return self.repo.save(role)

    def delete(self, role_id: int) -> bool:
        """Delete role"""
        role = self.get(role_id)
        
        # Cannot delete system roles
        if role.is_system:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete system role"
            )
        
        return self.repo.delete(role_id)
    
    def get_all_permissions(self) -> Dict[str, List[str]]:
        """Get all available permissions grouped by category"""
        return PERMISSIONS
