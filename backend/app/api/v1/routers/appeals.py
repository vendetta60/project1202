from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.deps import get_appeal_service, get_current_user
from app.models.user import User
from app.schemas.appeal import AppealCreate, AppealOut, AppealUpdate
from app.schemas.executor import ExecutorOut, ExecutorCreate, ExecutorUpdate
from app.services.appeal import AppealService
from app.models.executor import Executor
from app.repositories.executor import ExecutorRepository
from app.db.session import get_db
from sqlalchemy.orm import Session

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


# ===== Executor Management for Appeals =====

def get_executor_repo(db: Session = Depends(get_db)) -> ExecutorRepository:
    return ExecutorRepository(db)


@router.get("/{appeal_id}/executors", response_model=list[ExecutorOut])
def get_appeal_executors(
    appeal_id: int,
    current_user: User = Depends(get_current_user),
    repo: ExecutorRepository = Depends(get_executor_repo),
):
    """Get all executors assigned to an appeal"""
    return repo.list_by_appeal(appeal_id)


@router.post("/{appeal_id}/executors", response_model=ExecutorOut)
def add_appeal_executor(
    appeal_id: int,
    payload: ExecutorCreate,
    current_user: User = Depends(get_current_user),
    repo: ExecutorRepository = Depends(get_executor_repo),
):
    """Add an executor to an appeal"""
    # Əgər bu executor əsas icraçı kimi işarələnirsə, digər əsas icraçıları sil
    if payload.is_primary:
        db = repo.db
        db.query(Executor).filter(
            Executor.appeal_id == appeal_id,
            Executor.is_primary == True
        ).update({Executor.is_primary: False})
        db.commit()
    
    executor = Executor(
        appeal_id=appeal_id,
        executor_id=payload.executor_id,
        direction_id=payload.direction_id,
        is_primary=payload.is_primary,
        out_num=payload.out_num,
        out_date=payload.out_date,
        attach_num=payload.attach_num,
        attach_paper_num=payload.attach_paper_num,
        r_prefix=payload.r_prefix,
        r_num=payload.r_num,
        r_date=payload.r_date,
        posted_sec=payload.posted_sec,
        active=payload.active,
        PC=payload.PC,
        PC_Tarixi=payload.PC_Tarixi,
    )
    saved_executor = repo.create(executor)
    
    # Refresh to get names from Repo join logic (Wait, repo.create won't join automatically)
    # We should return the result of list_by_appeal for this specific one if we want names
    # But for now, returning the created object is standard, and the frontend refetches.
    return saved_executor


@router.delete("/{appeal_id}/executors/{executor_id}")
def remove_appeal_executor(
    appeal_id: int,
    executor_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove an executor from an appeal"""
    executor = db.query(Executor).filter(
        Executor.id == executor_id,
        Executor.appeal_id == appeal_id
    ).first()
    
    if not executor:
        raise HTTPException(status_code=404, detail="Executor assignment not found")
    
    db.delete(executor)
    db.commit()
    return {"success": True}


@router.put("/{appeal_id}/executors/{executor_id}", response_model=ExecutorOut)
def update_appeal_executor(
    appeal_id: int,
    executor_id: int,
    payload: ExecutorUpdate,
    current_user: User = Depends(get_current_user),
    repo: ExecutorRepository = Depends(get_executor_repo),
):
    """Update executor assignment details (out_num, out_date, etc.)"""
    executor = repo.db.query(Executor).filter(
        Executor.id == executor_id,
        Executor.appeal_id == appeal_id
    ).first()
    
    if not executor:
        raise HTTPException(status_code=404, detail="Executor assignment not found")
    
    # Əsas icraçı dəyişən zaman digər əsas icraçıları sil
    if payload.is_primary is True:
        repo.db.query(Executor).filter(
            Executor.appeal_id == appeal_id,
            Executor.id != executor_id,
            Executor.is_primary == True
        ).update({Executor.is_primary: False})
    
    # Update fields
    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(executor, field):
            setattr(executor, field, value)
    
    repo.db.commit()
    repo.db.refresh(executor)
    return ExecutorOut.from_orm(executor)
