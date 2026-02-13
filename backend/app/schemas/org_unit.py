from app.schemas.common import ORMBase


class OrgUnitCreate(ORMBase):
    name: str
    parent_id: int | None = None


class OrgUnitUpdate(ORMBase):
    name: str | None = None
    parent_id: int | None = None


class OrgUnitOut(ORMBase):
    id: int
    name: str
    parent_id: int | None = None
