from fastapi import APIRouter, status

from functions.schemas.api import HealthCheckResponse

router = APIRouter()


@router.get("", response_model=HealthCheckResponse, status_code=status.HTTP_200_OK)
def read_root():
    return HealthCheckResponse(status="ok")
