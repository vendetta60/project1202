import hashlib

from fastapi import HTTPException

from app.models.user import User
from app.repositories.user import UserRepository
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
        
        obj = User(
            username=payload.username,
            surname=payload.surname,
            name=payload.name,
            password=hashed_password,
            section_id=payload.section_id,
        )
        user = self.repo.create(obj)

        # Log creation if audit service and current_user are available
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
