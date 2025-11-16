from typing import Optional

from pydantic import BaseModel, ConfigDict, computed_field, Field
import datetime

class RoleRead(BaseModel):
    ROL_Opis: str
    model_config = ConfigDict(from_attributes=True)

class UzytkownikRead(BaseModel):
    UZT_Id: int
    UZT_Imie: str
    UZT_Nazwisko: str
    UZT_ROL_Id: int
    UZT_Login: str
    Role: RoleRead = Field(..., alias="Role_")
    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def ROL_Opis(self) -> str:
        return self.Role.ROL_Opis