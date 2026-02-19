"""
Permission repository for RBAC system
"""
from sqlalchemy.orm import Session

from app.models.permission import (
    Permission,
    Role,
    RolePermission,
    UserRole,
    UserPermission,
    PermissionGroup,
    PermissionGroupItem,
)


class PermissionRepository:
    """Repository for Permission operations"""

    def __init__(self, db: Session):
        self.db = db

    def get(self, permission_id: int) -> Permission | None:
        return self.db.query(Permission).filter(Permission.id == permission_id).first()

    def get_by_code(self, code: str) -> Permission | None:
        return self.db.query(Permission).filter(Permission.code == code).first()

    def list_all(self, active_only: bool = True) -> list[Permission]:
        query = self.db.query(Permission)
        if active_only:
            query = query.filter(Permission.is_active == True)
        return query.all()

    def list_by_category(self, category: str) -> list[Permission]:
        return self.db.query(Permission).filter(
            Permission.category == category,
            Permission.is_active == True
        ).all()

    def create(self, code: str, name: str, description: str | None = None, category: str | None = None) -> Permission:
        permission = Permission(code=code, name=name, description=description, category=category)
        self.db.add(permission)
        self.db.commit()
        self.db.refresh(permission)
        return permission

    def update(self, permission_id: int, **kwargs) -> Permission | None:
        permission = self.get(permission_id)
        if not permission:
            return None
        for key, value in kwargs.items():
            if value is not None:
                setattr(permission, key, value)
        self.db.commit()
        self.db.refresh(permission)
        return permission

    def delete(self, permission_id: int) -> bool:
        permission = self.get(permission_id)
        if not permission:
            return False
        self.db.delete(permission)
        self.db.commit()
        return True


class RoleRepository:
    """Repository for Role operations"""

    def __init__(self, db: Session):
        self.db = db

    def get(self, role_id: int) -> Role | None:
        return self.db.query(Role).filter(Role.id == role_id).first()

    def get_by_name(self, name: str) -> Role | None:
        return self.db.query(Role).filter(Role.name == name).first()

    def list_all(self, active_only: bool = True) -> list[Role]:
        query = self.db.query(Role)
        if active_only:
            query = query.filter(Role.is_active == True)
        return query.all()

    def create(self, name: str, description: str | None = None, is_system: bool = False) -> Role:
        role = Role(name=name, description=description, is_system=is_system)
        self.db.add(role)
        self.db.commit()
        self.db.refresh(role)
        return role

    def update(self, role_id: int, **kwargs) -> Role | None:
        role = self.get(role_id)
        if not role:
            return None
        for key, value in kwargs.items():
            if value is not None:
                setattr(role, key, value)
        self.db.commit()
        self.db.refresh(role)
        return role

    def delete(self, role_id: int) -> bool:
        role = self.get(role_id)
        if not role or role.is_system:  # Prevent deletion of system roles
            return False
        self.db.delete(role)
        self.db.commit()
        return True

    def add_permission(self, role_id: int, permission_id: int) -> bool:
        """Add permission to role"""
        if self.db.query(RolePermission).filter(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id
        ).first():
            return True  # Already assigned
        
        rp = RolePermission(role_id=role_id, permission_id=permission_id)
        self.db.add(rp)
        self.db.commit()
        return True

    def remove_permission(self, role_id: int, permission_id: int) -> bool:
        """Remove permission from role"""
        rp = self.db.query(RolePermission).filter(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id
        ).first()
        if not rp:
            return False
        self.db.delete(rp)
        self.db.commit()
        return True

    def set_permissions(self, role_id: int, permission_ids: list[int]) -> bool:
        """Set all permissions for a role (replaces existing)"""
        # Remove old permissions
        self.db.query(RolePermission).filter(RolePermission.role_id == role_id).delete()
        
        # Add new permissions
        for perm_id in permission_ids:
            rp = RolePermission(role_id=role_id, permission_id=perm_id)
            self.db.add(rp)
        
        self.db.commit()
        return True


class UserRoleRepository:
    """Repository for UserRole operations"""

    def __init__(self, db: Session):
        self.db = db

    def get_user_roles(self, user_id: int) -> list[Role]:
        """Get all roles for a user"""
        return [ur.role for ur in self.db.query(UserRole).filter(UserRole.user_id == user_id).all()]

    def has_role(self, user_id: int, role_id: int) -> bool:
        """Check if user has a specific role"""
        return self.db.query(UserRole).filter(
            UserRole.user_id == user_id,
            UserRole.role_id == role_id
        ).first() is not None

    def assign_role(self, user_id: int, role_id: int) -> bool:
        """Assign role to user"""
        if self.has_role(user_id, role_id):
            return True  # Already assigned
        ur = UserRole(user_id=user_id, role_id=role_id)
        self.db.add(ur)
        self.db.commit()
        return True

    def revoke_role(self, user_id: int, role_id: int) -> bool:
        """Revoke role from user"""
        ur = self.db.query(UserRole).filter(
            UserRole.user_id == user_id,
            UserRole.role_id == role_id
        ).first()
        if not ur:
            return False
        self.db.delete(ur)
        self.db.commit()
        return True

    def set_user_roles(self, user_id: int, role_ids: list[int]) -> bool:
        """Set all roles for a user (replaces existing)"""
        self.db.query(UserRole).filter(UserRole.user_id == user_id).delete()
        
        for role_id in role_ids:
            ur = UserRole(user_id=user_id, role_id=role_id)
            self.db.add(ur)
        
        self.db.commit()
        return True


class UserPermissionRepository:
    """Repository for UserPermission operations"""

    def __init__(self, db: Session):
        self.db = db

    def get_user_permissions(self, user_id: int) -> list[UserPermission]:
        """Get all individual permissions for a user"""
        return self.db.query(UserPermission).filter(UserPermission.user_id == user_id).all()

    def grant_permission(self, user_id: int, permission_id: int, created_by: int | None = None) -> bool:
        """Grant a permission to user"""
        # Check if already exists
        existing = self.db.query(UserPermission).filter(
            UserPermission.user_id == user_id,
            UserPermission.permission_id == permission_id
        ).first()
        
        if existing:
            existing.grant_type = "grant"
            self.db.commit()
            return True
        
        up = UserPermission(user_id=user_id, permission_id=permission_id, grant_type="grant", created_by=created_by)
        self.db.add(up)
        self.db.commit()
        return True

    def deny_permission(self, user_id: int, permission_id: int, created_by: int | None = None) -> bool:
        """Deny a permission to user (overrides role permissions)"""
        existing = self.db.query(UserPermission).filter(
            UserPermission.user_id == user_id,
            UserPermission.permission_id == permission_id
        ).first()
        
        if existing:
            existing.grant_type = "deny"
            self.db.commit()
            return True
        
        up = UserPermission(user_id=user_id, permission_id=permission_id, grant_type="deny", created_by=created_by)
        self.db.add(up)
        self.db.commit()
        return True

    def revoke_permission_override(self, user_id: int, permission_id: int) -> bool:
        """Remove individual permission override (user falls back to role permissions)"""
        up = self.db.query(UserPermission).filter(
            UserPermission.user_id == user_id,
            UserPermission.permission_id == permission_id
        ).first()
        if not up:
            return False
        self.db.delete(up)
        self.db.commit()
        return True


class PermissionGroupRepository:
    """Repository for PermissionGroup operations"""

    def __init__(self, db: Session):
        self.db = db

    def get(self, group_id: int) -> PermissionGroup | None:
        return self.db.query(PermissionGroup).filter(PermissionGroup.id == group_id).first()

    def get_by_name(self, name: str) -> PermissionGroup | None:
        return self.db.query(PermissionGroup).filter(PermissionGroup.name == name).first()

    def list_all(self, template_only: bool = False, active_only: bool = True) -> list[PermissionGroup]:
        query = self.db.query(PermissionGroup)
        if template_only:
            query = query.filter(PermissionGroup.is_template == True)
        if active_only:
            query = query.filter(PermissionGroup.is_active == True)
        return query.all()

    def create(self, name: str, description: str | None = None, is_template: bool = True, permission_ids: list[int] | None = None) -> PermissionGroup:
        group = PermissionGroup(name=name, description=description, is_template=is_template)
        self.db.add(group)
        self.db.flush()
        
        if permission_ids:
            for perm_id in permission_ids:
                pgi = PermissionGroupItem(group_id=group.id, permission_id=perm_id)
                self.db.add(pgi)
        
        self.db.commit()
        self.db.refresh(group)
        return group

    def update(self, group_id: int, **kwargs) -> PermissionGroup | None:
        group = self.get(group_id)
        if not group:
            return None
        
        permission_ids = kwargs.pop("permission_ids", None)
        
        for key, value in kwargs.items():
            if value is not None:
                setattr(group, key, value)
        
        if permission_ids is not None:
            self.db.query(PermissionGroupItem).filter(PermissionGroupItem.group_id == group_id).delete()
            for perm_id in permission_ids:
                pgi = PermissionGroupItem(group_id=group_id, permission_id=perm_id)
                self.db.add(pgi)
        
        self.db.commit()
        self.db.refresh(group)
        return group

    def delete(self, group_id: int) -> bool:
        group = self.get(group_id)
        if not group:
            return False
        self.db.delete(group)
        self.db.commit()
        return True

    def apply_to_user(self, user_id: int, group_id: int) -> bool:
        """Apply all permissions from group to user"""
        from app.models.user import User
        
        group = self.get(group_id)
        if not group:
            return False
        
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        # Get all permissions from the group
        permissions = [item.permission_id for item in group.permission_group_items]
        
        # Clear existing individual permissions and set new ones
        self.db.query(UserPermission).filter(UserPermission.user_id == user_id).delete()
        
        for perm_id in permissions:
            up = UserPermission(user_id=user_id, permission_id=perm_id, grant_type="grant")
            self.db.add(up)
        
        self.db.commit()
        return True
