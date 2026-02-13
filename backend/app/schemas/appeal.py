from datetime import datetime

from app.models.appeal import AppealStatus
from app.schemas.common import ORMBase, Timestamped


class AppealCreate(ORMBase):
    subject: str
    description: str | None = None
    summary: str | None = None
    appeal_type: str | None = None
    # Vətəndaş birbaşa formdan daxil edilir
    citizen_first_name: str
    citizen_last_name: str
    citizen_father_name: str | None = None
    citizen_email: str | None = None
    org_unit_id: int
    received_at: datetime | None = None
    execution_date: datetime | None = None
    report_index: str | None = None
    appeal_index: str | None = None
    page_count: int | None = None
    chairman_decision_number: str | None = None
    chairman_decision_date: datetime | None = None
    incoming_appeal_number: str | None = None
    incoming_appeal_date: datetime | None = None
    related_appeal_number: str | None = None
    related_appeal_date: datetime | None = None
    appeal_submitter_role: str | None = None
    is_transferred: bool = False
    executor_org_unit_id: int | None = None
    executor_id: int | None = None
    registration_number: str
    registration_date: datetime
    execution_deadline: datetime | None = None
    originating_military_unit: str | None = None
    leader_decision: str | None = None
    other_military_unit_number: str | None = None
    other_institution_date: datetime | None = None
    incoming_appeal_number: str | None = None
    incoming_appeal_date: datetime | None = None
    originating_institution: str | None = None
    appeal_submitter: str | None = None
    submitter_full_name: str | None = None
    submitter_saa: str | None = None
    address: str | None = None
    appeal_review_status: str | None = None
    email: str | None = None
    phone_number: str | None = None
    is_repeat_appeal: bool = False
    reviewed_by: str | None = None
    is_under_supervision: bool = False
    short_content: str | None = None


class AppealUpdate(ORMBase):
    subject: str | None = None
    description: str | None = None
    summary: str | None = None
    appeal_type: str | None = None
    status: AppealStatus | None = None
    org_unit_id: int | None = None
    executor_org_unit_id: int | None = None
    executor_id: int | None = None
    received_at: datetime | None = None
    execution_date: datetime | None = None
    report_index: str | None = None
    appeal_index: str | None = None
    page_count: int | None = None
    chairman_decision_number: str | None = None
    chairman_decision_date: datetime | None = None
    incoming_appeal_number: str | None = None
    incoming_appeal_date: datetime | None = None
    related_appeal_number: str | None = None
    related_appeal_date: datetime | None = None
    appeal_submitter_role: str | None = None
    citizen_email: str | None = None
    is_transferred: bool | None = None
    registration_number: str | None = None
    registration_date: datetime | None = None
    execution_deadline: datetime | None = None
    originating_military_unit: str | None = None
    leader_decision: str | None = None
    other_military_unit_number: str | None = None
    other_institution_date: datetime | None = None
    incoming_appeal_number: str | None = None
    incoming_appeal_date: datetime | None = None
    originating_institution: str | None = None
    appeal_submitter: str | None = None
    submitter_full_name: str | None = None
    submitter_saa: str | None = None
    address: str | None = None
    appeal_review_status: str | None = None
    email: str | None = None
    phone_number: str | None = None
    is_repeat_appeal: bool | None = None
    reviewed_by: str | None = None
    is_under_supervision: bool | None = None
    short_content: str | None = None


class AppealOut(Timestamped):
    id: int
    reg_no: str
    subject: str
    description: str | None = None
    summary: str | None = None
    appeal_type: str | None = None
    status: AppealStatus
    citizen_id: int
    org_unit_id: int
    executor_org_unit_id: int | None = None
    executor_id: int | None = None
    created_by_user_id: int | None = None
    received_at: datetime
    execution_date: datetime | None = None
    report_index: str | None = None
    appeal_index: str | None = None
    page_count: int | None = None
    chairman_decision_number: str | None = None
    chairman_decision_date: datetime | None = None
    incoming_appeal_number: str | None = None
    incoming_appeal_date: datetime | None = None
    related_appeal_number: str | None = None
    related_appeal_date: datetime | None = None
    appeal_submitter_role: str | None = None
    citizen_email: str | None = None
    is_transferred: bool = False
    # Include related objects if loaded
    citizen: "CitizenOut | None" = None
    org_unit: "OrgUnitOut | None" = None
    executor_org_unit: "OrgUnitOut | None" = None
    executor: "ExecutorOut | None" = None
    submitter_full_name: str | None = None
    submitter_saa: str | None = None

# Forward reference fix
from app.schemas.citizen import CitizenOut
from app.schemas.org_unit import OrgUnitOut
from app.schemas.executor import ExecutorOut

AppealOut.model_rebuild()
