from sqlalchemy.orm import Session

from app.models.org_unit import OrgUnit


class OrgUnitRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self) -> list[OrgUnit]:
        return self.db.query(OrgUnit).order_by(OrgUnit.id.asc()).all()

    def get(self, org_unit_id: int) -> OrgUnit | None:
        return self.db.get(OrgUnit, org_unit_id)

    def create(self, obj: OrgUnit) -> OrgUnit:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def save(self, obj: OrgUnit) -> OrgUnit:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

