from pydantic import BaseModel


class AuthCheckResponse(BaseModel):
    message: str
    user_id: str


class ErrorResponse(BaseModel):
    detail: str


class HealthCheckResponse(BaseModel):
    status: str
