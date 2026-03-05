from __future__ import annotations

from fastapi import APIRouter, Depends, Request, status
from pydantic import BaseModel, Field

from app.api.deps import get_current_user, get_audit_service
from app.models.user import User
from app.services.audit import AuditService


router = APIRouter(prefix="/feedback", tags=["feedback"])


class FeedbackCreate(BaseModel):
    """User feedback payload (təklif və iradlar)."""

    message: str = Field(..., min_length=3, max_length=1000, description="Təklif və ya irad mətni")
    category: str | None = Field(
        default=None,
        description="Kateqoriya, məsələn: 'təklif', 'irad', 'digər'",
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_feedback(
    payload: FeedbackCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    audit: AuditService = Depends(get_audit_service),
):
    """
    İstifadəçilərin \"Təklif və iradlar\" bölməsindən göndərdiyi mesajları qeyd edir.

    Məlumatlar `AuditLogs` cədvəlinə `entity_type='Feedback'` kimi yazılır və
    admin/superadminlər tərəfindən audit logları ekranından izlənilə bilər.
    """

    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")

    category = (payload.category or "feedback").strip()
    category_prefix = category.upper()

    # SQL Server-də AuditLogs.description sahəsi məhduddur (Unicode(500)).
    # Ona görə çox uzun mesajları burda kəsirik ki, "data would be truncated" xətası olmasın.
    raw_description = f"[{category_prefix}] {payload.message}"
    max_len = 480  # kiçik buffer saxlayırıq
    if len(raw_description) > max_len:
        description = raw_description[: max_len - 3] + "..."
    else:
        description = raw_description

    # Additional structured info for easier analiz
    new_values = {
        "category": category,
        "message": payload.message,
        "username": current_user.username,
        "user_id": current_user.id,
    }

    audit.log_action(
        entity_type="Feedback",
        entity_id=current_user.id,
        action="CREATE",
        current_user=current_user,
        description=description,
        new_values=new_values,
        ip_address=ip,
        user_agent=ua,
    )

    return {"status": "success"}

