from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.bootstrap import bootstrap_admin
from app.core.bootstrap_roles import bootstrap_roles
from app.core.bootstrap_params import bootstrap_params
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app import models  # noqa: F401


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)

    origins = [o.strip() for o in settings.cors_allow_origins.split(",") if o.strip()]
    if origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.on_event("startup")
    def on_startup():
        # For initial scaffold we create tables automatically.
        # Later you can replace this with Alembic migrations.
        Base.metadata.create_all(bind=engine)
        # Optional first-run admin/bootstrap (if DB has no users, roles not created)
        db = SessionLocal()
        try:
            bootstrap_admin(db)
            bootstrap_roles(db)
            bootstrap_params(db)
        finally:
            db.close()

    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()


