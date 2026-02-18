from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_

from app.api import deps
from app.models.citizen import Citizen
from app.schemas.citizen import CitizenSchema, CitizenCreate, CitizenUpdate, CitizenListResponse
from app.models.user import User

router = APIRouter(prefix="/citizens", tags=["citizens"])


@router.get("/", response_model=CitizenListResponse)
def list_citizens(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    limit: int = 100,
    offset: int = 0,
    q: str | None = Query(None, description="Search by first_name, last_name, or fin")
):
    query = select(Citizen).where(Citizen.is_deleted == False)
    
    if q:
        search_filter = or_(
            Citizen.first_name.ilike(f"%{q}%"),
            Citizen.last_name.ilike(f"%{q}%"),
            Citizen.fin.ilike(f"%{q}%")
        )
        query = query.where(search_filter)
    
    # Get total count
    total_query = select(func.count()).select_from(query.subquery())
    total = db.execute(total_query).scalar_one()
    
    # Get items
    items_query = query.order_by(Citizen.last_name).offset(offset).limit(limit)
    items = db.execute(items_query).scalars().all()
    
    return {"items": items, "total": total}


@router.get("/{id}", response_model=CitizenSchema)
def get_citizen(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    citizen = db.get(Citizen, id)
    if not citizen or citizen.is_deleted:
        raise HTTPException(status_code=404, detail="Citizen not found")
    return citizen


@router.post("/", response_model=CitizenSchema)
def create_citizen(
    obj_in: CitizenCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # Check if FIN already exists
    existing = db.execute(select(Citizen).where(Citizen.fin == obj_in.fin, Citizen.is_deleted == False)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Citizen with this FIN already exists")
    
    db_obj = Citizen(
        **obj_in.model_dump(),
        created_by=current_user.id,
        created_by_name=f"{current_user.surname} {current_user.name}" if current_user.surname else current_user.username
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.patch("/{id}", response_model=CitizenSchema)
def update_citizen(
    id: int,
    obj_in: CitizenUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    db_obj = db.get(Citizen, id)
    if not db_obj or db_obj.is_deleted:
        raise HTTPException(status_code=404, detail="Citizen not found")
    
    update_data = obj_in.model_dump(exclude_unset=True)
    
    # Check if FIN is being updated and already exists
    if "fin" in update_data and update_data["fin"] != db_obj.fin:
        existing = db.execute(select(Citizen).where(Citizen.fin == update_data["fin"], Citizen.is_deleted == False)).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="Citizen with this FIN already exists")
            
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    
    db_obj.updated_by = current_user.id
    db_obj.updated_by_name = f"{current_user.surname} {current_user.name}" if current_user.surname else current_user.username
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.delete("/{id}")
def delete_citizen(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    db_obj = db.get(Citizen, id)
    if not db_obj or db_obj.is_deleted:
        raise HTTPException(status_code=404, detail="Citizen not found")
    
    db_obj.is_deleted = True
    db_obj.updated_by = current_user.id
    db_obj.updated_by_name = f"{current_user.surname} {current_user.name}" if current_user.surname else current_user.username
    
    db.add(db_obj)
    db.commit()
    return {"status": "success"}
