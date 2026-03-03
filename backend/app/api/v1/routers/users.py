from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import (
    get_user_service, get_audit_service, get_current_user,
    require_permission
)
from app.core.maintenance import (
    enable_maintenance,
    disable_maintenance,
    is_maintenance_enabled,
    get_maintenance_message,
    get_seconds_until_logout,
)
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, UsersListResponse, UserPasswordReset
from app.services.user import UserService
from app.services.audit import AuditService

router = APIRouter(prefix="/users", tags=["users"])


def _get_service_with_audit(
    service: UserService = Depends(get_user_service),
    audit: AuditService = Depends(get_audit_service),
) -> UserService:
    service.audit = audit
    return service


@router.get("", response_model=UsersListResponse)
def list_users(
    current_user: User = Depends(require_permission(
        "view_users", "edit_user", "create_user", "delete_user",
        "block_user", "manage_user_roles", "reset_user_password"
    )),
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
    service: UserService = Depends(get_user_service),
):
    items = service.list(q=q, limit=limit, offset=offset)
    total = service.count()
    return UsersListResponse(items=items, total=total, limit=limit, offset=offset)


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    current_user: User = Depends(require_permission("view_users", "edit_user")),
    service: UserService = Depends(get_user_service),
):
    return service.get(user_id)


@router.post("", response_model=UserOut)
def create_user(
    payload: UserCreate,
    current_user: User = Depends(require_permission("create_user")),
    service: UserService = Depends(_get_service_with_audit),
):
    return service.create(payload, current_user)


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    current_user: User = Depends(require_permission("delete_user")),
    service: UserService = Depends(_get_service_with_audit),
):
    """Hard-delete a user from the system."""
    service.delete(user_id, current_user)


@router.post("/{user_id}/toggle-block", response_model=UserOut)
def toggle_block_user(
    user_id: int,
    current_user: User = Depends(require_permission("block_user")),
    service: UserService = Depends(_get_service_with_audit),
):
    """Block or unblock a user (toggles their active status)."""
    return service.toggle_block(user_id, current_user)


@router.post("/{user_id}/reset-password", response_model=UserOut)
def reset_password_admin(
    user_id: int,
    payload: UserPasswordReset,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(_get_service_with_audit),
):
    """Reset another user's password (requires admin or specific permissions)"""
    if not current_user.is_admin and not current_user.has_any_permission(["reset_user_password", "edit_user"]):
        raise HTTPException(status_code=403, detail="Bu əməliyyat üçün kifayət qədər səlahiyyətiniz yoxdur")

    return service.reset_password(user_id, payload.new_password, current_user)


@router.post("/maintenance/start", status_code=status.HTTP_204_NO_CONTENT)
def start_maintenance(
    current_user: User = Depends(get_current_user),
):
    """
    Texniki rejimi aktiv et:
    - Yalnız admin və super adminlər istifadə edə bilər
    - Bütün digər istifadəçilər üçün sistem bağlanır (503 və texniki təmir mesajı)
    """
    if not (current_user.is_admin or current_user.is_super_admin):
        raise HTTPException(status_code=403, detail="Bu əməliyyat üçün kifayət qədər səlahiyyətiniz yoxdur")

    # 60 saniyəlik grace period ilə texniki rejimi aktiv et
    enable_maintenance(delay_seconds=60)


@router.post("/maintenance/stop", status_code=status.HTTP_204_NO_CONTENT)
def stop_maintenance(
    current_user: User = Depends(get_current_user),
):
    """
    Texniki rejimi deaktiv et.
    """
    if not (current_user.is_admin or current_user.is_super_admin):
        raise HTTPException(status_code=403, detail="Bu əməliyyat üçün kifayət qədər səlahiyyətiniz yoxdur")

    disable_maintenance()


@router.get("/maintenance/status")
def maintenance_status(
    current_user: User = Depends(get_current_user),
):
    """
    Mövcud texniki rejim statusunu qaytarır (admin panel üçün).
    """
    return {
        "enabled": is_maintenance_enabled(),
        "message": get_maintenance_message(),
        "seconds_until_logout": get_seconds_until_logout(),
    }


@router.get("/maintenance/public-status")
def maintenance_public_status():
    """
    Texniki rejimin sadə statusunu (auth tələb etmədən) qaytarır.
    Frontend müştərilər bunu periodik yoxlayaraq avtomatik refresh edə bilər.
    """
    return {
        "enabled": is_maintenance_enabled(),
        "message": get_maintenance_message(),
        "seconds_until_logout": get_seconds_until_logout(),
    }
