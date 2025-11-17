from typing import Annotated

from fastapi import FastAPI, Response, Depends, APIRouter, HTTPException, Cookie
from jose import jwt

from app.core.config import Settings, settings
from app.domain.requestsDTO import LoginRequest, RegisterRequest
from app.models.models import Uzytkownik
from app.schemas.user import User
from app.services.auth_service import AuthService
from app.dependencies import get_current_user_from_cookie, get_auth_service, kierownik_only

router = APIRouter(prefix="/api/auth", tags=["authentication"])

"""
    Data format
    {
        "login": "xxx",
        "pwd": "xxx"
    }
"""


@router.post("/login")
async def handle_login(data: LoginRequest, response: Response, service: AuthService = Depends(get_auth_service)):
    access_token = service.auth_user(data.login, data.pwd)
    if access_token is None:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    my_refresh_token = service.create_refresh_token(data.login)

    print(f"my_refresh_token length: {len(my_refresh_token)}")
    print(f"access_token length: {len(access_token)}")

    # PRZED set_cookie
    print(f"Response headers BEFORE: {response.headers}")

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES) * 60
    )

    print(f"Response headers AFTER access_token: {response.headers}")

    response.set_cookie(
        key="refresh_token",
        value=my_refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=int(settings.REFRESH_TOKEN_EXPIRE_DAYS) * 24 * 60 * 60
    )

    print(f"Response headers AFTER refresh_token: {response.headers}")
    print(f"Type of response: {type(response)}")

    return {"status": "success", "message": "Logged in successfully"}


"""
    Data format
    {
        "login": "xxx",
        "pwd": "xxx",
        "name": "xxx",
        "surname": "xxx",
        "role": x,  
    }
"""
@router.post("/register")
async def handle_register(
        data: RegisterRequest,
        service: AuthService = Depends(get_auth_service),
        user: Uzytkownik = Depends(kierownik_only)
    ):
    result = service.register_user(data.login, data.name, data.surname, data.pwd, data.role)
    if result:
        status = "success"
        response = "Udało się!"
    else:
        status = "failed"
        response = "Niepowodzenie operacji"
    return {
        "status": status,
        "message": response
    }

@router.post("/logout")
async def handle_logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False,  #TODO zmienić na True przy https
        samesite="lax"
    )

    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=False,  # TODO zmienić na True przy https
        samesite="lax"
    )

    return {"status": "success", "message": "Logged out successfully"}


@router.get("/me")
async def me(current_user: Annotated[Uzytkownik, Depends(get_current_user_from_cookie)]):
    response = {
        "login": current_user.UZT_Login,
        "name": current_user.UZT_Imie,
        "surname": current_user.UZT_Nazwisko,
        "role": current_user.Role_.ROL_Opis
    }
    return {"status": "success", "message": response}


@router.post("/refresh")
async def refresh_token(
        response: Response,
        service: AuthService = Depends(get_auth_service),
        refresh_token: Annotated[str | None, Cookie()] = None
):
    if refresh_token is None:
        raise HTTPException(status_code=401, detail="No refresh token")

    try:
        payload = jwt.decode(refresh_token, settings.REFRESH_SECRET_KEY, algorithms=[settings.ACCESS_TOKEN_ALGORITHM])

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Wrong token type")

        login = payload.get("login")
        if not login:
            raise HTTPException(status_code=401, detail="Invalid token")

        new_access_token = service.create_access_token_by_login(login)

        response.set_cookie(
            key="access_token",
            value=new_access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=Settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

        return {"status": "success"}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except:
        raise HTTPException(status_code=401, detail="Invalid refresh token")