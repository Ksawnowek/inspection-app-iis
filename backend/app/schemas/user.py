from pydantic import BaseModel, Field, ConfigDict

class Role(BaseModel):
    nazwa: str

class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    name: str = Field(alias='UZT_Imie')
    surname: str = Field(alias='UZT_Nazwisko')
    login: str = Field(alias='UZT_Login')
    pwd: str = Field(alias='UZT_pwd')
    role: int = Field(alias='UZT_ROL_id')
