import logging
from typing import Any

from jose import JWTError, jwt
from pydantic import BaseModel

from functions.core.config import settings

logger = logging.getLogger(__name__)


class TokenData(BaseModel):
    sub: str | None = None


async def get_jwks() -> list[dict[str, Any]]:
    """
    Retrieve the JSON Web Key Set (JWKS) from the authentication server.

    NOTE: In a production environment, this should be cached to improve performance.
    For simplicity in this example, we are fetching it on each request that needs it.
    """
    import httpx

    async with httpx.AsyncClient() as client:
        response = await client.get(settings.JWKS_URL)
        response.raise_for_status()
        return response.json()["keys"]


async def get_public_key(token: str) -> dict[str, Any] | None:
    """Find the appropriate public key from the JWKS to verify the token's signature."""
    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            return None

        jwks = await get_jwks()
        for key_dict in jwks:
            if key_dict.get("kid") == kid:
                return key_dict
        return None
    except JWTError:
        return None


async def verify_token(token: str) -> str | None:
    """
    Verify the JWT token using the remote JWKS from better-auth.
    """
    try:
        public_key = await get_public_key(token)
        if not public_key:
            return None

        payload = jwt.decode(
            token,
            public_key,
            algorithms=["EdDSA"],  # `better-auth` defaults to EdDSA
            issuer=str(settings.AUTH_BASE_URL),
            audience=str(settings.AUTH_BASE_URL),
        )
        token_data = TokenData(sub=payload.get("sub"))
        return token_data.sub
    except JWTError as e:
        logger.error("Token validation failed: %s", e)
        return None


class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code
