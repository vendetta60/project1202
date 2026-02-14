from fastapi import HTTPException

from app.models.appeal import Appeal
from app.models.user import User
from app.repositories.appeal import AppealRepository
from app.schemas.appeal import AppealCreate, AppealUpdate


class AppealService:
    def __init__(self, appeals: AppealRepository):
        self.appeals = appeals

    def list(
        self,
        current_user: User,
        dep_id: int | None = None,
        region_id: int | None = None,
        status: int | None = None,
        q: str | None = None,
        user_section_id: int | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Appeal]:
        # Non-admin users see only their section's appeals
        if not current_user.is_admin and current_user.section_id:
            user_section_id = current_user.section_id
        return self.appeals.list(
            dep_id=dep_id,
            region_id=region_id,
            status=status,
            q=q,
            user_section_id=user_section_id,
            limit=min(limit, 200),
            offset=offset,
        )

    def count(
        self,
        current_user: User,
        dep_id: int | None = None,
        region_id: int | None = None,
        status: int | None = None,
        user_section_id: int | None = None,
        q: str | None = None,
    ) -> int:
        if not current_user.is_admin and current_user.section_id:
            user_section_id = current_user.section_id
        return self.appeals.count(
            dep_id=dep_id,
            region_id=region_id,
            status=status,
            user_section_id=user_section_id,
            q=q,
        )

    def create(self, current_user: User, payload: AppealCreate) -> Appeal:
        obj = Appeal(**payload.model_dump())
        if current_user.section_id and not obj.user_section_id:
            obj.user_section_id = current_user.section_id
        return self.appeals.create(obj)

    def get(self, appeal_id: int, current_user: User) -> Appeal:
        obj = self.appeals.get(appeal_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Müraciət tapılmadı")
        return obj

    def update(self, current_user: User, appeal_id: int, payload: AppealUpdate) -> Appeal:
        obj = self.appeals.get(appeal_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Müraciət tapılmadı")

        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        return self.appeals.save(obj)
