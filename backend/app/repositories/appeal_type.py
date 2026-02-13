from sqlalchemy.orm import Session

from app.models.appeal_type import AppealType


class AppealTypeRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self) -> list[AppealType]:
        return self.db.query(AppealType).order_by(AppealType.id.asc()).all()

    def get(self, type_id: int) -> AppealType | None:
        return self.db.get(AppealType, type_id)

    def create(self, obj: AppealType) -> AppealType:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: AppealType) -> AppealType:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: AppealType) -> None:
        self.db.delete(obj)
        self.db.commit()
