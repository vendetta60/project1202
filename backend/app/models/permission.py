"""
Permission model for RBAC system
Maps to MSSQL table: Permissions
"""
from datetime import datetime
from sqlalchemy import Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Permission(Base):
    """
    Defines an action that can be performed in the system.
    Examples: 'view_appeals', 'create_appeal', 'edit_user', 'delete_appeal', etc.
    """
    __tablename__ = "Permissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)  # e.g., 'view_appeals'
    name: Mapped[str] = mapped_column(String(150), nullable=False)  # e.g., 'View Appeals'
    description: Mapped[str | None] = mapped_column(Text)  # Detailed description
    category: Mapped[str | None] = mapped_column(String(50))  # e.g., 'appeals', 'users', 'reports'
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    role_permissions = relationship("RolePermission", back_populates="permission")
    user_permissions = relationship("UserPermission", back_populates="permission")


class Role(Base):
    """
    Predefined role that contains a set of permissions.
    Examples: 'Admin', 'Appeal Manager', 'Report Viewer', etc.
    """
    __tablename__ = "Roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)  # e.g., 'Admin'
    description: Mapped[str | None] = mapped_column(Text)
    permissions: Mapped[str] = mapped_column(Text, default="", nullable=False)  # Legacy field for compatibility
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)  # System roles cannot be deleted
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    role_permissions = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan")
    user_roles = relationship("UserRole", back_populates="role", cascade="all, delete-orphan")


class RolePermission(Base):
    """
    Junction table: links Roles to Permissions (many-to-many)
    """
    __tablename__ = "RolePermissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    role_id: Mapped[int] = mapped_column(Integer, ForeignKey("Roles.id"), nullable=False)
    permission_id: Mapped[int] = mapped_column(Integer, ForeignKey("Permissions.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    role = relationship("Role", back_populates="role_permissions")
    permission = relationship("Permission", back_populates="role_permissions")


class UserRole(Base):
    """
    Junction table: links Users to Roles (many-to-many)
    A user can have multiple roles
    """
    __tablename__ = "UserRoles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("Users.id"), nullable=False)
    role_id: Mapped[int] = mapped_column(Integer, ForeignKey("Roles.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="user_roles")
    role = relationship("Role", back_populates="user_roles")


class UserPermission(Base):
    """
    Individual permission for a user (in addition to role-based permissions)
    Allows granular, user-specific permission overrides
    """
    __tablename__ = "UserPermissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("Users.id"), nullable=False)
    permission_id: Mapped[int] = mapped_column(Integer, ForeignKey("Permissions.id"), nullable=False)
    grant_type: Mapped[str] = mapped_column(String(10))  # 'grant' or 'deny'
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[int | None] = mapped_column(Integer)

    # Relationships
    user = relationship("User", back_populates="user_permissions")
    permission = relationship("Permission", back_populates="user_permissions")


class PermissionGroup(Base):
    """
    Template group of related permissions (e.g., 'Appeals Manager', 'Citizen Support Rep')
    Used for quick assignment of multiple permissions at once
    """
    __tablename__ = "PermissionGroups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)  # e.g., 'Appeals Manager'
    description: Mapped[str | None] = mapped_column(Text)
    is_template: Mapped[bool] = mapped_column(Boolean, default=True)  # True if it's a predefined template
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    permission_group_items = relationship("PermissionGroupItem", back_populates="group", cascade="all, delete-orphan")


class PermissionGroupItem(Base):
    """
    Junction table: links PermissionGroups to Permissions (many-to-many)
    """
    __tablename__ = "PermissionGroupItems"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    group_id: Mapped[int] = mapped_column(Integer, ForeignKey("PermissionGroups.id"), nullable=False)
    permission_id: Mapped[int] = mapped_column(Integer, ForeignKey("Permissions.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    group = relationship("PermissionGroup", back_populates="permission_group_items")
    permission = relationship("Permission")
