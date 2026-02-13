from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_appeal_service, require_org_unit
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
    current_user: User = Depends(require_org_unit),
    org_unit_id: int | None = None,
    citizen_id: int | None = None,
    reg_no: str | None = None,
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
    service: AppealService = Depends(get_appeal_service),
):
    items = service.list(
        current_user=current_user,
        org_unit_id=org_unit_id,
        citizen_id=citizen_id,
        reg_no=reg_no,
        q=q,
        limit=limit,
        offset=offset,
    )
    # For now, total is same as items count (simple pagination)
    # In future, add count query for accurate total
    return AppealsListResponse(items=items, total=len(items), limit=limit, offset=offset)


@router.get("/{appeal_id}", response_model=AppealOut)
def get_appeal(
    appeal_id: int,
    current_user: User = Depends(require_org_unit),
    service: AppealService = Depends(get_appeal_service),
):
    return service.get(appeal_id=appeal_id, current_user=current_user)


@router.post("", response_model=AppealOut)
def create_appeal(
    payload: AppealCreate,
    current_user: User = Depends(require_org_unit),
    service: AppealService = Depends(get_appeal_service),
):
    # Ensure all required fields are passed
    return service.create(current_user=current_user, payload=payload)


@router.patch("/{appeal_id}", response_model=AppealOut)
def update_appeal(
    appeal_id: int,
    payload: AppealUpdate,
    current_user: User = Depends(require_org_unit),
    service: AppealService = Depends(get_appeal_service),
):
    # Ensure updates are applied correctly
    return service.update(current_user=current_user, appeal_id=appeal_id, payload=payload)


