from fastapi import Depends, HTTPException, status, Cookie
from typing import Annotated, Optional

from app.schemas.user import User
from app.services.auth_service import AuthService


async def get_current_user_from_cookie(
    service: Annotated[AuthService, Depends()],
    access_token: Annotated[str | None, Cookie()] = None
) -> User:
    if access_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated (no cookie)",
        )
    user_data = service.validate_and_decode_token(access_token)

    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials (invalid token)",
        )

    return user_data