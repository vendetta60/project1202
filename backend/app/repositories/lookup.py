from sqlalchemy.orm import Session

from app.models.lookup import ReportIndex, AppealIndex


class ReportIndexRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self) -> list[ReportIndex]:
        return self.db.query(ReportIndex).order_by(ReportIndex.id.asc()).all()

    def get(self, idx_id: int) -> ReportIndex | None:
        return self.db.get(ReportIndex, idx_id)

    def create(self, obj: ReportIndex) -> ReportIndex:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: ReportIndex) -> ReportIndex:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: ReportIndex) -> None:
        self.db.delete(obj)
        self.db.commit()


class AppealIndexRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self) -> list[AppealIndex]:
        return self.db.query(AppealIndex).order_by(AppealIndex.id.asc()).all()

    def get(self, idx_id: int) -> AppealIndex | None:
        return self.db.get(AppealIndex, idx_id)

    def create(self, obj: AppealIndex) -> AppealIndex:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: AppealIndex) -> AppealIndex:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: AppealIndex) -> None:
        self.db.delete(obj)
        self.db.commit()
