"""
Generic lookup repository for all reference data tables
"""
from sqlalchemy.orm import Session


class LookupRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self, model_class, active_only: bool = True):
        query = self.db.query(model_class)
        if active_only and hasattr(model_class, "IsDeleted"):
            query = query.filter(
                (model_class.IsDeleted == False) | (model_class.IsDeleted == None)
            )
        return query.order_by(model_class.id).all()

    def get(self, model_class, id: int):
        return self.db.get(model_class, id)

    def get_by_field(self, model_class, field_name: str, value):
        return self.db.query(model_class).filter(
            getattr(model_class, field_name) == value
        ).all()
