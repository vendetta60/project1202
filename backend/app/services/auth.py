import hashlib

from fastapi import HTTPException

from app.core.security import create_access_token
from app.repositories.user import UserRepository
from app.services.audit import AuditService


class AuthService:
    def __init__(self, users: UserRepository, audit: AuditService | None = None):
        self.users = users
        self.audit = audit

    def login(self, username: str, password: str) -> str:
        user = self.users.get_by_username(username)
        if not user:
            raise HTTPException(status_code=400, detail="İstifadəçi adı və ya şifrə yanlışdır")

        # MSSQL passwords are stored as SHA-256 hashes
        hashed_input = hashlib.sha256(password.encode("utf-8")).hexdigest()
        if user.password != hashed_input:
            raise HTTPException(status_code=400, detail="İstifadəçi adı və ya şifrə yanlışdır")
        
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Hesabınız bloklanıb. Lütfən administratorla əlaqə saxlayın")

        # Log successful login
        if self.audit:
            try:
                self.audit.log_action(
                    entity_type="User",
                    entity_id=user.id,
                    action="LOGIN",
                    current_user=user,
                    description=f"İstifadəçi sistemə giriş etdi",
                )
            except Exception as e:
                # Don't fail login if logging fails
                print(f"Failed to log login: {e}")

        return create_access_token(subject=user.username)
