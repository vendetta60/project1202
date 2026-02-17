"""
Pydantic schemas for AuditLog
"""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel


class AuditLogBase(BaseModel):
    entity_type: str
    entity_id: int
    action: str
    description: str | None = None
    old_values: str | None = None
    new_values: str | None = None
    created_by: int | None = None
    created_by_name: str | None = None


class AuditLogCreate(AuditLogBase):
    created_at: datetime | None = None
    ip_address: str | None = None
    user_agent: str | None = None


class AuditLogOut(AuditLogBase):
    id: int
    created_at: datetime
    ip_address: str | None = None
    user_agent: str | None = None

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    items: list[AuditLogOut]
    total: int
    limit: int
    offset: int
