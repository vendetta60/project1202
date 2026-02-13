from fastapi import HTTPException

from app.core.security import hash_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate


class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    def list(self, q: str | None = None, limit: int = 50, offset: int = 0) -> list[User]:
        return self.repo.list(q=q, limit=limit, offset=offset)

    def create(self, payload: UserCreate) -> User:
        if self.repo.get_by_username(payload.username):
            raise HTTPException(status_code=409, detail="Username already exists")
        obj = User(
            username=payload.username,
            full_name=payload.full_name,
            password_hash=hash_password(payload.password),
            org_unit_id=payload.org_unit_id,
            is_admin=payload.is_admin,
            is_active=True,
        )
        return self.repo.create(obj)

    def get(self, user_id: int) -> User:
        obj = self.repo.get(user_id)
        if not obj:
            raise HTTPException(status_code=404, detail="User not found")
        return obj

    def toggle_active(self, user_id: int) -> User:
        obj = self.get(user_id)
        obj.is_active = not obj.is_active
        return self.repo.save(obj)


