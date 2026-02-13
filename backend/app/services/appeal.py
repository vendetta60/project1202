from datetime import datetime
import secrets

from fastapi import HTTPException

from app.models.appeal import Appeal
from app.models.user import User
from app.repositories.appeal import AppealRepository
from app.repositories.citizen import CitizenRepository
from app.repositories.org_unit import OrgUnitRepository
from app.schemas.appeal import AppealCreate, AppealUpdate


class AppealService:
    def __init__(
        self,
        appeals: AppealRepository,
        citizens: CitizenRepository,
        org_units: OrgUnitRepository,
    ):
        self.appeals = appeals
        self.citizens = citizens
        self.org_units = org_units

    def _generate_reg_no(self) -> str:
        return f"A{datetime.utcnow():%Y%m%d%H%M%S}-{secrets.token_hex(3)}"

    def list(
        self,
        current_user: User,
        org_unit_id: int | None,
        citizen_id: int | None,
        reg_no: str | None,
        limit: int,
        offset: int,
        q: str | None = None,
    ) -> list[Appeal]:
        if not current_user.is_admin:
            org_unit_id = current_user.org_unit_id
        return self.appeals.list(
            org_unit_id=org_unit_id,
            citizen_id=citizen_id,
            reg_no=reg_no,
            limit=min(limit, 200),
            offset=offset,
            q=q,
        )

    def create(self, current_user: User, payload: AppealCreate) -> Appeal:
        if not current_user.is_admin and payload.org_unit_id != current_user.org_unit_id:
            raise HTTPException(status_code=403, detail="Cannot create appeal for another org unit")

        if not self.org_units.get(payload.org_unit_id):
            raise HTTPException(status_code=400, detail="Invalid org_unit_id")

        # Vətəndaş birbaşa formdan daxil edilir – yeni Citizen yaradılır
        from app.models.citizen import Citizen

        citizen = Citizen(
            first_name=payload.citizen_first_name,
            last_name=payload.citizen_last_name,
            father_name=payload.citizen_father_name,
        )
        citizen = self.citizens.create(citizen)

        obj = Appeal(
            reg_no=self._generate_reg_no(),
            subject=payload.subject,
            description=payload.description,
            citizen_id=citizen.id,
            org_unit_id=payload.org_unit_id,
            created_by_user_id=current_user.id,
            received_at=payload.received_at or datetime.utcnow(),
            registration_number=payload.registration_number,
            registration_date=payload.registration_date,
            execution_deadline=payload.execution_deadline,
            originating_military_unit=payload.originating_military_unit,
            leader_decision=payload.leader_decision,
            other_military_unit_number=payload.other_military_unit_number,
            other_institution_date=payload.other_institution_date,
            incoming_appeal_number=payload.incoming_appeal_number,
            incoming_appeal_date=payload.incoming_appeal_date,
            originating_institution=payload.originating_institution,
            appeal_submitter=payload.appeal_submitter,
            submitter_full_name=payload.submitter_full_name,
            submitter_saa=payload.submitter_saa,
            address=payload.address,
            appeal_review_status=payload.appeal_review_status,
            page_count=payload.page_count,
            email=payload.email,
            phone_number=payload.phone_number,
            is_repeat_appeal=payload.is_repeat_appeal,
            reviewed_by=payload.reviewed_by,
            is_under_supervision=payload.is_under_supervision,
            short_content=payload.short_content,
            appeal_type=payload.appeal_type,
            report_index=payload.report_index,
            appeal_index=payload.appeal_index,
        )
        return self.appeals.create(obj)

    def get(self, appeal_id: int, current_user: User) -> Appeal:
        obj = self.appeals.get(appeal_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Appeal not found")

        # Scope check: operator can only see own org_unit appeals
        if not current_user.is_admin and obj.org_unit_id != current_user.org_unit_id:
            raise HTTPException(status_code=403, detail="Cannot access appeal from another org unit")

        return obj

    def update(self, current_user: User, appeal_id: int, payload: AppealUpdate) -> Appeal:
        obj = self.appeals.get(appeal_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Appeal not found")

        if not current_user.is_admin and obj.org_unit_id != current_user.org_unit_id:
            raise HTTPException(status_code=403, detail="Cannot update appeal from another org unit")

        if payload.org_unit_id is not None:
            if not current_user.is_admin and payload.org_unit_id != current_user.org_unit_id:
                raise HTTPException(status_code=403, detail="Cannot move appeal to another org unit")
            if not self.org_units.get(payload.org_unit_id):
                raise HTTPException(status_code=400, detail="Invalid org_unit_id")

        # If executor department is set, enforce that it belongs to the same parent org unit (idarə)
        if payload.executor_org_unit_id is not None:
            executor_unit = self.org_units.get(payload.executor_org_unit_id)
            if not executor_unit:
                raise HTTPException(status_code=400, detail="Invalid executor_org_unit_id")

            # Sadə qayda: icra şöbəsinin parent-i müraciətin org_unit-i olmalıdır
            if executor_unit.parent_id != obj.org_unit_id:
                raise HTTPException(
                    status_code=400,
                    detail="Executor department must belong to the same idarə (parent org unit mismatch)",
                )

        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        return self.appeals.save(obj)


