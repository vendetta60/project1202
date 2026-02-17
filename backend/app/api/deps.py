from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.repositories.appeal import AppealRepository
from app.repositories.user import UserRepository
from app.repositories.executor import ExecutorRepository
from app.repositories.lookup import LookupRepository
from app.repositories.report import ReportRepository
from app.repositories.audit_log import AuditLogRepository
from app.services.appeal import AppealService
from app.services.auth import AuthService
from app.services.user import UserService
from app.services.report import ReportService
from app.services.audit import AuditService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        username: str | None = payload.get("sub")
        if not username:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise credentials_exception
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privilege required")
    return current_user


# Repository factories
def get_user_repo(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_appeal_repo(db: Session = Depends(get_db)) -> AppealRepository:
    return AppealRepository(db)


def get_executor_repo(db: Session = Depends(get_db)) -> ExecutorRepository:
    return ExecutorRepository(db)


def get_lookup_repo(db: Session = Depends(get_db)) -> LookupRepository:
    return LookupRepository(db)


def get_report_repo(db: Session = Depends(get_db)) -> ReportRepository:
    return ReportRepository(db)


def get_audit_log_repo(db: Session = Depends(get_db)) -> AuditLogRepository:
    return AuditLogRepository(db)


# Service factories
def get_user_service(repo: UserRepository = Depends(get_user_repo)) -> UserService:
    return UserService(repo)


def get_auth_service(users: UserRepository = Depends(get_user_repo)) -> AuthService:
    return AuthService(users)


def get_audit_service(repo: AuditLogRepository = Depends(get_audit_log_repo)) -> AuditService:
    return AuditService(repo)


def get_appeal_service(
    appeals: AppealRepository = Depends(get_appeal_repo),
    audit: AuditService = Depends(get_audit_service),
) -> AppealService:
    return AppealService(appeals, audit)


def get_report_service(
    repo: ReportRepository = Depends(get_report_repo),
) -> ReportService:
    return ReportService(repo)
