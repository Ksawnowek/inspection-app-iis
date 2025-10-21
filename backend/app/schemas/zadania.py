from pydantic import BaseModel
from typing import Optional

class ZadaniaFilter(BaseModel):
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None
    onlyOpen: Optional[bool] = False
