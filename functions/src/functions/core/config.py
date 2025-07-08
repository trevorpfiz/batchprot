import secrets
from typing import Annotated, Any, List, Literal

from pydantic import AnyHttpUrl, BeforeValidator, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


def parse_cors(v: Any) -> List[str] | str:
    """A validator to parse a comma-separated string of CORS origins into a list."""
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    if isinstance(v, (list, str)):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    PROJECT_NAME: str = "BatchProt"
    PROJECT_DESCRIPTION: str = (
        "A FastAPI service for batch protein physicochemical properties analysis."
    )
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)

    ENVIRONMENT: Literal["dev", "prod"] = "dev"

    AUTH_BASE_URL: AnyHttpUrl = "http://localhost:3000"

    @computed_field
    @property
    def JWKS_URL(self) -> str:
        """Construct the full URL to the JWKS endpoint from the base URL."""
        return f"{str(self.AUTH_BASE_URL).rstrip('/')}/api/auth/jwks"

    BACKEND_CORS_ORIGINS: Annotated[List[AnyHttpUrl], BeforeValidator(parse_cors)] = []

    @computed_field
    @property
    def CORS_ORIGINS_STR(self) -> List[str]:
        """Return the CORS origins as a list of strings for the middleware."""
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS]


settings = Settings()
