# app/schemas/protokoly.py
from pydantic import BaseModel
from typing import List, Optional

class PozycjaDoZapisu(BaseModel):
    PPOZ_Id: int
    PPOZ_OcenaNP: Optional[str] = None
    PPOZ_OcenaO:  Optional[str] = None
    PPOZ_OcenaNR: Optional[str] = None
    PPOZ_OcenaNA: Optional[str] = None
    PPOZ_Uwagi:   Optional[str] = None
    PPOZ_CzyZdjecia: Optional[bool] = None

class ZapisProtokolu(BaseModel):
    user: Optional[str] = "serwisant"
    values: List[PozycjaDoZapisu]
