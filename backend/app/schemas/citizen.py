from pydantic import BaseModel, Field
from datetime import datetime


class CitizenBase(BaseModel):
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    fin: str = Field(..., min_length=7, max_length=7)
    phone: str | None = Field(None, max_length=50)
    address: str | None = Field(None, max_length=255)


class CitizenCreate(CitizenBase):
    pass


class CitizenUpdate(BaseModel):
    first_name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    fin: str | None = Field(None, min_length=7, max_length=7)
    phone: str | None = Field(None, max_length=50)
    address: str | None = Field(None, max_length=255)


class CitizenSchema(CitizenBase):
    id: int
    created_at: datetime
    updated_at: datetime | None = None
    is_deleted: bool

    model_config = {"from_attributes": True}


class CitizenListResponse(BaseModel):
    items: list[CitizenSchema]
    total: int
