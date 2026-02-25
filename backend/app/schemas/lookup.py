from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import ORMBase


# --- AccountIndex ---
class AccountIndexOut(ORMBase):
    id: int
    account_index: str | None = None
    IsDeleted: bool | None = None
    account_order: int | None = None


# --- ApIndex ---
class ApIndexOut(ORMBase):
    id: int
    ap_index_id: int
    ap_index: str | None = None
    IsDeleted: bool | None = None


# --- ApStatus ---
class ApStatusOut(ORMBase):
    id: int
    status: str | None = None
    IsDeleted: bool | None = None


# --- ContentType ---
class ContentTypeOut(ORMBase):
    id: int
    content_type: str | None = None
    IsDeleted: bool | None = None


# --- ExecutorAssignment ---
class ExecutorAssignment(BaseModel):
    id: int | None = None
    executor: str | None = None
    executor_name: str | None = None
    executor_id: int | None = None
    direction_id: int | None = None
    direction_name: str | None = None  # Added for display
    is_primary: bool = False
    active: bool = True
    start_date: datetime | None = None
    end_date: datetime | None = None
    r_num: str | None = None
    r_date: datetime | None = None
    out_num: str | None = None
    out_date: datetime | None = None
    attach_num: str | None = None          # Tikdiyi isin nomresi
    attach_paper_num: str | None = None    # Isdeki vereq nomresi
    posted_sec: str | None = None          # Hara (kime) gonderilib


# --- ChiefInstruction ---
class ChiefInstructionOut(ORMBase):
    id: int
    instructions: str | None = None
    IsDeleted: bool | None = None
    section_id: int | None = None


# --- InSection ---
class InSectionOut(ORMBase):
    id: int
    section: str | None = None
    IsDeleted: bool | None = None


# --- Section ---
class SectionOut(ORMBase):
    id: int
    section: str | None = None
    IsDeleted: bool | None = None


# --- UserSection ---
class UserSectionOut(ORMBase):
    id: int
    user_section: str | None = None
    section_index: int | None = None


# --- WhoControl ---
class WhoControlOut(ORMBase):
    id: int
    chief: str | None = None
    IsDeleted: bool | None = None
    section_id: int | None = None


# --- Department ---
class DepartmentOut(ORMBase):
    id: int
    department: str | None = None
    sign: str | None = None
    IsDeleted: bool | None = None


# --- DepOfficial ---
class DepOfficialOut(ORMBase):
    id: int
    dep_id: int | None = None
    official: str | None = None
    IsDeleted: bool | None = None


# --- Region ---
class RegionOut(ORMBase):
    id: int
    region: str | None = None
    IsDeleted: bool | None = None


# --- Organ ---
class OrganOut(ORMBase):
    id: int
    Orqan: str | None = None
    Nov: int | None = None
    isDeleted: bool | None = None


# --- Direction ---
class DirectionOut(ORMBase):
    id: int
    direction: str | None = None
    IsDeleted: bool | None = None
    section_id: int | None = None


# --- ExecutorList ---
class ExecutorListOut(ORMBase):
    id: int
    direction_id: int | None = None
    executor: str | None = None
    IsDeleted: bool | None = None


class ExecutorListCreate(ORMBase):
    direction_id: int
    executor: str


class ExecutorListUpdate(ORMBase):
    executor: str | None = None
    direction_id: int | None = None


# --- Movzu ---
class MovzuOut(ORMBase):
    id: int
    Movzu: str | None = None


# --- Holiday ---
class HolidayOut(ORMBase):
    id: int
    name: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    IsDeleted: bool | None = None


class HolidayCreate(ORMBase):
    name: str
    start_date: datetime
    end_date: datetime


class HolidayUpdate(ORMBase):
    name: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None


# ============ CREATE/UPDATE SCHEMAS ============

class DepartmentCreate(ORMBase):
    department: str
    sign: str | None = None


class DepartmentUpdate(ORMBase):
    department: str | None = None
    sign: str | None = None


class RegionCreate(ORMBase):
    region: str


class RegionUpdate(ORMBase):
    region: str | None = None


class DepOfficialCreate(ORMBase):
    dep_id: int
    official: str


class DepOfficialUpdate(ORMBase):
    official: str | None = None
    dep_id: int | None = None


class ChiefInstructionCreate(ORMBase):
    instructions: str
    section_id: int | None = None


class ChiefInstructionUpdate(ORMBase):
    instructions: str | None = None
    section_id: int | None = None


class InSectionCreate(ORMBase):
    section: str


class InSectionUpdate(ORMBase):
    section: str | None = None


class WhoControlCreate(ORMBase):
    chief: str
    section_id: int | None = None


class WhoControlUpdate(ORMBase):
    chief: str | None = None
    section_id: int | None = None


class ApStatusCreate(ORMBase):
    status: str


class ApStatusUpdate(ORMBase):
    status: str | None = None


class ApIndexCreate(ORMBase):
    ap_index_id: int
    ap_index: str


class ApIndexUpdate(ORMBase):
    ap_index_id: int | None = None
    ap_index: str | None = None


class ContentTypeCreate(ORMBase):
    content_type: str


class ContentTypeUpdate(ORMBase):
    content_type: str | None = None


class AccountIndexCreate(ORMBase):
    account_index: str
    account_order: int | None = None


class AccountIndexUpdate(ORMBase):
    account_index: str | None = None
    account_order: int | None = None


class UserSectionCreate(ORMBase):
    user_section: str
    section_index: int | None = None


class UserSectionUpdate(ORMBase):
    user_section: str | None = None
    section_index: int | None = None
