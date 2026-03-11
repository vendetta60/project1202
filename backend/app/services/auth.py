import hashlib

from fastapi import HTTPException
from jose import JWTError, jwt

from app.core.security import create_access_token, create_refresh_token
from app.core.config import settings
from app.repositories.user import UserRepository
from app.services.audit import AuditService


class AuthService:
    def __init__(self, users: UserRepository, audit: AuditService | None = None):
        self.users = users
        self.audit = audit

    def login(self, username: str, password: str) -> tuple[str, str, bool]:
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
                    description="İstifadəçi sistemə giriş etdi",
                )
            except Exception as e:
                # Don't fail login if logging fails
                print(f"Failed to log login: {e}")

        access = create_access_token(subject=user.username)
        refresh = create_refresh_token(subject=user.username)
        must_change = getattr(user, "must_change_password", False)
        return access, refresh, must_change

    def refresh(self, refresh_token: str) -> tuple[str, str]:
        """Validate refresh token and issue a new access/refresh pair."""
        try:
            payload = jwt.decode(refresh_token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
            token_type = payload.get("type")
            username = payload.get("sub")
            if token_type != "refresh" or not username:
                raise HTTPException(status_code=401, detail="Refresh token etibarsızdır")
        except JWTError:
            raise HTTPException(status_code=401, detail="Refresh token etibarsızdır")

        user = self.users.get_by_username(username)
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="İstifadəçi aktiv deyil")

        access = create_access_token(subject=user.username)
        new_refresh = create_refresh_token(subject=user.username)
        return access, new_refresh
