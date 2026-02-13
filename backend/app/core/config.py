from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MuracietQeydiyyat"
    env: str = "dev"

    database_url: str = "sqlite:///./app.db"

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 480

    # CORS (comma-separated origins). Use "*" only in dev.
    cors_allow_origins: str = "*"

    # First-run bootstrap (optional): create an initial admin user if no users exist.
    bootstrap_admin_username: str | None = None
    bootstrap_admin_password: str | None = None
    bootstrap_admin_full_name: str | None = None

    model_config = SettingsConfigDict(
        env_file=("env", ".env", "backend/env", "backend/.env"),
        env_prefix="",
        case_sensitive=False,
    )


settings = Settings()


