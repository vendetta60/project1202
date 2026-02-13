from __future__ import annotations

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class OrgUnit(Base):
    """
    Hierarchical organization unit.
    Example:
      - Ministry (root)
        - Baş idarə
          - İdarə / şöbə
    """

    __tablename__ = "org_units"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), index=True)

    parent_id: Mapped[int | None] = mapped_column(ForeignKey("org_units.id"), index=True)
    parent: Mapped["OrgUnit | None"] = relationship(
        "OrgUnit",
        remote_side="OrgUnit.id",
        back_populates="children",
    )
    children: Mapped[list[OrgUnit]] = relationship(
        "OrgUnit",
        back_populates="parent",
        cascade="all, delete-orphan",
    )


