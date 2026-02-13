from app.schemas.common import ORMBase


class CitizenCreate(ORMBase):
    fin: str | None = None
    first_name: str
    last_name: str
    father_name: str | None = None
    phone: str | None = None
    address: str | None = None


class CitizenUpdate(ORMBase):
    fin: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    father_name: str | None = None
    phone: str | None = None
    address: str | None = None


class CitizenOut(ORMBase):
    id: int
    fin: str | None = None
    first_name: str
    last_name: str
    father_name: str | None = None
    phone: str | None = None
    address: str | None = None
