"""
Maps to MSSQL lookup tables: AccountIndex, ApIndex, ApStatus, ContentTypes,
ChiefInstructions, InSections, Sections, WhoControl, Movzular, Holiday
"""
from datetime import datetime

from sqlalchemy import DateTime, Integer, SmallInteger, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AccountIndex(Base):
    __tablename__ = "AccountIndex"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    account_index: Mapped[str | None] = mapped_column(String(300))
    IsDeleted: Mapped[bool | None] = mapped_column(Boolean)
    account_order: Mapped[int | None] = mapped_column(Integer)


class ApIndex(Base):
    __tablename__ = "ApIndex"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ap_index_id: Mapped[int] = mapped_column(Integer)
    ap_index: Mapped[str | None] = mapped_column(String(300))
    IsDeleted: Mapped[bool | None] = mapped_column(Boolean)


class ApStatus(Base):
    __tablename__ = "ApStatus"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    status: Mapped[str | None] = mapped_column(String(50))
    IsDeleted: Mapped[bool | None] = mapped_column(Boolean)


class ContentType(Base):
    __tablename__ = "ContentTypes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content_type: Mapped[str | None] = mapped_column(String(50))
    IsDeleted: Mapped[bool | None] = mapped_column(Boolean)


class ChiefInstruction(Base):
    __tablename__ = "ChiefInstructions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    instructions: Mapped[str | None] = mapped_column(String(300))
    IsDeleted: Mapped[bool | None] = mapped_column(Boolean)
    section_id: Mapped[int | None] = mapped_column(Integer)


class InSection(Base):
    __tablename__ = "InSections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    section: Mapped[str | None] = mapped_column(String(300))
    IsDeleted: Mapped[bool | None] = mapped_column(Boolean)


class Section(Base):
    __tablename__ = "Sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    section: Mapped[str | None] = mapped_column(String(300))
    IsDeleted: Mapped[bool | None] = mapped_column(Boolean)


class UserSection(Base):
    __tablename__ = "UserSections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_section: Mapped[str | None] = mapped_column(String(50))
    section_index: Mapped[int | None] = mapped_column(Integer)


class WhoControl(Base):
    __tablename__ = "WhoControl"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    chief: Mapped[str | None] = mapped_column(String(300))
    IsDeleted: Mapped[bool | None] = mapped_column(Boolean)
    section_id: Mapped[int | None] = mapped_column(Integer)


class Movzu(Base):
    __tablename__ = "Movzular"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    Movzu: Mapped[str | None] = mapped_column(String(250))


class Holiday(Base):
    __tablename__ = "Holidays"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str | None] = mapped_column(String(200))
    start_date: Mapped[datetime | None] = mapped_column(DateTime)
    end_date: Mapped[datetime | None] = mapped_column(DateTime)
    IsDeleted: Mapped[bool | None] = mapped_column(Boolean, default=False)
