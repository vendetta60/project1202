from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AppealStatus(str, enum.Enum):
    """
    Execution-oriented status for an appeal lifecycle.
    """

    pending = "pending"         # Qeydiyyata alınıb, icraya verilməyib
    in_progress = "in_progress" # İcradadır
    completed = "completed"     # İcra olunub


class Appeal(Base):
    __tablename__ = "appeals"

    id: Mapped[int] = mapped_column(primary_key=True)
    reg_no: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    subject: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    summary: Mapped[str | None] = mapped_column(Text)
    appeal_type: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[AppealStatus] = mapped_column(Enum(AppealStatus), default=AppealStatus.pending)

    citizen_id: Mapped[int] = mapped_column(ForeignKey("citizens.id"), index=True)
    citizen: Mapped["Citizen"] = relationship("Citizen")

    org_unit_id: Mapped[int] = mapped_column(ForeignKey("org_units.id"), index=True)
    org_unit: Mapped["OrgUnit"] = relationship("OrgUnit", foreign_keys=[org_unit_id])

    # Execution is assigned to a specific department (şöbə) under the same top-level org unit.
    executor_org_unit_id: Mapped[int | None] = mapped_column(
        ForeignKey("org_units.id"), index=True, nullable=True
    )
    executor_org_unit: Mapped["OrgUnit | None"] = relationship(
        "OrgUnit", foreign_keys=[executor_org_unit_id]
    )

    # Person responsible for execution (optional)
    executor_id: Mapped[int | None] = mapped_column(ForeignKey("executors.id"), index=True, nullable=True)
    executor: Mapped["Executor | None"] = relationship("Executor")

    created_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True)
    created_by: Mapped["User | None"] = relationship("User")

    # Business dates
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    execution_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Additional fields from desktop app
    report_index: Mapped[str | None] = mapped_column(String(100))
    appeal_index: Mapped[str | None] = mapped_column(String(100))
    page_count: Mapped[int | None] = mapped_column(Integer)
    chairman_decision_number: Mapped[str | None] = mapped_column(String(100))
    chairman_decision_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    incoming_appeal_number: Mapped[str | None] = mapped_column(String(100))
    incoming_appeal_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    related_appeal_number: Mapped[str | None] = mapped_column(String(100))
    related_appeal_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    appeal_submitter_role: Mapped[str | None] = mapped_column(String(255))
    citizen_email: Mapped[str | None] = mapped_column(String(255))
    is_transferred: Mapped[bool] = mapped_column(Boolean, default=False)

    # New fields added for appeals
    registration_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    registration_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    execution_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    originating_military_unit: Mapped[str | None] = mapped_column(String(255))
    leader_decision: Mapped[str | None] = mapped_column(String(255))
    other_military_unit_number: Mapped[str | None] = mapped_column(String(100))
    other_institution_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    incoming_appeal_number: Mapped[str | None] = mapped_column(String(100))
    incoming_appeal_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    originating_institution: Mapped[str | None] = mapped_column(String(255))
    appeal_submitter: Mapped[str | None] = mapped_column(String(255))
    submitter_full_name: Mapped[str | None] = mapped_column(String(255))
    submitter_saa: Mapped[str | None] = mapped_column(String(100))
    address: Mapped[str | None] = mapped_column(String(255))
    appeal_review_status: Mapped[str | None] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255))
    phone_number: Mapped[str | None] = mapped_column(String(50))
    is_repeat_appeal: Mapped[bool] = mapped_column(Boolean, default=False)
    reviewed_by: Mapped[str | None] = mapped_column(String(255))
    is_under_supervision: Mapped[bool] = mapped_column(Boolean, default=False)
    short_content: Mapped[str | None] = mapped_column(Text)
    appeal_type: Mapped[str | None] = mapped_column(String(100))
    report_index: Mapped[str | None] = mapped_column(String(100))
    appeal_index: Mapped[str | None] = mapped_column(String(100))

    # Technical timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


