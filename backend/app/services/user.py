import hashlib

from fastapi import HTTPException

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
            raise HTTPException(status_code=409, detail="İstifadəçi adı artıq mövcuddur")
        
        hashed_password = hashlib.sha256(payload.password.encode("utf-8")).hexdigest()
        
        obj = User(
            username=payload.username,
            surname=payload.surname,
            name=payload.name,
            password=hashed_password,
            section_id=payload.section_id,
        )
        return self.repo.create(obj)

    def get(self, user_id: int) -> User:
        obj = self.repo.get(user_id)
        if not obj:
            raise HTTPException(status_code=404, detail="İstifadəçi tapılmadı")
        return obj

    def count(self) -> int:
        return self.repo.count()
