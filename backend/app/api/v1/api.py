from fastapi import APIRouter

from app.api.v1.routers import (
    appeals,
    auth,
    citizens,
    executors,
    me,
    org_units,
    users,
    roles,
    military_units,
    appeal_types,
    lookups,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(me.router)
api_router.include_router(org_units.router)
api_router.include_router(users.router)
api_router.include_router(roles.router)
api_router.include_router(citizens.router)
api_router.include_router(appeals.router)
api_router.include_router(military_units.router)
api_router.include_router(executors.router)
api_router.include_router(appeal_types.router)
api_router.include_router(lookups.router)



