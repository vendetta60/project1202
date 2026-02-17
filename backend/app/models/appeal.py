"""
Maps to MSSQL table: Appeals
"""
from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import DateTime, Integer, SmallInteger, String, Boolean, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AppealStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"


class AuditMixin:
    """Mixin for audit tracking fields"""
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[int | None] = mapped_column(Integer)
    created_by_name: Mapped[str | None] = mapped_column(String(100))
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, onupdate=datetime.utcnow)
    updated_by: Mapped[int | None] = mapped_column(Integer)
    updated_by_name: Mapped[str | None] = mapped_column(String(100))
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class Appeal(Base, AuditMixin):
    __tablename__ = "Appeals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    num: Mapped[int | None] = mapped_column(Integer)
    reg_num: Mapped[str | None] = mapped_column(String(50))
    reg_date: Mapped[datetime | None] = mapped_column(DateTime)
    sec_in_ap_num: Mapped[str | None] = mapped_column(String(50))
    in_ap_num: Mapped[str | None] = mapped_column(String(50))
    sec_in_ap_date: Mapped[datetime | None] = mapped_column(DateTime)
    in_ap_date: Mapped[datetime | None] = mapped_column(DateTime)
    dep_id: Mapped[int | None] = mapped_column(Integer)
    official_id: Mapped[int | None] = mapped_column(Integer)
    region_id: Mapped[int | None] = mapped_column(SmallInteger)
    person: Mapped[str | None] = mapped_column(String(200))
    email: Mapped[str | None] = mapped_column(String(20))
    content: Mapped[str | None] = mapped_column(Text)
    content_type_id: Mapped[int | None] = mapped_column(SmallInteger)
    account_index_id: Mapped[int | None] = mapped_column(SmallInteger)
    ap_index_id: Mapped[int | None] = mapped_column(SmallInteger)
    paper_count: Mapped[str | None] = mapped_column(String(20))
    exp_date: Mapped[datetime | None] = mapped_column(DateTime)
    who_control_id: Mapped[int | None] = mapped_column(Integer)
    instructions_id: Mapped[int | None] = mapped_column(SmallInteger)
    status: Mapped[int | None] = mapped_column(SmallInteger)
    InSection: Mapped[int | None] = mapped_column(Integer)
    IsExecuted: Mapped[bool | None] = mapped_column(Boolean)
    repetition: Mapped[bool | None] = mapped_column(Boolean)
    control: Mapped[bool | None] = mapped_column(Boolean)
    user_section_id: Mapped[int | None] = mapped_column(Integer)
    PC: Mapped[str | None] = mapped_column(String(20))
    PC_Tarixi: Mapped[datetime | None] = mapped_column(DateTime)
