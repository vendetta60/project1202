from sqlalchemy.orm import Session

from app.models.military_unit import MilitaryUnit


class MilitaryUnitRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self) -> list[MilitaryUnit]:
        return self.db.query(MilitaryUnit).order_by(MilitaryUnit.id.asc()).all()

    def get(self, unit_id: int) -> MilitaryUnit | None:
        return self.db.get(MilitaryUnit, unit_id)

    def create(self, obj: MilitaryUnit) -> MilitaryUnit:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: MilitaryUnit) -> MilitaryUnit:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: MilitaryUnit) -> None:
        self.db.delete(obj)
        self.db.commit()
