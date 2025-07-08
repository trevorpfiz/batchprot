import logging

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from mangum import Mangum

from functions.api.api_v1.api import api_router as api_v1_router
from functions.core.config import settings


def custom_generate_unique_id(route: APIRoute) -> str:
    """
    Generates a custom OpenAPI unique ID for each route.
    This makes the generated client code more predictable.
    """
    # Use the route's name, which is derived from the function name
    return f"{route.tags[0]}-{route.name}"


# A separate router for the root/info endpoint
info_router = APIRouter()


@info_router.get("/", status_code=200, include_in_schema=False)
async def info() -> dict[str, str]:
    return {"status": "ok"}


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
    root_path=f"/{settings.ENVIRONMENT}" if settings.ENVIRONMENT == "prod" else "",
    json_encoder=None,  # Use FastAPI's default JSON encoder
)

# Configure logging
if settings.ENVIRONMENT == "dev":
    logger = logging.getLogger("uvicorn")
    logger.warning(
        "Running in development mode - CORS is configured to allow all origins."
    )

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS_STR,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_v1_router, prefix=settings.API_V1_STR)
app.include_router(info_router, tags=[""])


# Create handler for AWS Lambda with specific configuration
handler = Mangum(app, api_gateway_base_path=None, lifespan="off")
