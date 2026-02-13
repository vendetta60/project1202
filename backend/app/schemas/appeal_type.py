from app.schemas.common import ORMBase


class AppealTypeCreate(ORMBase):
    name: str


class AppealTypeUpdate(ORMBase):
    name: str


class AppealTypeOut(ORMBase):
    id: int
    name: str
