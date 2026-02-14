from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.appeal import Appeal


class AppealRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(
        self,
        dep_id: int | None = None,
        region_id: int | None = None,
        status: int | None = None,
        q: str | None = None,
        user_section_id: int | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Appeal]:
        query = self.db.query(Appeal)
        if dep_id is not None:
            query = query.filter(Appeal.dep_id == dep_id)
        if region_id is not None:
            query = query.filter(Appeal.region_id == region_id)
        if status is not None:
            query = query.filter(Appeal.status == status)
        if user_section_id is not None:
            query = query.filter(Appeal.user_section_id == user_section_id)
        if q:
            like = f"%{q}%"
            query = query.filter(
                or_(
                    Appeal.reg_num.ilike(like),
                    Appeal.person.ilike(like),
                    Appeal.content.ilike(like),
                )
            )
        return query.order_by(Appeal.id.desc()).limit(limit).offset(offset).all()

    def count(
        self,
        dep_id: int | None = None,
        region_id: int | None = None,
        status: int | None = None,
        user_section_id: int | None = None,
        q: str | None = None,
    ) -> int:
        query = self.db.query(Appeal)
        if dep_id is not None:
            query = query.filter(Appeal.dep_id == dep_id)
        if region_id is not None:
            query = query.filter(Appeal.region_id == region_id)
        if status is not None:
            query = query.filter(Appeal.status == status)
        if user_section_id is not None:
            query = query.filter(Appeal.user_section_id == user_section_id)
        if q:
            like = f"%{q}%"
            query = query.filter(
                or_(
                    Appeal.reg_num.ilike(like),
                    Appeal.person.ilike(like),
                    Appeal.content.ilike(like),
                )
            )
        return query.count()

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
