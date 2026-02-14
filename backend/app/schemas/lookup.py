"""
Schemas for all lookup/reference tables
"""
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


# --- Movzu ---
class MovzuOut(ORMBase):
    id: int
    Movzu: str | None = None
