"""
Service layer for RBAC operations
"""
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.permission import Permission, Role, PermissionGroup
from app.models.user import User
from app.repositories.permission import (
    PermissionRepository,
    RoleRepository,
    UserRoleRepository,
    UserPermissionRepository,
    PermissionGroupRepository,
)
from app.schemas.permission import (
    PermissionOut,
    RoleOut,
    RoleCreate,
    RoleUpdate,
    RoleWithPermissions,
    PermissionGroupOut,
    PermissionGroupCreate,
    PermissionGroupUpdate,
)


class PermissionService:
    """Service for permission management"""

    def __init__(self, repo: PermissionRepository):
        self.repo = repo

    def get(self, permission_id: int) -> Permission:
        permission = self.repo.get(permission_id)
        if not permission:
            raise HTTPException(status_code=404, detail="Permission not found")
        return permission

    def get_by_code(self, code: str) -> Permission:
        permission = self.repo.get_by_code(code)
        if not permission:
            raise HTTPException(status_code=404, detail="Permission not found")
        return permission

    def list_all(self) -> list[PermissionOut]:
        permissions = self.repo.list_all()
        return [PermissionOut.model_validate(p) for p in permissions]

    def list_by_category(self, category: str) -> list[PermissionOut]:
        permissions = self.repo.list_by_category(category)
        return [PermissionOut.model_validate(p) for p in permissions]

    def create(self, code: str, name: str, description: str | None = None, category: str | None = None) -> PermissionOut:
        # Check if code already exists
        if self.repo.get_by_code(code):
            raise HTTPException(status_code=400, detail="Permission code already exists")
        
        permission = self.repo.create(code, name, description, category)
        return PermissionOut.model_validate(permission)

    def delete(self, permission_id: int) -> bool:
        if not self.repo.delete(permission_id):
            raise HTTPException(status_code=404, detail="Permission not found")
        return True


class RoleService:
    """Service for role management"""

    def __init__(self, role_repo: RoleRepository, perm_repo: PermissionRepository):
        self.role_repo = role_repo
        self.perm_repo = perm_repo

    def get(self, role_id: int) -> Role:
        role = self.role_repo.get(role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        return role

    def list_all(self) -> list[RoleOut]:
        roles = self.role_repo.list_all()
        return [self._role_to_out(r) for r in roles]

    def create(self, data: RoleCreate) -> RoleOut:
        # Check if name already exists
        if self.role_repo.get_by_name(data.name):
            raise HTTPException(status_code=400, detail="Role name already exists")
        
        role = self.role_repo.create(data.name, data.description)
        return self._role_to_out(role)

    def update(self, role_id: int, data: RoleUpdate) -> RoleOut:
        role = self.get(role_id)
        
        if role.is_system:
            raise HTTPException(status_code=403, detail="Cannot modify system roles")
        
        update_data = data.model_dump(exclude_unset=True)
        role = self.role_repo.update(role_id, **update_data)
        
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        return self._role_to_out(role)

    def delete(self, role_id: int) -> bool:
        role = self.get(role_id)
        
        if role.is_system:
            raise HTTPException(status_code=403, detail="Cannot delete system roles")
        
        if not self.role_repo.delete(role_id):
            raise HTTPException(status_code=404, detail="Role not found")
        return True

    def add_permission(self, role_id: int, permission_id: int) -> RoleOut:
        role = self.get(role_id)
        perm = self.perm_repo.get(permission_id)
        
        if not perm:
            raise HTTPException(status_code=404, detail="Permission not found")
        
        self.role_repo.add_permission(role_id, permission_id)
        return self._role_to_out(self.get(role_id))

    def remove_permission(self, role_id: int, permission_id: int) -> RoleOut:
        role = self.get(role_id)
        
        if not self.role_repo.remove_permission(role_id, permission_id):
            raise HTTPException(status_code=404, detail="Permission not assigned to this role")
        
        return self._role_to_out(self.get(role_id))

    def set_permissions(self, role_id: int, permission_ids: list[int]) -> RoleOut:
        role = self.get(role_id)
        
        # Verify all permissions exist
        for perm_id in permission_ids:
            if not self.perm_repo.get(perm_id):
                raise HTTPException(status_code=404, detail=f"Permission {perm_id} not found")
        
        self.role_repo.set_permissions(role_id, permission_ids)
        return self._role_to_out(self.get(role_id))

    def _role_to_out(self, role: Role) -> RoleOut:
        permissions = [PermissionOut.model_validate(rp.permission) for rp in role.role_permissions]
        return RoleOut(
            id=role.id,
            name=role.name,
            description=role.description,
            is_system=role.is_system,
            is_active=role.is_active,
            permissions=permissions,
        )


class PermissionGroupService:
    """Service for permission group (template) management"""

    def __init__(self, group_repo: PermissionGroupRepository, perm_repo: PermissionRepository):
        self.group_repo = group_repo
        self.perm_repo = perm_repo

    def get(self, group_id: int) -> PermissionGroup:
        group = self.group_repo.get(group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Permission group not found")
        return group

    def list_all(self, template_only: bool = False) -> list[PermissionGroupOut]:
        groups = self.group_repo.list_all(template_only=template_only)
        return [self._group_to_out(g) for g in groups]

    def create(self, data: PermissionGroupCreate) -> PermissionGroupOut:
        # Check if name already exists
        if self.group_repo.get_by_name(data.name):
            raise HTTPException(status_code=400, detail="Permission group name already exists")
        
        # Verify all permissions exist
        for perm_id in data.permission_ids:
            if not self.perm_repo.get(perm_id):
                raise HTTPException(status_code=404, detail=f"Permission {perm_id} not found")
        
        group = self.group_repo.create(
            data.name,
            data.description,
            data.is_template,
            data.permission_ids
        )
        return self._group_to_out(group)

    def update(self, group_id: int, data: PermissionGroupUpdate) -> PermissionGroupOut:
        group = self.get(group_id)
        
        update_data = data.model_dump(exclude_unset=True)
        
        # Verify permissions if provided
        if "permission_ids" in update_data:
            for perm_id in update_data["permission_ids"]:
                if not self.perm_repo.get(perm_id):
                    raise HTTPException(status_code=404, detail=f"Permission {perm_id} not found")
        
        group = self.group_repo.update(group_id, **update_data)
        if not group:
            raise HTTPException(status_code=404, detail="Permission group not found")
        
        return self._group_to_out(group)

    def delete(self, group_id: int) -> bool:
        if not self.group_repo.delete(group_id):
            raise HTTPException(status_code=404, detail="Permission group not found")
        return True

    def apply_to_user(self, user_id: int, group_id: int) -> bool:
        """Apply permission group's permissions to a user"""
        if not self.group_repo.apply_to_user(user_id, group_id):
            raise HTTPException(status_code=400, detail="Failed to apply group permissions")
        return True

    def _group_to_out(self, group: PermissionGroup) -> PermissionGroupOut:
        permissions = [PermissionOut.model_validate(item.permission) for item in group.permission_group_items]
        return PermissionGroupOut(
            id=group.id,
            name=group.name,
            description=group.description,
            is_template=group.is_template,
            is_active=group.is_active,
            permissions=permissions,
        )


class UserPermissionService:
    """Service for user-level permission operations"""

    def __init__(self, user_role_repo: UserRoleRepository, user_perm_repo: UserPermissionRepository):
        self.user_role_repo = user_role_repo
        self.user_perm_repo = user_perm_repo

    def get_user_permissions(self, user_id: int, db: Session) -> set[str]:
        """Get all permission codes for a user"""
        from app.models.user import User
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return set(user.permissions)

    def assign_role(self, user_id: int, role_id: int) -> bool:
        """Assign a role to a user"""
        if not self.user_role_repo.assign_role(user_id, role_id):
            raise HTTPException(status_code=400, detail="Failed to assign role")
        return True

    def revoke_role(self, user_id: int, role_id: int) -> bool:
        """Revoke a role from a user"""
        if not self.user_role_repo.revoke_role(user_id, role_id):
            raise HTTPException(status_code=404, detail="User does not have this role")
        return True

    def grant_permission(self, user_id: int, permission_id: int, created_by: int | None = None) -> bool:
        """Grant a specific permission to a user"""
        if not self.user_perm_repo.grant_permission(user_id, permission_id, created_by):
            raise HTTPException(status_code=400, detail="Failed to grant permission")
        return True

    def deny_permission(self, user_id: int, permission_id: int, created_by: int | None = None) -> bool:
        """Deny a permission to a user (overrides role permissions)"""
        if not self.user_perm_repo.deny_permission(user_id, permission_id, created_by):
            raise HTTPException(status_code=400, detail="Failed to deny permission")
        return True

    def revoke_permission_override(self, user_id: int, permission_id: int) -> bool:
        """Remove individual permission override"""
        if not self.user_perm_repo.revoke_permission_override(user_id, permission_id):
            raise HTTPException(status_code=404, detail="No permission override found")
        return True
