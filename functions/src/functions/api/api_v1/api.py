from fastapi import APIRouter

from functions.api.api_v1.endpoints import auth_check, health, protein_analysis

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(protein_analysis.router, prefix="/analyze", tags=["analysis"])
api_router.include_router(auth_check.router, prefix="/auth-check", tags=["auth"])
