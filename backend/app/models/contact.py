"""
Maps to MSSQL table: Contacts
"""
from datetime import datetime
from sqlalchemy import Integer, String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AuditMixin:
    """Mixin for audit tracking fields"""
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[int | None] = mapped_column(Integer)
    created_by_name: Mapped[str | None] = mapped_column(String(100))
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, onupdate=datetime.utcnow)
    updated_by: Mapped[int | None] = mapped_column(Integer)
    updated_by_name: Mapped[str | None] = mapped_column(String(100))
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class Contact(Base, AuditMixin):
    __tablename__ = "Contacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    appeal_id: Mapped[int | None] = mapped_column(Integer)
    contact: Mapped[str | None] = mapped_column(String(255))
