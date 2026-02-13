from sqlalchemy.orm import Session

from app.models.appeal import Appeal


class AppealRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(
        self,
        org_unit_id: int | None,
        citizen_id: int | None,
        reg_no: str | None,
        limit: int,
        offset: int,
        q: str | None = None,
    ) -> list[Appeal]:
        query = self.db.query(Appeal)
        if org_unit_id is not None:
            query = query.filter(Appeal.org_unit_id == org_unit_id)
        if citizen_id is not None:
            query = query.filter(Appeal.citizen_id == citizen_id)
        if reg_no is not None:
            query = query.filter(Appeal.reg_no == reg_no)
        if q:
            like = f"%{q}%"
            query = query.filter(
                (Appeal.reg_no.ilike(like)) | (Appeal.subject.ilike(like))
            )
        return query.order_by(Appeal.id.desc()).limit(limit).offset(offset).all()

    def get(self, appeal_id: int) -> Appeal | None:
        return self.db.get(Appeal, appeal_id)

    def create(self, obj: Appeal) -> Appeal:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def save(self, obj: Appeal) -> Appeal:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: Appeal, updates: dict) -> Appeal:
        for key, value in updates.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

