"""
Service for audit logging operations
"""
from __future__ import annotations

import json
from datetime import datetime
from typing import Any

from app.models.audit_log import AuditLog
from app.repositories.audit_log import AuditLogRepository
from app.models.user import User
from app.schemas.audit_log import AuditLogCreate


class AuditService:
    def __init__(self, audit_repo: AuditLogRepository):
        self.audit_repo = audit_repo

    def log_action(
        self,
        entity_type: str,
        entity_id: int,
        action: str,
        current_user: User,
        description: str | None = None,
        old_values: dict[str, Any] | None = None,
        new_values: dict[str, Any] | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> AuditLog:
        """Log an action performed on an entity"""
        
        old_values_json = json.dumps(old_values) if old_values else None
        new_values_json = json.dumps(new_values) if new_values else None
        
        log_data = AuditLogCreate(
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            description=description,
            old_values=old_values_json,
            new_values=new_values_json,
            created_by=current_user.id,
            created_by_name=current_user.username,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        
        log_obj = AuditLog(**log_data.model_dump())
        return self.audit_repo.create(log_obj)

    def list_logs(
        self,
        entity_type: str | None = None,
        entity_id: int | None = None,
        created_by: int | None = None,
        action: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[AuditLog], int]:
        """Get audit logs with pagination"""
        items = self.audit_repo.list(
            entity_type=entity_type,
            entity_id=entity_id,
            created_by=created_by,
            action=action,
            limit=limit,
            offset=offset,
        )
        total = self.audit_repo.count(
            entity_type=entity_type,
            entity_id=entity_id,
            created_by=created_by,
            action=action,
        )
        return items, total

    def get_entity_history(self, entity_type: str, entity_id: int) -> list[AuditLog]:
        """Get full change history for an entity"""
        return self.audit_repo.get_entity_history(entity_type, entity_id)
