from datetime import datetime
from app.schemas.common import ORMBase


class AppealCreate(ORMBase):
    num: int | None = None
    reg_num: str | None = None
    reg_date: datetime | None = None
    sec_in_ap_num: str | None = None
    in_ap_num: str | None = None
    sec_in_ap_date: datetime | None = None
    in_ap_date: datetime | None = None
    dep_id: int | None = None
    official_id: int | None = None
    region_id: int | None = None
    person: str | None = None
    email: str | None = None
    content: str | None = None
    content_type_id: int | None = None
    account_index_id: int | None = None
    ap_index_id: int | None = None
    paper_count: str | None = None
    exp_date: datetime | None = None
    who_control_id: int | None = None
    instructions_id: int | None = None
    status: int | None = None
    InSection: int | None = None
    IsExecuted: bool | None = False
    repetition: bool | None = False
    control: bool | None = False
    user_section_id: int | None = None
    PC: str | None = None
    PC_Tarixi: datetime | None = None


class AppealUpdate(ORMBase):
    num: int | None = None
    reg_num: str | None = None
    reg_date: datetime | None = None
    sec_in_ap_num: str | None = None
    in_ap_num: str | None = None
    sec_in_ap_date: datetime | None = None
    in_ap_date: datetime | None = None
    dep_id: int | None = None
    official_id: int | None = None
    region_id: int | None = None
    person: str | None = None
    email: str | None = None
    content: str | None = None
    content_type_id: int | None = None
    account_index_id: int | None = None
    ap_index_id: int | None = None
    paper_count: str | None = None
    exp_date: datetime | None = None
    who_control_id: int | None = None
    instructions_id: int | None = None
    status: int | None = None
    InSection: int | None = None
    IsExecuted: bool | None = None
    repetition: bool | None = None
    control: bool | None = None
    user_section_id: int | None = None
    PC: str | None = None
    PC_Tarixi: datetime | None = None


class AppealOut(ORMBase):
    id: int
    num: int | None = None
    reg_num: str | None = None
    reg_date: datetime | None = None
    sec_in_ap_num: str | None = None
    in_ap_num: str | None = None
    sec_in_ap_date: datetime | None = None
    in_ap_date: datetime | None = None
    dep_id: int | None = None
    official_id: int | None = None
    region_id: int | None = None
    person: str | None = None
    email: str | None = None
    content: str | None = None
    content_type_id: int | None = None
    account_index_id: int | None = None
    ap_index_id: int | None = None
    paper_count: str | None = None
    exp_date: datetime | None = None
    who_control_id: int | None = None
    instructions_id: int | None = None
    status: int | None = None
    InSection: int | None = None
    IsExecuted: bool | None = None
    repetition: bool | None = None
    control: bool | None = None
    user_section_id: int | None = None
    PC: str | None = None
    PC_Tarixi: datetime | None = None
