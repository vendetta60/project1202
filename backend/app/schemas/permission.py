"""
Pydantic schemas for permission-related API responses
"""
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class PermissionOut(BaseModel):
    """Permission output schema"""
    id: int
    code: str
    name: str
    description: str | None = None
    category: str | None = None
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)


class RoleOut(BaseModel):
    """Role output schema"""
    id: int
    name: str
    description: str | None = None
    is_system: bool = False
    is_active: bool = True
    permissions: list[PermissionOut] = []

    model_config = ConfigDict(from_attributes=True)


class RoleCreate(BaseModel):
    """Create role"""
    name: str
    description: str | None = None


class RoleUpdate(BaseModel):
    """Update role"""
    name: str | None = None
    description: str | None = None
    is_active: bool | None = None


class RoleWithPermissions(BaseModel):
    """Role with list of assigned permission IDs"""
    id: int
    name: str
    description: str | None = None
    is_system: bool = False
    is_active: bool = True
    permission_ids: list[int] = []

    model_config = ConfigDict(from_attributes=True)


class UserRoleAssignment(BaseModel):
    """Assign/revoke role from user"""
    user_id: int
    role_id: int


class UserPermissionAssignment(BaseModel):
    """Assign/revoke individual permission from user"""
    user_id: int
    permission_id: int
    grant_type: str  # 'grant' or 'deny'


class UserPermissionsOut(BaseModel):
    """User's permissions summary"""
    user_id: int
    permission_codes: list[str]
    role_ids: list[int]


class PermissionGroupOut(BaseModel):
    """Permission group (template) output"""
    id: int
    name: str
    description: str | None = None
    is_template: bool = True
    is_active: bool = True
    permissions: list[PermissionOut] = []

    model_config = ConfigDict(from_attributes=True)


class PermissionGroupCreate(BaseModel):
    """Create permission group"""
    name: str
    description: str | None = None
    is_template: bool = True
    permission_ids: list[int] = []


class PermissionGroupUpdate(BaseModel):
    """Update permission group"""
    name: str | None = None
    description: str | None = None
    is_template: bool | None = None
    is_active: bool | None = None
    permission_ids: list[int] | None = None


class PermissionGroupApply(BaseModel):
    """Apply permission group to user"""
    user_id: int
    group_id: int
