from pydantic import BaseModel
from app.schemas.common import ORMBase


class UserCreate(ORMBase):
    surname: str | None = None
    name: str | None = None
    username: str
    password: str
    section_id: int | None = None
    role_ids: list[int] | None = None
    group_ids: list[int] | None = None


class UserOut(ORMBase):
    id: int
    surname: str | None = None
    name: str | None = None
    username: str | None = None
    full_name: str | None = None
    section_id: int | None = None
    section_name: str | None = None
    is_admin: bool = False
    is_active: bool = True
    # Tab permissions
    tab1: bool | None = None
    tab2: bool | None = None
    tab3: bool | None = None
    tab4: bool | None = None
    tab5: bool | None = None


class UsersListResponse(BaseModel):
    items: list[UserOut]
    total: int
    limit: int
    offset: int


class TokenOut(ORMBase):
    access_token: str
    token_type: str = "bearer"
