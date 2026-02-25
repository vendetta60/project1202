import hashlib

from fastapi import HTTPException

from app.models.user import User
from app.repositories.user import UserRepository
from app.repositories.permission import UserRoleRepository, PermissionGroupRepository, RoleRepository
from app.schemas.user import UserCreate
from app.services.audit import AuditService


class UserService:
    def __init__(self, repo: UserRepository, audit: AuditService | None = None):
        self.repo = repo
        self.audit = audit

    def list(self, q: str | None = None, limit: int = 50, offset: int = 0) -> list[User]:
        return self.repo.list(q=q, limit=limit, offset=offset)

    def create(self, payload: UserCreate, current_user: User | None = None) -> User:
        if self.repo.get_by_username(payload.username):
            raise HTTPException(status_code=409, detail="İstifadəçi adı artıq mövcuddur")
        
        hashed_password = hashlib.sha256(payload.password.encode("utf-8")).hexdigest()
        
        if current_user and payload.rank > current_user.rank:
            raise HTTPException(status_code=403, detail="Sizdən daha yüksək rütbəli istifadəçi yarada bilməzsiniz")

        # Admin (rank 2) can only delegate specific categories
        if current_user and current_user.rank == 2:
            if payload.is_admin or payload.is_super_admin:
                 raise HTTPException(status_code=403, detail="Admin başqa bir Admin və ya Super Admin yarada bilməz")
            
            blocked_categories = {"admin", "users", "audit"}
            
            # Validate roles
            if payload.role_ids:
                role_repo = RoleRepository(self.repo.db)
                for role_id in payload.role_ids:
                    role = role_repo.get(role_id)
                    if role:
                        for rp in role.role_permissions:
                            if rp.permission.category and rp.permission.category in blocked_categories:
                                raise HTTPException(
                                    status_code=403, 
                                    detail=f"Admin bu kateqoriyalı icazəni verə bilməz: '{rp.permission.category}'"
                                )
                                
            # Validate groups
            if payload.group_ids:
                group_repo = PermissionGroupRepository(self.repo.db)
                for group_id in payload.group_ids:
                    group = group_repo.get(group_id)
                    if group:
                        for item in group.permission_group_items:
                            if item.permission.category and item.permission.category in blocked_categories:
                                raise HTTPException(
                                    status_code=403, 
                                    detail=f"Admin bu kateqoriyalı icazəni verə bilməz: '{item.permission.category}'"
                                )

        obj = User(
            username=payload.username,
            surname=payload.surname,
            name=payload.name,
            password=hashed_password,
            section_id=payload.section_id,
            is_admin=payload.is_admin,
            is_super_admin=payload.is_super_admin
        )
        user = self.repo.create(obj)

        # Assign roles if provided
        if payload.role_ids:
            role_repo = UserRoleRepository(self.repo.db)
            role_repo.set_user_roles(user.id, payload.role_ids)
        
        # Apply permission groups if provided
        if payload.group_ids:
            group_repo = PermissionGroupRepository(self.repo.db)
            for group_id in payload.group_ids:
                group_repo.apply_to_user(user.id, group_id)

        # Log creation
        if self.audit and current_user:
            self.audit.log_action(
                entity_type="User",
                entity_id=user.id,
                action="CREATE",
                current_user=current_user,
                description=f"İstifadəçi yaradıldı - {user.username}",
                new_values=payload.model_dump(exclude={"password"}),
            )

        return user

    def get(self, user_id: int) -> User:
        obj = self.repo.get(user_id)
        if not obj:
            raise HTTPException(status_code=404, detail="İstifadəçi tapılmadı")
        return obj

    def count(self) -> int:
        return self.repo.count()

    def delete(self, user_id: int, current_user: User) -> None:
        """Hard-delete a user. Requester rank must be > target rank."""
        user = self.get(user_id)
        if user.id == current_user.id:
            raise HTTPException(status_code=400, detail="Özünüzü silə bilməzsiniz")
        
        if current_user.rank <= user.rank and not current_user.is_super_admin:
            raise HTTPException(status_code=403, detail="Sizdən yüksək və ya eyni rütbəli istifadəçini silə bilməzsiniz")
            
        if self.audit:
            self.audit.log_action(
                entity_type="User",
                entity_id=user.id,
                action="DELETE",
                current_user=current_user,
                description=f"İstifadəçi silindi - {user.username}",
            )
        self.repo.delete(user)

    def toggle_block(self, user_id: int, current_user: User) -> User:
        """Block or unblock a user. Requester rank must be > target rank."""
        user = self.get(user_id)
        if user.id == current_user.id:
            raise HTTPException(status_code=400, detail="Özünüzü bloklaya bilməzsiniz")
        
        if current_user.rank <= user.rank and not current_user.is_super_admin:
            raise HTTPException(status_code=403, detail="Sizdən yüksək və ya eyni rütbəli istifadəçini bloklaya/blokdan çıxara bilməzsiniz")
            
        user.is_deleted = not bool(user.is_deleted)
        updated_user = self.repo.save(user)

        action = "BLOCK" if updated_user.is_deleted else "UNBLOCK"
        if self.audit:
            self.audit.log_action(
                entity_type="User",
                entity_id=user.id,
                action=action,
                current_user=current_user,
                description=f"İstifadəçi {'bloklandı' if updated_user.is_deleted else 'blokdan çıxarıldı'} - {user.username}",
            )
        return updated_user

    def reset_password(self, user_id: int, new_password: str, current_user: User) -> User:
        user = self.get(user_id)
        
        # Requester must have higher or equal rank (can reset own or same level, but User cannot reset Admin)
        if current_user.rank < user.rank and not current_user.is_super_admin:
            raise HTTPException(status_code=403, detail="Sizdən yüksək rütbəli istifadəçinin parolunu sıfırlaya bilməzsiniz")
            
        hashed_password = hashlib.sha256(new_password.encode("utf-8")).hexdigest()
        user.password = hashed_password
        
        updated_user = self.repo.save(user)
        
        if self.audit:
            self.audit.log_action(
                entity_type="User",
                entity_id=user.id,
                action="UPDATE",
                current_user=current_user,
                description=f"İstifadəçinin parolu sıfırlandı - {user.username}",
                new_values={"password": "[HIDDEN]"}
            )
            
        return updated_user
