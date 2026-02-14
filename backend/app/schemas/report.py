from datetime import date
from pydantic import BaseModel
from app.schemas.common import ORMBase

class ReportParams(BaseModel):
    start_date: date | None = None
    end_date: date | None = None
    group_by: str = "department"  # department, region, status, index, insection

class ReportItem(BaseModel):
    id: int | None
    name: str
    count: int

class ReportResponse(BaseModel):
    items: list[ReportItem]
    total: int
    group_by: str
    start_date: date | None
    end_date: date | None
