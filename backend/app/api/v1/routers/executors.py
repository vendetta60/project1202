from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, get_executor_service
from app.schemas.executor import ExecutorCreate, ExecutorOut
from app.services.executor import ExecutorService

router = APIRouter(prefix="/executors", tags=["executors"])


@router.get("", response_model=list[ExecutorOut], dependencies=[Depends(get_current_user)])
def list_executors(
    org_unit_id: int,
    service: ExecutorService = Depends(get_executor_service),
):
    """
    List executors for a given org unit (şöbə).
    """
    return service.list_by_org_unit(org_unit_id=org_unit_id)


@router.post("", response_model=ExecutorOut, dependencies=[Depends(get_current_user)])
def create_executor(
    payload: ExecutorCreate,
    service: ExecutorService = Depends(get_executor_service),
):
    """
    Create a new executor under a specific org unit.
    """
    return service.create(full_name=payload.full_name, org_unit_id=payload.org_unit_id)


