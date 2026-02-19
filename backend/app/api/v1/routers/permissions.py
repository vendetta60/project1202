"""
RBAC API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.repositories.permission import (
    PermissionRepository,
    RoleRepository,
    UserRoleRepository,
    UserPermissionRepository,
    PermissionGroupRepository,
)
from app.services.permission import (
    PermissionService,
    RoleService,
    PermissionGroupService,
    UserPermissionService,
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
    UserRoleAssignment,
    UserPermissionAssignment,
    UserPermissionsOut,
)

router = APIRouter(prefix="/permissions", tags=["permissions"])


def check_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to check if user is admin"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def get_permission_service(db: Session = Depends(get_db)) -> PermissionService:
    return PermissionService(PermissionRepository(db))


def get_role_service(db: Session = Depends(get_db)) -> RoleService:
    return RoleService(RoleRepository(db), PermissionRepository(db))


def get_group_service(db: Session = Depends(get_db)) -> PermissionGroupService:
    return PermissionGroupService(PermissionGroupRepository(db), PermissionRepository(db))


def get_user_permission_service(db: Session = Depends(get_db)) -> UserPermissionService:
    return UserPermissionService(UserRoleRepository(db), UserPermissionRepository(db))


# ============ PERMISSIONS ENDPOINTS ============

@router.get("/list", response_model=list[PermissionOut])
def list_permissions(
    current_user: User = Depends(check_admin),
    service: PermissionService = Depends(get_permission_service),
):
    """List all permissions in the system"""
    return service.list_all()


@router.get("/categories/{category}", response_model=list[PermissionOut])
def get_permissions_by_category(
    category: str,
    current_user: User = Depends(check_admin),
    service: PermissionService = Depends(get_permission_service),
):
    """Get permissions by category (e.g., 'appeals', 'users', 'reports')"""
    return service.list_by_category(category)


@router.post("/create")
def create_permission(
    code: str,
    name: str,
    description: str | None = None,
    category: str | None = None,
    current_user: User = Depends(check_admin),
    service: PermissionService = Depends(get_permission_service),
):
    """Create a new permission"""
    return service.create(code, name, description, category)


# ============ ROLES ENDPOINTS ============

@router.get("/roles/list", response_model=list[RoleOut])
def list_roles(
    current_user: User = Depends(check_admin),
    service: RoleService = Depends(get_role_service),
):
    """List all roles"""
    return service.list_all()


@router.get("/roles/{role_id}", response_model=RoleOut)
def get_role(
    role_id: int,
    current_user: User = Depends(check_admin),
    service: RoleService = Depends(get_role_service),
):
    """Get a specific role with its permissions"""
    role = service.get(role_id)
    return service._role_to_out(role)


@router.post("/roles/create", response_model=RoleOut)
def create_role(
    data: RoleCreate,
    current_user: User = Depends(check_admin),
    service: RoleService = Depends(get_role_service),
):
    """Create a new role"""
    return service.create(data)


@router.put("/roles/{role_id}", response_model=RoleOut)
def update_role(
    role_id: int,
    data: RoleUpdate,
    current_user: User = Depends(check_admin),
    service: RoleService = Depends(get_role_service),
):
    """Update a role"""
    return service.update(role_id, data)


@router.delete("/roles/{role_id}")
def delete_role(
    role_id: int,
    current_user: User = Depends(check_admin),
    service: RoleService = Depends(get_role_service),
):
    """Delete a role"""
    service.delete(role_id)
    return {"status": "success"}


@router.post("/roles/{role_id}/permissions/{permission_id}")
def add_permission_to_role(
    role_id: int,
    permission_id: int,
    current_user: User = Depends(check_admin),
    service: RoleService = Depends(get_role_service),
):
    """Add a permission to a role"""
    return service.add_permission(role_id, permission_id)


@router.delete("/roles/{role_id}/permissions/{permission_id}")
def remove_permission_from_role(
    role_id: int,
    permission_id: int,
    current_user: User = Depends(check_admin),
    service: RoleService = Depends(get_role_service),
):
    """Remove a permission from a role"""
    return service.remove_permission(role_id, permission_id)


@router.post("/roles/{role_id}/permissions/set")
def set_role_permissions(
    role_id: int,
    permission_ids: list[int],
    current_user: User = Depends(check_admin),
    service: RoleService = Depends(get_role_service),
):
    """Set all permissions for a role (replaces existing)"""
    return service.set_permissions(role_id, permission_ids)


# ============ PERMISSION GROUPS ENDPOINTS ============

@router.get("/groups/list", response_model=list[PermissionGroupOut])
def list_permission_groups(
    template_only: bool = True,
    current_user: User = Depends(check_admin),
    service: PermissionGroupService = Depends(get_group_service),
):
    """List permission groups (templates)"""
    return service.list_all(template_only=template_only)


@router.get("/groups/{group_id}", response_model=PermissionGroupOut)
def get_permission_group(
    group_id: int,
    current_user: User = Depends(check_admin),
    service: PermissionGroupService = Depends(get_group_service),
):
    """Get a specific permission group"""
    group = service.get(group_id)
    return service._group_to_out(group)


@router.post("/groups/create", response_model=PermissionGroupOut)
def create_permission_group(
    data: PermissionGroupCreate,
    current_user: User = Depends(check_admin),
    service: PermissionGroupService = Depends(get_group_service),
):
    """Create a new permission group"""
    return service.create(data)


@router.put("/groups/{group_id}", response_model=PermissionGroupOut)
def update_permission_group(
    group_id: int,
    data: PermissionGroupUpdate,
    current_user: User = Depends(check_admin),
    service: PermissionGroupService = Depends(get_group_service),
):
    """Update a permission group"""
    return service.update(group_id, data)


@router.delete("/groups/{group_id}")
def delete_permission_group(
    group_id: int,
    current_user: User = Depends(check_admin),
    service: PermissionGroupService = Depends(get_group_service),
):
    """Delete a permission group"""
    service.delete(group_id)
    return {"status": "success"}


# ============ USER PERMISSIONS ENDPOINTS ============

@router.get("/users/{user_id}/permissions", response_model=UserPermissionsOut)
def get_user_permissions(
    user_id: int,
    current_user: User = Depends(check_admin),
    db: Session = Depends(get_db),
    service: UserPermissionService = Depends(get_user_permission_service),
):
    """Get all permissions for a user"""
    from app.models.user import User as UserModel
    from app.models.permission import UserRole as UserRoleModel
    
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    permission_codes = list(user.get_permissions())
    role_ids = [ur.role_id for ur in user.user_roles]
    
    return UserPermissionsOut(
        user_id=user_id,
        permission_codes=permission_codes,
        role_ids=role_ids,
    )


@router.post("/users/{user_id}/roles/{role_id}")
def assign_role_to_user(
    user_id: int,
    role_id: int,
    current_user: User = Depends(check_admin),
    service: UserPermissionService = Depends(get_user_permission_service),
):
    """Assign a role to a user"""
    service.assign_role(user_id, role_id)
    return {"status": "success"}


@router.delete("/users/{user_id}/roles/{role_id}")
def revoke_role_from_user(
    user_id: int,
    role_id: int,
    current_user: User = Depends(check_admin),
    service: UserPermissionService = Depends(get_user_permission_service),
):
    """Revoke a role from a user"""
    service.revoke_role(user_id, role_id)
    return {"status": "success"}


@router.post("/users/{user_id}/permissions/{permission_id}/grant")
def grant_permission_to_user(
    user_id: int,
    permission_id: int,
    current_user: User = Depends(check_admin),
    service: UserPermissionService = Depends(get_user_permission_service),
):
    """Grant a specific permission to a user"""
    service.grant_permission(user_id, permission_id, current_user.id)
    return {"status": "success"}


@router.post("/users/{user_id}/permissions/{permission_id}/deny")
def deny_permission_to_user(
    user_id: int,
    permission_id: int,
    current_user: User = Depends(check_admin),
    service: UserPermissionService = Depends(get_user_permission_service),
):
    """Deny a permission to a user (overrides role permissions)"""
    service.deny_permission(user_id, permission_id, current_user.id)
    return {"status": "success"}


@router.delete("/users/{user_id}/permissions/{permission_id}/override")
def revoke_permission_override(
    user_id: int,
    permission_id: int,
    current_user: User = Depends(check_admin),
    service: UserPermissionService = Depends(get_user_permission_service),
):
    """Remove individual permission override for a user"""
    service.revoke_permission_override(user_id, permission_id)
    return {"status": "success"}


@router.post("/groups/{group_id}/apply-to-user/{user_id}")
def apply_group_to_user(
    group_id: int,
    user_id: int,
    current_user: User = Depends(check_admin),
    service: PermissionGroupService = Depends(get_group_service),
):
    """Apply all permissions from a group to a user"""
    service.apply_to_user(user_id, group_id)
    return {"status": "success"}
