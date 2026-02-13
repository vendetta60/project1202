from sqlalchemy.orm import Session

from app.models.military_unit import MilitaryUnit
from app.models.appeal_type import AppealType
from app.models.lookup import ReportIndex, AppealIndex


MILITARY_UNITS = [
    "N-saylı hərbi hissə (Bakı)",
    "N-saylı hərbi hissə (Gəncə)",
    "N-saylı hərbi hissə (Naxçıvan)",
    "N-saylı hərbi hissə (Bərdə)",
    "N-saylı hərbi hissə (Lənkəran)",
    "N-saylı hərbi hissə (Şəmkir)",
]

APPEAL_TYPES = [
    "Şikayət",
    "Təklif",
    "Müraciət",
    "Ərizə",
    "Sorğu",
]

REPORT_INDEXES = [
    "01-01",
    "02-05",
    "03-10",
    "04-15",
]

APPEAL_INDEXES = [
    "A-123",
    "B-456",
    "C-789",
]


def bootstrap_params(db: Session) -> None:
    """Seed initial parameter data if tables are empty."""
    # Military units
    existing_units = db.query(MilitaryUnit).count()
    if existing_units == 0:
        for name in MILITARY_UNITS:
            db.add(MilitaryUnit(name=name))
        db.commit()
        print(f"Seeded {len(MILITARY_UNITS)} military units")

    # Appeal types
    existing_types = db.query(AppealType).count()
    if existing_types == 0:
        for name in APPEAL_TYPES:
            db.add(AppealType(name=name))
        db.commit()
        print(f"Seeded {len(APPEAL_TYPES)} appeal types")

    # Report indexes
    existing_reports = db.query(ReportIndex).count()
    if existing_reports == 0:
        for name in REPORT_INDEXES:
            db.add(ReportIndex(name=name))
        db.commit()
        print(f"Seeded {len(REPORT_INDEXES)} report indexes")

    # Appeal indexes
    existing_appeals = db.query(AppealIndex).count()
    if existing_appeals == 0:
        for name in APPEAL_INDEXES:
            db.add(AppealIndex(name=name))
        db.commit()
        print(f"Seeded {len(APPEAL_INDEXES)} appeal indexes")
