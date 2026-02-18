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
        data = payload.model_dump()
        phone = data.pop("phone", None)
        obj = Appeal(**data)
        if current_user.section_id and not obj.user_section_id:
            obj.user_section_id = current_user.section_id
        
        result = self.appeals.create(
            obj,
            user_id=current_user.id,
            user_name=current_user.username
        )

        if phone:
            from app.models.contact import Contact
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
        
        # Populate phone from Contacts table
        from app.models.contact import Contact
        contact = self.appeals.db.query(Contact).filter(Contact.appeal_id == appeal_id).first()
        if contact:
            obj.phone = contact.contact
            
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
        
        # Populate phone for the returned object
        from app.models.contact import Contact
        contact = self.appeals.db.query(Contact).filter(Contact.appeal_id == appeal_id).first()
        result.phone = contact.contact if contact else None

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
        """Soft delete an appeal"""
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
        
        self.appeals.delete(
            obj,
            user_id=current_user.id,
            user_name=current_user.username
        )
        
        return {"message": "Müraciət silindi", "id": appeal_id}
