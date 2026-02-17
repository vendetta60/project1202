"""
API router for audit logs
Only admins can view audit logs
"""
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, require_admin, get_audit_service
from app.models.user import User
from app.services.audit import AuditService
from app.schemas.audit_log import AuditLogListResponse

router = APIRouter(prefix="/audit-logs", tags=["audit"])


@router.get("", response_model=AuditLogListResponse)
def list_audit_logs(
    admin_user: User = Depends(require_admin),
    entity_type: str | None = None,
    entity_id: int | None = None,
    created_by: int | None = None,
    action: str | None = None,
    limit: int = 50,
    offset: int = 0,
    service: AuditService = Depends(get_audit_service),
):
    """Get audit logs - Admin only
    
    Can filter by:
    - entity_type: Appeal, User, Contact, etc.
    - entity_id: ID of the affected record
    - created_by: User ID who performed the action
    - action: CREATE, UPDATE, DELETE
    """
    items, total = service.list_logs(
        entity_type=entity_type,
        entity_id=entity_id,
        created_by=created_by,
        action=action,
        limit=limit,
        offset=offset,
    )
    return AuditLogListResponse(items=items, total=total, limit=limit, offset=offset)


@router.get("/{entity_type}/{entity_id}")
def get_entity_history(
    entity_type: str,
    entity_id: int,
    admin_user: User = Depends(require_admin),
    service: AuditService = Depends(get_audit_service),
):
    """Get complete change history for a specific entity - Admin only
    
    Shows all changes made to a record including who made them and when
    """
    logs = service.get_entity_history(entity_type, entity_id)
    return {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "history": logs,
        "total": len(logs),
    }
