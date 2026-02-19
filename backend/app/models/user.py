"""
Maps to MSSQL table: Users
"""
from datetime import datetime
from sqlalchemy import Boolean, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

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

    # Relationships for RBAC
    user_roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    user_permissions = relationship("UserPermission", back_populates="user", cascade="all, delete-orphan")

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

    def get_permissions(self) -> set[str]:
        """
        Get all permissions for this user (both from roles and individual permissions)
        Returns set of permission codes
        """
        permissions = set()

        # Collect permissions from all roles
        for user_role in self.user_roles:
            for role_permission in user_role.role.role_permissions:
                permissions.add(role_permission.permission.code)

        # Add/remove individual permissions
        for user_perm in self.user_permissions:
            if user_perm.grant_type == "grant":
                permissions.add(user_perm.permission.code)
            elif user_perm.grant_type == "deny":
                permissions.discard(user_perm.permission.code)

        return permissions

    def has_permission(self, permission_code: str) -> bool:
        """Check if user has a specific permission"""
        return permission_code in self.get_permissions()

    def has_any_permission(self, permission_codes: list[str]) -> bool:
        """Check if user has any of the given permissions"""
        user_perms = self.get_permissions()
        return any(code in user_perms for code in permission_codes)

    def has_all_permissions(self, permission_codes: list[str]) -> bool:
        """Check if user has all of the given permissions"""
        user_perms = self.get_permissions()
        return all(code in user_perms for code in permission_codes)

    @property
    def password_hash(self) -> str | None:
        return self.password