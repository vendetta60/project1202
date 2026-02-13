from pydantic import field_validator
from app.schemas.common import ORMBase


class RoleCreate(ORMBase):
    name: str
    description: str | None = None
    permissions: list[str] = []
    
    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v or len(v.strip()) == 0:
            raise ValueError("Role name cannot be empty")
        if len(v) > 100:
            raise ValueError("Role name too long (max 100 characters)")
        return v.strip()


class RoleUpdate(ORMBase):
    name: str | None = None
    description: str | None = None
    permissions: list[str] | None = None
    
    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is not None:
            if len(v.strip()) == 0:
                raise ValueError("Role name cannot be empty")
            if len(v) > 100:
                raise ValueError("Role name too long (max 100 characters)")
            return v.strip()
        return v


class RoleOut(ORMBase):
    id: int
    name: str
    description: str | None = None
    permissions: list[str]
    is_system: bool


class UserRoleAssignment(ORMBase):
    role_ids: list[int]
