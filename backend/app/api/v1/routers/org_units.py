from fastapi import APIRouter, Depends

from app.api.deps import require_admin, get_org_unit_service
from app.schemas.org_unit import OrgUnitCreate, OrgUnitOut, OrgUnitUpdate
from app.services.org_unit import OrgUnitService

router = APIRouter(prefix="/org-units", tags=["org_units"])


@router.get("", response_model=list[OrgUnitOut])
def list_org_units(service: OrgUnitService = Depends(get_org_unit_service)):
    return service.list()


@router.post("", response_model=OrgUnitOut, dependencies=[Depends(require_admin)])
def create_org_unit(
    payload: OrgUnitCreate,
    service: OrgUnitService = Depends(get_org_unit_service),
):
    return service.create(payload)


@router.get("/{org_unit_id}", response_model=OrgUnitOut)
def get_org_unit(
    org_unit_id: int,
    service: OrgUnitService = Depends(get_org_unit_service),
):
    return service.get(org_unit_id)


@router.patch("/{org_unit_id}", response_model=OrgUnitOut, dependencies=[Depends(require_admin)])
def update_org_unit(
    org_unit_id: int,
    payload: OrgUnitUpdate,
    service: OrgUnitService = Depends(get_org_unit_service),
):
    return service.update(org_unit_id, payload)

