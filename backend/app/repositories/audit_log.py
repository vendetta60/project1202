"""
Repository for AuditLog operations
"""
from __future__ import annotations

from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.audit_log import AuditLog


class AuditLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, log: AuditLog) -> AuditLog:
        """Create a new audit log entry"""
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def list(
        self,
        entity_type: str | None = None,
        entity_id: int | None = None,
        created_by: int | None = None,
        action: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[AuditLog]:
        """List audit logs with filters"""
        query = self.db.query(AuditLog)
        
        if entity_type is not None:
            query = query.filter(AuditLog.entity_type == entity_type)
        if entity_id is not None:
            query = query.filter(AuditLog.entity_id == entity_id)
        if created_by is not None:
            query = query.filter(AuditLog.created_by == created_by)
        if action is not None:
            query = query.filter(AuditLog.action == action)
        
        return query.order_by(desc(AuditLog.created_at)).limit(limit).offset(offset).all()

    def count(
        self,
        entity_type: str | None = None,
        entity_id: int | None = None,
        created_by: int | None = None,
        action: str | None = None,
    ) -> int:
        """Count audit logs matching filters"""
        query = self.db.query(AuditLog)
        
        if entity_type is not None:
            query = query.filter(AuditLog.entity_type == entity_type)
        if entity_id is not None:
            query = query.filter(AuditLog.entity_id == entity_id)
        if created_by is not None:
            query = query.filter(AuditLog.created_by == created_by)
        if action is not None:
            query = query.filter(AuditLog.action == action)
        
        return query.count()

    def get_entity_history(self, entity_type: str, entity_id: int) -> list[AuditLog]:
        """Get complete history of changes for an entity"""
        return self.db.query(AuditLog).filter(
            AuditLog.entity_type == entity_type,
            AuditLog.entity_id == entity_id
        ).order_by(desc(AuditLog.created_at)).all()
