from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    login: str
    pwd: str

class RegisterRequest(BaseModel):
    login: str
    name: str
    surname: str
    pwd: str
    role: int

class ZadanieUpdateDTO(BaseModel):
    ZNAG_Uwagi: Optional[str] = None
    ZNAG_UwagiGodziny: Optional[str] = None
    ZNAG_KlientPodpis: Optional[str] = None