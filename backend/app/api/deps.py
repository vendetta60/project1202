from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.repositories.appeal import AppealRepository
from app.repositories.citizen import CitizenRepository
from app.repositories.org_unit import OrgUnitRepository
from app.repositories.user import UserRepository
from app.repositories.role import RoleRepository
from app.repositories.executor import ExecutorRepository
from app.services.appeal import AppealService
from app.services.auth import AuthService
from app.services.citizen import CitizenService
from app.services.org_unit import OrgUnitService
from app.services.user import UserService
from app.services.role import RoleService
from app.services.executor import ExecutorService

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
    if not user or not user.is_active:
        raise credentials_exception
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privilege required")
    return current_user


def require_org_unit(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.org_unit_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="User must be assigned to an org unit")
    return current_user


# Repository factories
def get_citizen_repo(db: Session = Depends(get_db)) -> CitizenRepository:
    return CitizenRepository(db)


def get_org_unit_repo(db: Session = Depends(get_db)) -> OrgUnitRepository:
    return OrgUnitRepository(db)


def get_user_repo(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_appeal_repo(db: Session = Depends(get_db)) -> AppealRepository:
    return AppealRepository(db)


def get_executor_repo(db: Session = Depends(get_db)) -> ExecutorRepository:
    return ExecutorRepository(db)

def get_role_repo(db: Session = Depends(get_db)) -> RoleRepository:
    return RoleRepository(db)


# Service factories
def get_citizen_service(repo: CitizenRepository = Depends(get_citizen_repo)) -> CitizenService:
    return CitizenService(repo)


def get_org_unit_service(repo: OrgUnitRepository = Depends(get_org_unit_repo)) -> OrgUnitService:
    return OrgUnitService(repo)


def get_user_service(repo: UserRepository = Depends(get_user_repo)) -> UserService:
    return UserService(repo)


def get_auth_service(users: UserRepository = Depends(get_user_repo)) -> AuthService:
    return AuthService(users)


def get_appeal_service(
    appeals: AppealRepository = Depends(get_appeal_repo),
    citizens: CitizenRepository = Depends(get_citizen_repo),
    org_units: OrgUnitRepository = Depends(get_org_unit_repo),
) -> AppealService:
    return AppealService(appeals, citizens, org_units)


def get_role_service(repo: RoleRepository = Depends(get_role_repo)) -> RoleService:
    return RoleService(repo)


def get_executor_service(
    repo: ExecutorRepository = Depends(get_executor_repo),
) -> ExecutorService:
    return ExecutorService(repo)

def require_org_unit(current_user: User = Depends(get_current_user)) -> User:
    if current_user.org_unit_id is None and not current_user.is_admin:
        raise HTTPException(status_code=400, detail="User has no org_unit assigned")
    return current_user


