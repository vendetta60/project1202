"""
Maps to MSSQL table: AuditLogs
Stores all operations for audit trail
"""
from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, Integer, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AuditLog(Base):
    __tablename__ = "AuditLogs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    entity_type: Mapped[str] = mapped_column(String(50))  # e.g., "Appeal", "User", "Contact"
    entity_id: Mapped[int] = mapped_column(Integer)  # ID of the affected record
    action: Mapped[str] = mapped_column(String(20))  # CREATE, UPDATE, DELETE, READ
    description: Mapped[str | None] = mapped_column(String(500))  # Human readable description
    old_values: Mapped[str | None] = mapped_column(Text)  # JSON of old values
    new_values: Mapped[str | None] = mapped_column(Text)  # JSON of new values
    created_by: Mapped[int | None] = mapped_column(Integer)  # User who performed action
    created_by_name: Mapped[str | None] = mapped_column(String(100))  # Username for reference
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    ip_address: Mapped[str | None] = mapped_column(String(45))  # IPv4 or IPv6
    user_agent: Mapped[str | None] = mapped_column(String(500))  # Browser info
