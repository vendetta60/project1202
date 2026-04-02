from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Vətəndaş müraciətlərinin elektron qeydiyyatı"
    env: str = "dev"

    database_url: str = "sqlite:///./app.db"

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_minutes: int = 7 * 24 * 60

    # CORS (comma-separated origins). Use "*" only in dev.
    cors_allow_origins: str = "*"

    # First-run bootstrap (optional): create an initial admin user if no users exist.
    bootstrap_admin_username: str | None = None
    bootstrap_admin_password: str | None = None
    bootstrap_admin_full_name: str | None = None

    # Startup bootstrap: env superadmini Users-də yaradır/yeniləyir (şifrə + admin bayraqları).
    # Parol: BOOTSTRAP_SUPERADMIN_PASSWORD və ya (fallback) BOOTSTRAP_ADMIN_PASSWORD.
    bootstrap_superadmin_enabled: bool = True
    bootstrap_superadmin_username: str = "superadmin"
    bootstrap_superadmin_password: str | None = None
    bootstrap_superadmin_surname: str = "Super"
    bootstrap_superadmin_name: str = "Admin"

    model_config = SettingsConfigDict(
        env_file=("env", ".env", "backend/env", "backend/.env"),
        env_prefix="",
        case_sensitive=False,
    )


settings = Settings()


