from pydantic import BaseModel
from app.schemas.common import ORMBase
from app.schemas.org_unit import OrgUnitOut
from app.schemas.role import RoleOut


class UserCreate(ORMBase):
    username: str
    password: str
    full_name: str | None = None
    org_unit_id: int | None = None
    is_admin: bool = False


class UserOut(ORMBase):
    id: int
    username: str
    full_name: str | None = None
    is_active: bool
    is_admin: bool
    org_unit_id: int | None = None
    org_unit: OrgUnitOut | None = None
    roles: list[RoleOut] = []


class UsersListResponse(BaseModel):
    items: list[UserOut]
    total: int
    limit: int
    offset: int


class TokenOut(ORMBase):
    access_token: str
    token_type: str = "bearer"
    
