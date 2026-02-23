from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_user_service, get_current_user, require_admin
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, UsersListResponse, UserPasswordReset
from app.services.user import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=UsersListResponse)
def list_users(
    current_user: User = Depends(require_admin),
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
    current_user: User = Depends(require_admin),
    service: UserService = Depends(get_user_service),
):
    return service.get(user_id)


@router.post("", response_model=UserOut)
def create_user(
    payload: UserCreate,
    current_user: User = Depends(require_admin),
    service: UserService = Depends(get_user_service),
):
    return service.create(payload, current_user)


@router.post("/{user_id}/reset-password", response_model=UserOut)
def reset_password_admin(
    user_id: int,
    payload: UserPasswordReset,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
):
    """Reset another user's password (requires admin or specific permissions)"""
    if not current_user.is_admin and not current_user.has_any_permission(["reset_user_password", "edit_user"]):
        raise HTTPException(status_code=403, detail="Bu əməliyyat üçün kifayət qədər səlahiyyətiniz yoxdur")
    
    return service.reset_password(user_id, payload.new_password, current_user)
