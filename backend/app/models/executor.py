"""
Maps to MSSQL tables: Direction, ExecutorList, Executors
"""
from datetime import datetime

from sqlalchemy import DateTime, Integer, SmallInteger, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Direction(Base):
    """İstiqamətlər"""
    __tablename__ = "Direction"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    direction: Mapped[str | None] = mapped_column(String(50))
    IsDeleted: Mapped[bool | None] = mapped_column(Boolean)
    section_id: Mapped[int | None] = mapped_column(Integer)


class ExecutorList(Base):
    """İcraçılar siyahısı"""
    __tablename__ = "ExecutorList"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    direction_id: Mapped[int | None] = mapped_column(Integer)
    executor: Mapped[str | None] = mapped_column(String(50))
    IsDeleted: Mapped[bool | None] = mapped_column(Boolean)


class Executor(Base):
    """Appeal-a bağlı icraçılar"""
    __tablename__ = "Executors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    appeal_id: Mapped[int | None] = mapped_column(Integer)
    direction_id: Mapped[int | None] = mapped_column(Integer)
    executor_id: Mapped[int | None] = mapped_column(Integer)
    out_num: Mapped[str | None] = mapped_column(String(50))
    out_date: Mapped[datetime | None] = mapped_column(DateTime)
    attach_num: Mapped[str | None] = mapped_column(String(50))
    attach_paper_num: Mapped[str | None] = mapped_column(String(50))
    r_prefix: Mapped[int | None] = mapped_column(SmallInteger)
    r_num: Mapped[str | None] = mapped_column(String(50))
    r_date: Mapped[datetime | None] = mapped_column(DateTime)
    posted_sec: Mapped[str | None] = mapped_column(String(300))
    active: Mapped[bool | None] = mapped_column(Boolean)
    is_primary: Mapped[bool | None] = mapped_column(Boolean, default=False)  # Əsas icraçı işarəsi
    PC: Mapped[str | None] = mapped_column(String(35))
    PC_Tarixi: Mapped[datetime | None] = mapped_column(DateTime)
