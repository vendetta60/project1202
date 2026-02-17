from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.deps import get_appeal_service, get_current_user
from app.models.user import User
from app.schemas.appeal import AppealCreate, AppealOut, AppealUpdate
from app.services.appeal import AppealService

router = APIRouter(prefix="/appeals", tags=["appeals"])


class AppealsListResponse(BaseModel):
    items: list[AppealOut]
    total: int
    limit: int
    offset: int


@router.get("", response_model=AppealsListResponse)
def list_appeals(
    current_user: User = Depends(get_current_user),
    dep_id: int | None = None,
    region_id: int | None = None,
    status: int | None = None,
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
    service: AppealService = Depends(get_appeal_service),
):
    items = service.list(
        current_user=current_user,
        dep_id=dep_id,
        region_id=region_id,
        status=status,
        q=q,
        limit=limit,
        offset=offset,
    )
    total = service.count(
        current_user=current_user,
        dep_id=dep_id,
        region_id=region_id,
        status=status,
        q=q,
    )
    return AppealsListResponse(items=items, total=total, limit=limit, offset=offset)


@router.get("/{appeal_id}", response_model=AppealOut)
def get_appeal(
    appeal_id: int,
    current_user: User = Depends(get_current_user),
    service: AppealService = Depends(get_appeal_service),
):
    return service.get(appeal_id=appeal_id, current_user=current_user)


@router.post("", response_model=AppealOut)
def create_appeal(
    payload: AppealCreate,
    current_user: User = Depends(get_current_user),
    service: AppealService = Depends(get_appeal_service),
):
    return service.create(current_user=current_user, payload=payload)


@router.patch("/{appeal_id}", response_model=AppealOut)
def update_appeal(
    appeal_id: int,
    payload: AppealUpdate,
    current_user: User = Depends(get_current_user),
    service: AppealService = Depends(get_appeal_service),
):
    return service.update(current_user=current_user, appeal_id=appeal_id, payload=payload)


@router.delete("/{appeal_id}")
def delete_appeal(
    appeal_id: int,
    current_user: User = Depends(get_current_user),
    service: AppealService = Depends(get_appeal_service),
):
    """Soft delete an appeal"""
    return service.delete(appeal_id=appeal_id, current_user=current_user)
