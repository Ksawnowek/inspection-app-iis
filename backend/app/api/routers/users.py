from typing import Annotated, List

from fastapi import FastAPI, Response, Depends, APIRouter, HTTPException, Cookie
from jose import jwt
from starlette import status

from app.core.config import Settings, settings
from app.domain.requestsDTO import UzytkownikUpdateDTO
from app.models.models import Uzytkownik
from app.models.response_models import UzytkownikRead
from app.schemas.user import User
from app.services.auth_service import AuthService
from app.dependencies import get_current_user_from_cookie, get_user_service, kierownik_only
from app.services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=List[UzytkownikRead])
def get_all_users(
        service: UserService = Depends(get_user_service),
        user: Uzytkownik = Depends(kierownik_only)
    ):
    users = service.get_all_users()
    if users is None:
        raise HTTPException(status_code=404, detail="Users not found")
    return users

@router.patch("/{uzt_id}", response_model=UzytkownikRead)
def patch_user(
        uzt_id: int,
        update_dto: UzytkownikUpdateDTO,
        service: UserService = Depends(get_user_service),
        user: Uzytkownik = Depends(kierownik_only)
    ):
    try:
        updated_user = service.patch_user(uzt_id, update_dto)
        return updated_user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

