"""
Maps to MSSQL table: Users
"""
from datetime import datetime
from sqlalchemy import Boolean, Integer, String, ForeignKey, DateTime
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


class User(Base, AuditMixin):
    __tablename__ = "Users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    surname: Mapped[str | None] = mapped_column(String(50))
    name: Mapped[str | None] = mapped_column(String(50))
    username: Mapped[str | None] = mapped_column(String(50))
    password: Mapped[str | None] = mapped_column(String(64))
    section_id: Mapped[int | None] = mapped_column(Integer)

    # Tab permissions
    tab1: Mapped[bool | None] = mapped_column(Boolean)
    tab2: Mapped[bool | None] = mapped_column(Boolean)
    tab3: Mapped[bool | None] = mapped_column(Boolean)
    tab4: Mapped[bool | None] = mapped_column(Boolean)
    tab5: Mapped[bool | None] = mapped_column(Boolean)

    # Button permissions
    but1: Mapped[bool | None] = mapped_column(Boolean)
    but2: Mapped[bool | None] = mapped_column(Boolean)
    but3: Mapped[bool | None] = mapped_column(Boolean)
    but4: Mapped[bool | None] = mapped_column(Boolean)
    but5: Mapped[bool | None] = mapped_column(Boolean)
    but6: Mapped[bool | None] = mapped_column(Boolean)
    but7: Mapped[bool | None] = mapped_column(Boolean)
    but8: Mapped[bool | None] = mapped_column(Boolean)
    but9: Mapped[bool | None] = mapped_column(Boolean)
    but10: Mapped[bool | None] = mapped_column(Boolean)
    but11: Mapped[bool | None] = mapped_column(Boolean)
    but12: Mapped[bool | None] = mapped_column(Boolean)
    but13: Mapped[bool | None] = mapped_column(Boolean)
    but14: Mapped[bool | None] = mapped_column(Boolean)
    but15: Mapped[bool | None] = mapped_column(Boolean)
    but16: Mapped[bool | None] = mapped_column(Boolean)
    but17: Mapped[bool | None] = mapped_column(Boolean)
    but18: Mapped[bool | None] = mapped_column(Boolean)
    but19: Mapped[bool | None] = mapped_column(Boolean)
    but20: Mapped[bool | None] = mapped_column(Boolean)
    but21: Mapped[bool | None] = mapped_column(Boolean)
    but22: Mapped[bool | None] = mapped_column(Boolean)
    but23: Mapped[bool | None] = mapped_column(Boolean)
    but24: Mapped[bool | None] = mapped_column(Boolean)
    but25: Mapped[bool | None] = mapped_column(Boolean)

    @property
    def full_name(self) -> str | None:
        parts = [self.surname, self.name]
        return " ".join(p for p in parts if p) or None

    @property
    def is_admin(self) -> bool:
        """tab1 = admin panel access"""
        return bool(self.tab1)

    @property
    def is_active(self) -> bool:
        return True

    @property
    def password_hash(self) -> str | None:
        return self.password