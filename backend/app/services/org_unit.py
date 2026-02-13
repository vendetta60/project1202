from fastapi import HTTPException

from app.models.org_unit import OrgUnit
from app.repositories.org_unit import OrgUnitRepository
from app.schemas.org_unit import OrgUnitCreate, OrgUnitUpdate


class OrgUnitService:
    def __init__(self, repo: OrgUnitRepository):
        self.repo = repo

    def list(self) -> list[OrgUnit]:
        return self.repo.list()

    def get(self, org_unit_id: int) -> OrgUnit:
        obj = self.repo.get(org_unit_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Org unit not found")
        return obj

    def create(self, payload: OrgUnitCreate) -> OrgUnit:
        obj = OrgUnit(name=payload.name, parent_id=payload.parent_id)
        return self.repo.create(obj)

    def update(self, org_unit_id: int, payload: OrgUnitUpdate) -> OrgUnit:
        obj = self.get(org_unit_id)
        if payload.name is not None:
            obj.name = payload.name
        if payload.parent_id is not None:
            obj.parent_id = payload.parent_id
        return self.repo.save(obj)

