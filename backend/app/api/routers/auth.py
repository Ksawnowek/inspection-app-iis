from fastapi import FastAPI, Depends, APIRouter, HTTPException
from app.domain.requestsDTO import LoginRequest, RegisterRequest
from app.services.auth_service import AuthService


router = APIRouter(prefix="/api/auth", tags=["authentication"])

"""
    Data format
    {
        "login": "xxx",
        "pwd": "xxx"
    }
"""
@router.post("/login")
async def handle_login(data: LoginRequest, service: AuthService = Depends(AuthService)):
    token = service.auth_user(data.login, data.pwd)
    if token is None:
        raise HTTPException(status_code=401,detail="Incorrect username or password")

    return {
        "access_token": token,
        "token_type": "bearer"
    }









"""
    Data format
    {
        "login": "xxx",
        "pwd": "xxx",
        "imie": "xxx",
        "nazwisko": "xxx",
        "rola": x,  
    }
"""
@router.post("/register")
async def handle_register(data: RegisterRequest, service: AuthService = Depends(AuthService)):
    result = service.register_user(data.login, data.pwd, data.imie, data.nazwisko, data.rola)
    if result:
        status = "sukces"
        response = "Udało się!"
    else:
        status = "failed"
        response = "Niepowodzenie operacji"
    return {
        "status": status,
        "otrzymane_dane": response
    }
