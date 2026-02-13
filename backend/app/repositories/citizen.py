from sqlalchemy.orm import Session

from app.models.citizen import Citizen


class CitizenRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, q: str | None, limit: int, offset: int) -> list[Citizen]:
        query = self.db.query(Citizen)
        if q:
            like = f"%{q}%"
            query = query.filter((Citizen.first_name.like(like)) | (Citizen.last_name.like(like)))
        return query.order_by(Citizen.id.desc()).limit(limit).offset(offset).all()

    def get(self, citizen_id: int) -> Citizen | None:
        return self.db.get(Citizen, citizen_id)

    def get_by_fin(self, fin: str) -> Citizen | None:
        return self.db.query(Citizen).filter(Citizen.fin == fin).first()

    def create(self, obj: Citizen) -> Citizen:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def save(self, obj: Citizen) -> Citizen:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

