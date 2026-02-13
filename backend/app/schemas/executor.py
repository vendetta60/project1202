from app.schemas.common import ORMBase


class ExecutorCreate(ORMBase):
    full_name: str
    org_unit_id: int


class ExecutorOut(ORMBase):
    id: int
    full_name: str
    org_unit_id: int


