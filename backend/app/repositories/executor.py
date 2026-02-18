from sqlalchemy.orm import Session

from app.models.executor import Executor, ExecutorList


class ExecutorRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_by_appeal(self, appeal_id: int) -> list[Executor]:
        from app.models.executor import ExecutorList, Direction
        query = self.db.query(
            Executor,
            ExecutorList.executor.label("executor_name"),
            Direction.direction.label("direction_name")
        ).outerjoin(
            ExecutorList, Executor.executor_id == ExecutorList.id
        ).outerjoin(
            Direction, Executor.direction_id == Direction.id
        ).filter(Executor.appeal_id == appeal_id)
        
        results = query.all()
        executors = []
        for executor, exec_name, dir_name in results:
            executor.executor_name = exec_name
            executor.direction_name = dir_name
            executors.append(executor)
        return executors

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
