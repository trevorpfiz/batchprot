from fastapi import APIRouter, Depends, status

from functions.api.deps import get_current_user
from functions.schemas.api import AuthCheckResponse, ErrorResponse

router = APIRouter()


@router.get(
    "/",
    response_model=AuthCheckResponse,
    status_code=status.HTTP_200_OK,
    responses={401: {"model": ErrorResponse}},
)
async def check_auth(user_id: str = Depends(get_current_user)):
    """Secured endpoint to check authentication."""
    return AuthCheckResponse(message="You are authenticated!", user_id=user_id)
