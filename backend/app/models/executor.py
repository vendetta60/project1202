from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Executor(Base):
    """
    Person to whom an appeal is assigned for execution, bound to a specific org unit (şöbə).
    """

    __tablename__ = "executors"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255))

    org_unit_id: Mapped[int] = mapped_column(ForeignKey("org_units.id"), index=True)
    org_unit = relationship("OrgUnit")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

