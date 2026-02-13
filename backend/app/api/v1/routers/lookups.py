from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.repositories.lookup import ReportIndexRepository, AppealIndexRepository
from app.schemas.lookup import (
    ReportIndexCreate, ReportIndexUpdate, ReportIndexOut,
    AppealIndexCreate, AppealIndexUpdate, AppealIndexOut,
)
from app.models.user import User
from app.models.lookup import ReportIndex, AppealIndex

router = APIRouter(prefix="/lookups", tags=["lookups"])


# ─── Report Indexes ────────────────────────────────────────────────────
@router.get("/report_indexes", response_model=list[ReportIndexOut])
def list_report_indexes(db: Session = Depends(get_db)):
    return ReportIndexRepository(db).list()


@router.post("/report_indexes", response_model=ReportIndexOut)
def create_report_index(
    payload: ReportIndexCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    repo = ReportIndexRepository(db)
    existing = db.query(ReportIndex).filter(ReportIndex.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Bu hesabat indeksi artıq mövcuddur")
    return repo.create(ReportIndex(name=payload.name))


@router.put("/report_indexes/{idx_id}", response_model=ReportIndexOut)
def update_report_index(
    idx_id: int,
    payload: ReportIndexUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    repo = ReportIndexRepository(db)
    obj = repo.get(idx_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Hesabat indeksi tapılmadı")
    dup = db.query(ReportIndex).filter(ReportIndex.name == payload.name, ReportIndex.id != idx_id).first()
    if dup:
        raise HTTPException(status_code=409, detail="Bu adda hesabat indeksi artıq mövcuddur")
    obj.name = payload.name
    return repo.update(obj)


@router.delete("/report_indexes/{idx_id}", status_code=204)
def delete_report_index(
    idx_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    repo = ReportIndexRepository(db)
    obj = repo.get(idx_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Hesabat indeksi tapılmadı")
    repo.delete(obj)


# ─── Appeal Indexes ─────────────────────────────────────────────────────
@router.get("/appeal_indexes", response_model=list[AppealIndexOut])
def list_appeal_indexes(db: Session = Depends(get_db)):
    return AppealIndexRepository(db).list()


@router.post("/appeal_indexes", response_model=AppealIndexOut)
def create_appeal_index(
    payload: AppealIndexCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    repo = AppealIndexRepository(db)
    existing = db.query(AppealIndex).filter(AppealIndex.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Bu müraciət indeksi artıq mövcuddur")
    return repo.create(AppealIndex(name=payload.name))


@router.put("/appeal_indexes/{idx_id}", response_model=AppealIndexOut)
def update_appeal_index(
    idx_id: int,
    payload: AppealIndexUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    repo = AppealIndexRepository(db)
    obj = repo.get(idx_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Müraciət indeksi tapılmadı")
    dup = db.query(AppealIndex).filter(AppealIndex.name == payload.name, AppealIndex.id != idx_id).first()
    if dup:
        raise HTTPException(status_code=409, detail="Bu adda müraciət indeksi artıq mövcuddur")
    obj.name = payload.name
    return repo.update(obj)


@router.delete("/appeal_indexes/{idx_id}", status_code=204)
def delete_appeal_index(
    idx_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    repo = AppealIndexRepository(db)
    obj = repo.get(idx_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Müraciət indeksi tapılmadı")
    repo.delete(obj)
