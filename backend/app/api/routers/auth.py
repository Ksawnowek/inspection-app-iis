from typing import Annotated

from fastapi import FastAPI, Response, Depends, APIRouter, HTTPException
from app.domain.requestsDTO import LoginRequest, RegisterRequest
from app.schemas.user import User
from app.services.auth_service import AuthService
from app.dependencies import get_current_user_from_cookie

router = APIRouter(prefix="/api/auth", tags=["authentication"])

"""
    Data format
    {
        "login": "xxx",
        "pwd": "xxx"
    }
"""
@router.post("/login")
async def handle_login(data: LoginRequest, response: Response, service: AuthService = Depends(AuthService)):
    token = service.auth_user(data.login, data.pwd)
    if token is None:
        raise HTTPException(status_code=401,detail="Incorrect username or password")

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,  #TODO True po przejściu na https
        samesite="lax",
        max_age=1800
    )

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
async def handle_register(data: RegisterRequest, service: AuthService = Depends(AuthService)):
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

@router.get("/test")
async def test(current_user: Annotated[User, Depends(get_current_user_from_cookie)]):
    return current_user