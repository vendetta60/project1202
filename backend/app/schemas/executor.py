"""
Schemas for executor-related endpoints
"""
from datetime import datetime
from app.schemas.common import ORMBase


class ExecutorOut(ORMBase):
    """Executor assignment to appeal"""
    id: int
    appeal_id: int | None = None
    direction_id: int | None = None
    direction_name: str | None = None
    executor_id: int | None = None
    executor_name: str | None = None
    out_num: str | None = None
    out_date: datetime | None = None
    attach_num: str | None = None
    attach_paper_num: str | None = None
    r_prefix: int | None = None
    r_num: str | None = None
    r_date: datetime | None = None
    posted_sec: str | None = None
    active: bool | None = None
    is_primary: bool | None = False  # Əsas icraçı işarəsi
    PC: str | None = None
    PC_Tarixi: datetime | None = None


class ExecutorCreate(ORMBase):
    """Create executor assignment - executorId comes from ExecutorList"""
    appeal_id: int
    executor_id: int  # From ExecutorList.id
    direction_id: int | None = None
    is_primary: bool | None = False
    out_num: str | None = None
    out_date: datetime | None = None
    attach_num: str | None = None
    attach_paper_num: str | None = None
    r_prefix: int | None = None
    r_num: str | None = None
    r_date: datetime | None = None
    posted_sec: str | None = None
    active: bool | None = True
    PC: str | None = None
    PC_Tarixi: datetime | None = None


class ExecutorUpdate(ORMBase):
    """Update executor assignment"""
    out_num: str | None = None
    out_date: datetime | None = None
    attach_num: str | None = None
    attach_paper_num: str | None = None
    r_prefix: int | None = None
    r_num: str | None = None
    r_date: datetime | None = None
    posted_sec: str | None = None
    active: bool | None = None
    is_primary: bool | None = None
    PC: str | None = None
    PC_Tarixi: datetime | None = None
