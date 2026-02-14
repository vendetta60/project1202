"""
Maps to MSSQL table: Organs
"""
from sqlalchemy import Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Organ(Base):
    __tablename__ = "Organs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    Orqan: Mapped[str | None] = mapped_column(String(150))
    Nov: Mapped[int | None] = mapped_column(Integer)
    isDeleted: Mapped[bool | None] = mapped_column(Boolean)
