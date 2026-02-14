"""
Maps to MSSQL tables: Departments, DepOfficial
"""
from sqlalchemy import Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Department(Base):
    __tablename__ = "Departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    department: Mapped[str | None] = mapped_column(String(300))
    sign: Mapped[str | None] = mapped_column(String(5))
    IsDeleted: Mapped[bool | None] = mapped_column(Boolean)


class DepOfficial(Base):
    __tablename__ = "DepOfficial"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    dep_id: Mapped[int | None] = mapped_column(Integer)
    official: Mapped[str | None] = mapped_column(String(50))
    IsDeleted: Mapped[bool | None] = mapped_column(Boolean)
