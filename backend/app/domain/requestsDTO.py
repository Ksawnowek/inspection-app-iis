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


class ProtokolPozUpdateDTO(BaseModel ):
    PPOZ_OcenaNP: Optional[bool] = None
    PPOZ_OcenaO: Optional[bool] = None
    PPOZ_OcenaNR: Optional[bool] = None
    PPOZ_OcenaNA: Optional[bool] = None
    PPOZ_CzyZdjecia: Optional[bool] = None
    PPOZ_Uwagi: Optional[str] = None

class ProtokolPodpisDTO(BaseModel):
    Klient: str
    Podpis: str