from app.schemas.common import ORMBase


class MilitaryUnitCreate(ORMBase):
    name: str


class MilitaryUnitUpdate(ORMBase):
    name: str


class MilitaryUnitOut(ORMBase):
    id: int
    name: str
