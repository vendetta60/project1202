from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import require_admin, get_role_service
from app.schemas.role import RoleCreate, RoleOut, RoleUpdate
from app.services.role import RoleService

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("", response_model=list[RoleOut], dependencies=[Depends(require_admin)])
def list_roles(service: RoleService = Depends(get_role_service)):
    """Get all roles (admin only)"""
    return service.list()


@router.get("/permissions", dependencies=[Depends(require_admin)])
def get_permissions(service: RoleService = Depends(get_role_service)):
    """Get all available permissions grouped by category (admin only)"""
    return service.get_all_permissions()


@router.get("/{role_id}", response_model=RoleOut, dependencies=[Depends(require_admin)])
def get_role(
    role_id: int,
    service: RoleService = Depends(get_role_service),
):
    """Get role by ID (admin only)"""
    return service.get(role_id)


@router.post("", response_model=RoleOut, dependencies=[Depends(require_admin)])
def create_role(
    payload: RoleCreate,
    service: RoleService = Depends(get_role_service),
):
    """Create new role (admin only)"""
    return service.create(payload)


@router.patch("/{role_id}", response_model=RoleOut, dependencies=[Depends(require_admin)])
def update_role(
    role_id: int,
    payload: RoleUpdate,
    service: RoleService = Depends(get_role_service),
):
    """Update role (admin only, cannot update system roles)"""
    return service.update(role_id, payload)


@router.delete("/{role_id}", dependencies=[Depends(require_admin)])
def delete_role(
    role_id: int,
    service: RoleService = Depends(get_role_service),
):
    """Delete role (admin only, cannot delete system roles)"""
    success = service.delete(role_id)
    if not success:
        raise HTTPException(status_code=404, detail="Role not found")
    return {"message": "Role deleted successfully"}
