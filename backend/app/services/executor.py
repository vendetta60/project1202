from fastapi import HTTPException

from app.models.executor import Executor
from app.repositories.executor import ExecutorRepository


class ExecutorService:
    def __init__(self, repo: ExecutorRepository):
        self.repo = repo

    def list_by_org_unit(self, org_unit_id: int) -> list[Executor]:
        return self.repo.list_by_org_unit(org_unit_id)

    def create(self, full_name: str, org_unit_id: int) -> Executor:
        full_name = full_name.strip()
        if not full_name:
            raise HTTPException(status_code=400, detail="Executor name cannot be empty")

        executor = Executor(full_name=full_name, org_unit_id=org_unit_id)
        return self.repo.create(executor)

