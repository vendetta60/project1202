from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_user_service, get_current_user, require_admin
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, UsersListResponse
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
    return service.create(payload)
