from pydantic import BaseModel, Field
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
    ZNAG_GodzSwieta: Optional[str] = None
    ZNAG_GodzSobNoc: Optional[str] = None
    ZNAG_GodzDojazdu: Optional[str] = None
    ZNAG_GodzNaprawa: Optional[str] = None
    ZNAG_GodzWyjazd: Optional[str] = None
    ZNAG_GodzDieta: Optional[str] = None
    ZNAG_GodzKm: Optional[str] = None
    ZNAG_Urzadzenie: Optional[str] = None
    ZNAG_Tonaz: Optional[str] = None
    ZNAG_AwariaNumer: Optional[str] = None
    ZNAG_OkrGwar: Optional[bool] = None


class ProtokolPozUpdateDTO(BaseModel ):
    PPOZ_OcenaNP: Optional[bool] = None
    PPOZ_OcenaO: Optional[bool] = None
    PPOZ_OcenaNR: Optional[bool] = None
    PPOZ_OcenaNA: Optional[bool] = None
    PPOZ_CzyZdjecia: Optional[bool] = None
    PPOZ_Uwagi: Optional[str] = None

class ProtokolNaglUpdateDTO(BaseModel):
    PNAGL_Klient: Optional[str] = None
    PNAGL_Miejscowosc: Optional[str] = None
    PNAGL_Producent: Optional[str] = None
    PNAGL_Udzwig: Optional[str] = None
    PNAGL_NrUrzadzenia: Optional[str] = None
    PNAGL_ModelWciagnika: Optional[str] = None
    PNAGL_Uwagi: Optional[str] = None
    PNAGL_CzyZaakceptowany: Optional[bool] = None
    PNAGL_Zaakceptowal: Optional[str] = None

class ProtokolPodpisDTO(BaseModel):
    Klient: str
    Podpis: str


class UzytkownikUpdateDTO(BaseModel):
    UZT_Imie: Optional[str] = None
    UZT_Nazwisko: Optional[str] = None
    UZT_ROL_Id: Optional[int] = None
    UZT_Login: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)