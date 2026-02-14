import hashlib

from fastapi import HTTPException

from app.core.security import create_access_token
from app.repositories.user import UserRepository


class AuthService:
    def __init__(self, users: UserRepository):
        self.users = users

    def login(self, username: str, password: str) -> str:
        user = self.users.get_by_username(username)
        if not user:
            raise HTTPException(status_code=400, detail="İstifadəçi adı və ya şifrə yanlışdır")

        # MSSQL passwords are stored as SHA-256 hashes
        hashed_input = hashlib.sha256(password.encode("utf-8")).hexdigest()
        if user.password != hashed_input:
            raise HTTPException(status_code=400, detail="İstifadəçi adı və ya şifrə yanlışdır")

        return create_access_token(subject=user.username)
