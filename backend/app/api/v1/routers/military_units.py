from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, require_admin
from app.repositories.military_unit import MilitaryUnitRepository
from app.schemas.military_unit import MilitaryUnitCreate, MilitaryUnitUpdate, MilitaryUnitOut
from app.models.user import User
from app.models.military_unit import MilitaryUnit

router = APIRouter(prefix="/military_units", tags=["military_units"])


@router.get("", response_model=list[MilitaryUnitOut])
def list_military_units(db: Session = Depends(get_db)):
    repo = MilitaryUnitRepository(db)
    return repo.list()


@router.post("", response_model=MilitaryUnitOut)
def create_military_unit(
    payload: MilitaryUnitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Any authenticated user (admin or operator) can add a military unit."""
    repo = MilitaryUnitRepository(db)
    existing = db.query(MilitaryUnit).filter(MilitaryUnit.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Bu hərbi hissə artıq mövcuddur")
    obj = MilitaryUnit(name=payload.name)
    return repo.create(obj)


@router.put("/{unit_id}", response_model=MilitaryUnitOut)
def update_military_unit(
    unit_id: int,
    payload: MilitaryUnitUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    repo = MilitaryUnitRepository(db)
    obj = repo.get(unit_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Hərbi hissə tapılmadı")
    # Check duplicate name
    dup = db.query(MilitaryUnit).filter(MilitaryUnit.name == payload.name, MilitaryUnit.id != unit_id).first()
    if dup:
        raise HTTPException(status_code=409, detail="Bu adda hərbi hissə artıq mövcuddur")
    obj.name = payload.name
    return repo.update(obj)


@router.delete("/{unit_id}", status_code=204)
def delete_military_unit(
    unit_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    repo = MilitaryUnitRepository(db)
    obj = repo.get(unit_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Hərbi hissə tapılmadı")
    repo.delete(obj)
