from app.schemas.common import ORMBase


class ReportIndexCreate(ORMBase):
    name: str

class ReportIndexUpdate(ORMBase):
    name: str

class ReportIndexOut(ORMBase):
    id: int
    name: str


class AppealIndexCreate(ORMBase):
    name: str

class AppealIndexUpdate(ORMBase):
    name: str

class AppealIndexOut(ORMBase):
    id: int
    name: str
