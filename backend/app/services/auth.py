from fastapi import HTTPException

from app.core.security import create_access_token, verify_password
from app.repositories.user import UserRepository


class AuthService:
    def __init__(self, users: UserRepository):
        self.users = users

    def login(self, username: str, password: str) -> str:
        user = self.users.get_by_username(username)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect username or password")
        return create_access_token(subject=user.username)

