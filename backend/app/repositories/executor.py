from sqlalchemy.orm import Session

from app.models.executor import Executor, ExecutorList


class ExecutorRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_by_appeal(self, appeal_id: int) -> list[Executor]:
        return self.db.query(Executor).filter(Executor.appeal_id == appeal_id).all()

    def get(self, executor_id: int) -> Executor | None:
        return self.db.get(Executor, executor_id)

    def create(self, obj: Executor) -> Executor:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def save(self, obj: Executor) -> Executor:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def list_executor_names(self, active_only: bool = True) -> list[ExecutorList]:
        query = self.db.query(ExecutorList)
        if active_only:
            query = query.filter(
                (ExecutorList.IsDeleted == False) | (ExecutorList.IsDeleted == None)
            )
        return query.all()
