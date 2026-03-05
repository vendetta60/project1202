from sqlalchemy.orm import Session, joinedload

from app.models.executor import Executor, ExecutorList


class ExecutorRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_by_appeal(self, appeal_id: int) -> list[Executor]:
        """
        Return all executors for a given appeal.

        Executor model already has relationships + properties:
        - executor_name -> ExecutorList.executor
        - direction_name -> Direction.direction

        Ona görə ayrıca manual field yazmağa ehtiyac yoxdur, yalnız
        joinedload ilə əlaqələri eager-load etmək kifayətdir.
        """
        from app.models.executor import Direction

        query = (
            self.db.query(Executor)
            .options(
                joinedload(Executor.executor_list),
                joinedload(Executor.direction),
            )
            .filter(Executor.appeal_id == appeal_id)
        )
        return query.all()

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
