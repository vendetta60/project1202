"""
Maps to MSSQL table: Contacts
"""
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Contact(Base):
    __tablename__ = "Contacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    appeal_id: Mapped[int | None] = mapped_column(Integer)
    contact: Mapped[str | None] = mapped_column(String(15))
