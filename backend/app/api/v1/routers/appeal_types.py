from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, require_admin
from app.repositories.appeal_type import AppealTypeRepository
from app.schemas.appeal_type import AppealTypeCreate, AppealTypeUpdate, AppealTypeOut
from app.models.user import User
from app.models.appeal_type import AppealType

router = APIRouter(prefix="/appeal_types", tags=["appeal_types"])


@router.get("", response_model=list[AppealTypeOut])
def list_appeal_types(db: Session = Depends(get_db)):
    repo = AppealTypeRepository(db)
    return repo.list()


@router.post("", response_model=AppealTypeOut)
def create_appeal_type(
    payload: AppealTypeCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    repo = AppealTypeRepository(db)
    existing = db.query(AppealType).filter(AppealType.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Bu müraciət növü artıq mövcuddur")
    obj = AppealType(name=payload.name)
    return repo.create(obj)


@router.put("/{type_id}", response_model=AppealTypeOut)
def update_appeal_type(
    type_id: int,
    payload: AppealTypeUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    repo = AppealTypeRepository(db)
    obj = repo.get(type_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Müraciət növü tapılmadı")
    dup = db.query(AppealType).filter(AppealType.name == payload.name, AppealType.id != type_id).first()
    if dup:
        raise HTTPException(status_code=409, detail="Bu adda müraciət növü artıq mövcuddur")
    obj.name = payload.name
    return repo.update(obj)


@router.delete("/{type_id}", status_code=204)
def delete_appeal_type(
    type_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    repo = AppealTypeRepository(db)
    obj = repo.get(type_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Müraciət növü tapılmadı")
    repo.delete(obj)
