import secrets
from typing import List, Literal

from pydantic import AnyHttpUrl, TypeAdapter, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


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

    ENVIRONMENT: Literal["dev", "production"] = "dev"

    AUTH_BASE_URL: AnyHttpUrl = "http://localhost:3000"

    @computed_field
    @property
    def JWKS_URL(self) -> str:
        """Construct the full URL to the JWKS endpoint from the base URL."""
        return f"{str(self.AUTH_BASE_URL).rstrip('/')}/api/auth/jwks"

    BACKEND_CORS_ORIGINS: str = ""

    @computed_field
    @property
    def PARSED_CORS_ORIGINS(self) -> List[AnyHttpUrl]:
        """
        Parses the comma-separated BACKEND_CORS_ORIGINS string into a list of Pydantic URLs.
        """
        if not self.BACKEND_CORS_ORIGINS:
            return []

        urls = [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",")]

        url_list_validator = TypeAdapter(List[AnyHttpUrl])
        return url_list_validator.validate_python(urls)

    @computed_field
    @property
    def CORS_ORIGINS_STR(self) -> List[str]:
        """Return the CORS origins as a list of strings for the middleware."""
        return [str(origin).rstrip("/") for origin in self.PARSED_CORS_ORIGINS]


settings = Settings()
