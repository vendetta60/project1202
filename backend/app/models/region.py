"""
Maps to MSSQL table: Regions
"""
from sqlalchemy import Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Region(Base):
    __tablename__ = "Regions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    region: Mapped[str | None] = mapped_column(String(100))
    IsDeleted: Mapped[bool | None] = mapped_column(Boolean)
