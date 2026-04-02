from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.bootstrap_superadmin import run_bootstrap_superadmin
from app.db.migrate_must_change_password import run_migrate_must_change_password
from app import models  # noqa: F401 — ensure all models are loaded


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)

    @app.on_event("startup")
    def _run_startup_migrations():
        run_migrate_must_change_password()
        run_bootstrap_superadmin()

    origins = [o.strip() for o in settings.cors_allow_origins.split(",") if o.strip()]
    if origins:
        allow_credentials = True
        if "*" in origins:
            origins = ["*"]
            allow_credentials = False
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=allow_credentials,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.get("/health")
    def health():
        return {"status": "ok"}

    # No create_all — we are using an existing MSSQL database with data.
    # Superadmin bootstrap: env ilə aktivləşir (bootstrap_superadmin_*), bax: app/db/bootstrap_superadmin.py

    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()
