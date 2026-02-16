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

    def create(self, model_instance):
        """Create a new lookup item"""
        self.db.add(model_instance)
        self.db.commit()
        self.db.refresh(model_instance)
        return model_instance

    def update(self, model_instance):
        """Update an existing lookup item"""
        self.db.merge(model_instance)
        self.db.commit()
        # Refresh to get updated values
        self.db.refresh(model_instance)
        return model_instance

    def delete(self, model_class, id: int):
        """Soft delete or hard delete depending on model"""
        item = self.db.get(model_class, id)
        if not item:
            return False
        
        # If model has IsDeleted field, mark it as deleted (soft delete)
        if hasattr(model_class, "IsDeleted"):
            item.IsDeleted = True
            self.db.merge(item)
        else:
            # Otherwise, hard delete
            self.db.delete(item)
        
        self.db.commit()
        return True

    def restore(self, model_class, id: int):
        """Restore a soft-deleted lookup item"""
        if not hasattr(model_class, "IsDeleted"):
            return False
        
        item = self.db.get(model_class, id)
        if not item:
            return False
        
        item.IsDeleted = False
        self.db.merge(item)
        self.db.commit()
        return True
