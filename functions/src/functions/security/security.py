import logging
from typing import Any

import jwt  # PyJWT
from pydantic import BaseModel

from functions.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TokenData(BaseModel):
    sub: str | None = None


async def get_jwks() -> list[dict[str, Any]]:
    """
    Retrieve the JSON Web Key Set (JWKS) from the authentication server.
    """
    import httpx

    logger.info("Fetching JWKS from %s", settings.JWKS_URL)
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(settings.JWKS_URL)
            response.raise_for_status()
            jwks_data = response.json()
            logger.info("JWKS data received: %s", jwks_data)
            return jwks_data.get("keys", [])
        except httpx.HTTPStatusError as e:
            logger.error("HTTP error fetching JWKS: %s", e)
            raise
        except Exception as e:
            logger.error("Failed to fetch or parse JWKS: %s", e)
            raise


async def get_public_key(token: str) -> dict[str, Any] | None:
    """Find the appropriate public key from the JWKS to verify the token's signature."""
    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            logger.warning("No 'kid' found in token header.")
            return None

        jwks = await get_jwks()
        for key_dict in jwks:
            if key_dict.get("kid") == kid:
                return key_dict
        logger.warning("No matching public key found in JWKS for kid: %s", kid)
        return None
    except jwt.PyJWTError as e:
        logger.error("Failed to get unverified header from token: %s", e)
        return None


async def verify_token(token: str) -> str | None:
    """
    Verifies a JWT token using PyJWT, aligning with FastAPI best practices.
    """
    logger.info("Attempting to verify token with PyJWT.")
    try:
        public_key_dict = await get_public_key(token)
        if not public_key_dict:
            return None

        # PyJWT can construct the key and verify the signature in one step.
        # It correctly handles OKP keys with EdDSA when the `alg` is provided.
        unverified_header = jwt.get_unverified_header(token)
        algorithm = unverified_header.get("alg")

        if not algorithm:
            logger.error("No algorithm found in token header.")
            return None

        # Construct a key object that PyJWT understands
        public_key = jwt.algorithms.OKPAlgorithm.from_jwk(public_key_dict)

        issuer = str(settings.AUTH_BASE_URL).rstrip("/")
        audience = str(settings.AUTH_BASE_URL).rstrip("/")

        payload = jwt.decode(
            token,
            key=public_key,
            algorithms=[algorithm],
            issuer=issuer,
            audience=audience,
        )

        token_data = TokenData(sub=payload.get("sub"))
        if not token_data.sub:
            logger.warning("Payload 'sub' is missing.")
            return None

        logger.info("Token successfully verified for user: %s", token_data.sub)
        return token_data.sub

    except jwt.PyJWTError as e:
        logger.error("JWT validation failed: %s", e)
        return None
    except Exception as e:
        logger.error(
            "An unexpected error occurred during token verification: %s",
            e,
            exc_info=True,
        )
        return None


class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code
