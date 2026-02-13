from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_user, get_citizen_service
from app.schemas.citizen import CitizenCreate, CitizenOut, CitizenUpdate
from app.services.citizen import CitizenService

router = APIRouter(prefix="/citizens", tags=["citizens"])


class CitizensListResponse(BaseModel):
    items: list[CitizenOut]
    total: int
    limit: int
    offset: int


@router.get("", response_model=CitizensListResponse, dependencies=[Depends(get_current_user)])
def list_citizens(
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
    service: CitizenService = Depends(get_citizen_service),
):
    items = service.list(q=q, limit=limit, offset=offset)
    # For now, total is same as items count (simple pagination)
    return CitizensListResponse(items=items, total=len(items), limit=limit, offset=offset)


@router.get("/{citizen_id}", response_model=CitizenOut, dependencies=[Depends(get_current_user)])
def get_citizen(
    citizen_id: int,
    service: CitizenService = Depends(get_citizen_service),
):
    return service.get(citizen_id)


@router.post("", response_model=CitizenOut, dependencies=[Depends(get_current_user)])
def create_citizen(
    payload: CitizenCreate,
    service: CitizenService = Depends(get_citizen_service),
):
    return service.create(payload)


@router.patch("/{citizen_id}", response_model=CitizenOut, dependencies=[Depends(get_current_user)])
def update_citizen(
    citizen_id: int,
    payload: CitizenUpdate,
    service: CitizenService = Depends(get_citizen_service),
):
    return service.update(citizen_id, payload)


