"""Central configuration loaded from environment variables."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database (MongoDB). Local docker default; override in prod (Atlas).
    mongo_uri: str = "mongodb://db:27017"
    mongo_db: str = "portfolio"

    # Auth — one JWT secret, per-section passwords.
    jwt_secret: str = "change-me-to-a-long-random-string"
    admin_password: str = "admin123"
    notes_password: str = "notes123"
    resume_password: str = "resume123"
    option_password: str = "option123"

    # CORS — comma-separated origins, or "*"
    cors_origins: str = "*"

    # Resume builder — generated file output + email
    output_dir: str = "/app/output"
    # Brevo HTTP API (works on hosts that block SMTP, e.g. Render free)
    brevo_api_key: str = ""
    # SMTP (fallback; needs a host that allows outbound SMTP)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_pass: str = ""
    from_email: str = ""
    from_name: str = "Job Application"

    @property
    def cors_list(self) -> list[str]:
        return ["*"] if self.cors_origins.strip() == "*" else [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    def password_for(self, role: str) -> str | None:
        return {
            "admin": self.admin_password,
            "notes": self.notes_password,
            "resume": self.resume_password,
            "option": self.option_password,
        }.get(role)


settings = Settings()
