from sqlalchemy import Boolean, String, Text, JSON, Table, Column, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


# Association table for many-to-many relationship between users and roles
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    
    # JSON field storing list of permission strings
    # Example: ["users:create", "users:edit", "appeals:view", "appeals:edit"]
    permissions: Mapped[list] = mapped_column(JSON, default=list)
    
    # System roles cannot be deleted
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Many-to-many relationship with users
    users = relationship("User", secondary=user_roles, back_populates="roles")
