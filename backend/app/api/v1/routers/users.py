from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import require_admin, get_user_service
from app.schemas.user import UserCreate, UserOut, UsersListResponse
from app.services.user import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=UsersListResponse, dependencies=[Depends(require_admin)])
def list_users(
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
    service: UserService = Depends(get_user_service),
):
    items = service.list(q=q, limit=limit, offset=offset)
    # For now, total is items count (simple pagination)
    return UsersListResponse(items=items, total=len(items), limit=limit, offset=offset)


@router.get("/{user_id}", response_model=UserOut, dependencies=[Depends(require_admin)])
def get_user(
    user_id: int,
    service: UserService = Depends(get_user_service),
):
    return service.get(user_id)


@router.post("", response_model=UserOut, dependencies=[Depends(require_admin)])
def create_user(
    payload: UserCreate,
    service: UserService = Depends(get_user_service),
):
    return service.create(payload)


@router.patch("/{user_id}/toggle-active", response_model=UserOut, dependencies=[Depends(require_admin)])
def toggle_user_active(
    user_id: int,
    service: UserService = Depends(get_user_service),
):
    """Toggle user active/inactive status (admin only)"""
    return service.toggle_active(user_id)


