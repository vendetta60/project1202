from fastapi import HTTPException

from app.models.citizen import Citizen
from app.repositories.citizen import CitizenRepository
from app.schemas.citizen import CitizenCreate, CitizenUpdate


class CitizenService:
    def __init__(self, repo: CitizenRepository):
        self.repo = repo

    def list(self, q: str | None, limit: int, offset: int) -> list[Citizen]:
        return self.repo.list(q=q, limit=min(limit, 200), offset=offset)

    def get(self, citizen_id: int) -> Citizen:
        obj = self.repo.get(citizen_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Citizen not found")
        return obj

    def create(self, payload: CitizenCreate) -> Citizen:
        if payload.fin:
            if self.repo.get_by_fin(payload.fin):
                raise HTTPException(status_code=409, detail="Citizen with this FIN already exists")
        obj = Citizen(**payload.model_dump())
        return self.repo.create(obj)

    def update(self, citizen_id: int, payload: CitizenUpdate) -> Citizen:
        obj = self.get(citizen_id)
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(obj, k, v)
        return self.repo.save(obj)

