from pydantic import BaseModel

class LoginRequest(BaseModel):
    login: str
    pwd: str

class RegisterRequest(BaseModel):
    login: str
    pwd: str
    imie: str
    nazwisko: str
    rola: int