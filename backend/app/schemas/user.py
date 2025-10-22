from pydantic import BaseModel, Field, ConfigDict

class Role(BaseModel):
    nazwa: str

class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    imie: str = Field(alias='UZT_Imie')
    nazwisko: str = Field(alias='UZT_Nazwisko')
    login: str = Field(alias='UZT_Login')
    pwd: str = Field(alias='UZT_pwd')
    rola: int = Field(alias='UZT_ROL_id')
