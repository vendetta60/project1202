from datetime import datetime
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
        include_deleted: bool = False,
    ) -> list[Appeal]:
        query = self.db.query(Appeal)
        
        # Filter out deleted records unless explicitly requested
        if not include_deleted:
            query = query.filter(Appeal.is_deleted == False)
            
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
        include_deleted: bool = False,
    ) -> int:
        query = self.db.query(Appeal)
        
        # Filter out deleted records unless explicitly requested
        if not include_deleted:
            query = query.filter(Appeal.is_deleted == False)
            
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

    def get(self, appeal_id: int, include_deleted: bool = False) -> Appeal | None:
        query = self.db.query(Appeal).filter(Appeal.id == appeal_id)
        if not include_deleted:
            query = query.filter(Appeal.is_deleted == False)
        return query.first()

    def create(
        self,
        obj: Appeal,
        user_id: int | None = None,
        user_name: str | None = None,
    ) -> Appeal:
        """Create a new appeal with user tracking"""
        obj.created_by = user_id
        obj.created_by_name = user_name
        obj.created_at = datetime.utcnow()
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def save(self, obj: Appeal) -> Appeal:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(
        self,
        obj: Appeal,
        updates: dict,
        user_id: int | None = None,
        user_name: str | None = None,
    ) -> Appeal:
        """Update an appeal with user tracking"""
        for key, value in updates.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        
        obj.updated_by = user_id
        obj.updated_by_name = user_name
        obj.updated_at = datetime.utcnow()
        
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(
        self,
        obj: Appeal,
        user_id: int | None = None,
        user_name: str | None = None,
    ) -> Appeal:
        """Soft delete an appeal"""
        obj.is_deleted = True
        obj.updated_by = user_id
        obj.updated_by_name = user_name
        obj.updated_at = datetime.utcnow()
        
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def restore(
        self,
        obj: Appeal,
        user_id: int | None = None,
        user_name: str | None = None,
    ) -> Appeal:
        """Restore a soft-deleted appeal"""
        obj.is_deleted = False
        obj.updated_by = user_id
        obj.updated_by_name = user_name
        obj.updated_at = datetime.utcnow()
        
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

