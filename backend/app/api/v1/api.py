from fastapi import APIRouter

from app.api.v1.routers import (
    appeals,
    auth,
    me,
    users,
    lookups,
    reports,
    audit,
    citizens,
    permissions,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(me.router)
api_router.include_router(users.router)
api_router.include_router(permissions.router)
api_router.include_router(appeals.router)
api_router.include_router(lookups.router)
api_router.include_router(reports.router)
api_router.include_router(audit.router)
api_router.include_router(citizens.router)
