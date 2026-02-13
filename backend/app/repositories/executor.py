from sqlalchemy.orm import Session

from app.models.executor import Executor


class ExecutorRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_by_org_unit(self, org_unit_id: int) -> list[Executor]:
        return (
            self.db.query(Executor)
            .filter(Executor.org_unit_id == org_unit_id)
            .order_by(Executor.full_name.asc())
            .all()
        )

    def create(self, obj: Executor) -> Executor:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

