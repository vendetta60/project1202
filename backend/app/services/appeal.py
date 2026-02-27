from datetime import datetime
from fastapi import HTTPException

from app.models.appeal import Appeal
from app.models.user import User
from app.repositories.appeal import AppealRepository
from app.services.audit import AuditService
from app.schemas.appeal import AppealCreate, AppealUpdate


class AppealService:
    def __init__(self, appeals: AppealRepository, audit: AuditService | None = None):
        self.appeals = appeals
        self.audit = audit

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
        include_deleted: bool = False,
    ) -> list[Appeal]:
        # Non-admin users see only their section's appeals
        if not current_user.is_admin:
            user_section_id = current_user.section_id
            include_deleted = False  # Security: regular users can never see deleted records

        return self.appeals.list(
            dep_id=dep_id,
            region_id=region_id,
            status=status,
            q=q,
            user_section_id=user_section_id,
            limit=min(limit, 200),
            offset=offset,
            include_deleted=include_deleted,
        )

    def count(
        self,
        current_user: User,
        dep_id: int | None = None,
        region_id: int | None = None,
        status: int | None = None,
        user_section_id: int | None = None,
        q: str | None = None,
        include_deleted: bool = False,
    ) -> int:
        if not current_user.is_admin:
            user_section_id = current_user.section_id
            include_deleted = False

        return self.appeals.count(
            dep_id=dep_id,
            region_id=region_id,
            status=status,
            user_section_id=user_section_id,
            q=q,
            include_deleted=include_deleted,
        )
    def check_duplicate(self, person: str, year: int, section_id: int) -> dict:
        count = self.appeals.get_ap_count_for_person(person, year, section_id)
        return {"exists": count > 0, "count": count}

    def create(self, current_user: User, payload: AppealCreate) -> Appeal:
        from app.models.department import Department
        from app.models.lookup import UserSection
        from app.models.contact import Contact

        data = payload.model_dump()
        phone = data.pop("phone", None)
        
        # Decide which section to use for generation
        section_id = data.get("user_section_id") or current_user.section_id
        if not section_id:
            raise HTTPException(status_code=400, detail="Bölmə məlumatı tapılmadı")

        reg_date = data.get("reg_date") or datetime.utcnow()
        year = reg_date.year
        person = data.get("person") or ""
        ap_index_id = data.get("ap_index_id") or 0
        dep_id = data.get("dep_id")

        # 1. Calculate ap_count (repeats)
        ap_count = self.appeals.get_ap_count_for_person(person, year, section_id)
        
        # 2. Calculate num and rep_num
        max_num = self.appeals.get_max_num_for_year(year, section_id)
        if max_num == 0:
            num = 1
        elif ap_count > 0:
            num = max_num
        else:
            num = max_num + 1
            
        rep_num = None
        if ap_count > 0:
            rep_num = self.appeals.get_original_num_for_person(person, year, section_id)

        # 3. Get Department sign and Section index
        dept = self.appeals.db.query(Department).filter(Department.id == dep_id).first()
        sign = dept.sign if dept else None
        
        u_sec = self.appeals.db.query(UserSection).filter(UserSection.id == section_id).first()
        sec_index = u_sec.section_index if u_sec else 0

        # 4. Assemble reg_num string
        # Prefix: case when @sign = 'e' then '3-25-e/1-' else '3-25-' + CAST(@index as nvarchar) + '/1-' end
        prefix = f"3-25-e/1-" if sign == 'e' else f"3-25-{sec_index}/1-"
        
        # Middle: case when @sign = 'Kol' then 'Kol' 
        #         when @sign = N'T/Vət' then N'T/Vət' 
        #         when (@sign is not null and @sign != 'e') then @sign+'/'+LEFT(@person, 1) 
        #         else LEFT(@person, 1) end
        person_initial = person[0] if person else ""
        if sign == 'Kol':
            middle = "Kol"
        elif sign == 'T/Vət':
            middle = "T/Vət"
        elif sign and sign != 'e':
            middle = f"{sign}/{person_initial}"
        else:
            middle = person_initial
            
        # Num part: case when @rep_num is null then CAST(@num as nvarchar) else CAST(@rep_num as nvarchar) end
        num_part = str(rep_num if rep_num is not None else num)
        
        # Suffix: case when @ap_count > 0 then '/'+CAST(@ap_count+1 as nvarchar)+'-' else '-' end
        suffix = f"/{ap_count+1}-" if ap_count > 0 else "-"
        
        generated_reg_num = f"{prefix}{middle}-{num_part}{suffix}{ap_index_id}/{year}"

        # 5. Create the Appeal object
        obj = Appeal(**data)
        obj.num = num
        obj.reg_num = generated_reg_num
        obj.user_section_id = section_id
        if ap_count > 0:
            obj.repetition = True

        result = self.appeals.create(
            obj,
            user_id=current_user.id,
            user_name=current_user.username
        )

        if phone:
            contact_obj = Contact(appeal_id=result.id, contact=phone)
            self.appeals.db.add(contact_obj)
            self.appeals.db.commit()
        
        # Log the creation ... (omitted for brevity in this tool call, will maintain original logic)
        if self.audit:
            self.audit.log_action(
                entity_type="Appeal",
                entity_id=result.id,
                action="CREATE",
                current_user=current_user,
                description=f"Müraciət yaradıldı - {result.reg_num}",
                new_values=payload.model_dump(),
            )
        
        result.phone = phone
        return result

    def get(self, appeal_id: int, current_user: User) -> Appeal:
        obj = self.appeals.get(appeal_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Müraciət tapılmadı")
        return obj

    def update(self, current_user: User, appeal_id: int, payload: AppealUpdate) -> Appeal:
        obj = self.appeals.get(appeal_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Müraciət tapılmadı")

        # Capture old values for audit
        old_values = {}
        updates = payload.model_dump(exclude_unset=True)
        phone = updates.pop("phone", None) if "phone" in updates else None
        
        for key in updates.keys():
            if hasattr(obj, key):
                old_values[key] = getattr(obj, key)

        result = self.appeals.update(
            obj,
            updates=updates,
            user_id=current_user.id,
            user_name=current_user.username
        )
        
        if phone is not None:
            from app.models.contact import Contact
            contact = self.appeals.db.query(Contact).filter(Contact.appeal_id == appeal_id).first()
            if contact:
                contact.contact = phone
            else:
                contact = Contact(appeal_id=appeal_id, contact=phone)
            self.appeals.db.add(contact)
            self.appeals.db.commit()
        
        # Log the update
        if self.audit:
            self.audit.log_action(
                entity_type="Appeal",
                entity_id=result.id,
                action="UPDATE",
                current_user=current_user,
                description=f"Müraciət dəyişdirildi - {result.reg_num}",
                old_values=old_values,
                new_values=payload.model_dump(exclude_unset=True),
            )
        
        return result

    def delete(self, appeal_id: int, current_user: User) -> dict:
        """Soft delete an appeal – yalnız delete_appeal permissionu olan istifadəçilər edə bilər.
        Hard delete heç kəs edə bilməz."""
        # Permission check: admin həmişə icazəlidir
        if not current_user.is_admin and not current_user.has_permission("delete_appeal"):
            raise HTTPException(
                status_code=403,
                detail="Müraciəti silmək üçün icazəniz yoxdur"
            )

        obj = self.appeals.get(appeal_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Müraciət tapılmadı")

        # Log the deletion before soft-deleting
        if self.audit:
            self.audit.log_action(
                entity_type="Appeal",
                entity_id=obj.id,
                action="DELETE",
                current_user=current_user,
                description=f"Müraciət silindi - {obj.reg_num}",
                old_values={"is_deleted": obj.is_deleted},
                new_values={"is_deleted": True},
            )

        # YALNIZ soft delete – is_deleted=True qoyulur, sətir DB-dən silinmir
        self.appeals.delete(
            obj,
            user_id=current_user.id,
            user_name=current_user.username
        )

        return {"message": "Müraciət silindi", "id": appeal_id}

    def restore(self, appeal_id: int, current_user: User) -> dict:
        """Restore a soft-deleted appeal – yalnız adminlər edə bilər."""
        if not current_user.is_admin:
            raise HTTPException(
                status_code=403,
                detail="Müraciəti geri qaytarmaq üçün admin səlahiyyətiniz olmalıdır"
            )

        obj = self.appeals.get(appeal_id, include_deleted=True)
        if not obj:
            raise HTTPException(status_code=404, detail="Müraciət tapılmadı")

        if not obj.is_deleted:
            return {"message": "Müraciət artıq aktivdir", "id": appeal_id}

        # Log the restoration
        if self.audit:
            self.audit.log_action(
                entity_type="Appeal",
                entity_id=obj.id,
                action="RESTORE",
                current_user=current_user,
                description=f"Müraciət geri qaytarıldı - {obj.reg_num}",
                old_values={"is_deleted": True},
                new_values={"is_deleted": False},
            )

        self.appeals.restore(
            obj,
            user_id=current_user.id,
            user_name=current_user.username
        )

        return {"message": "Müraciət geri qaytarıldı", "id": appeal_id}
