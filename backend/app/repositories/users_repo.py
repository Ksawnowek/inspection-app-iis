from typing import Any, Dict, List
import pyodbc
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload, defer

from app.models.models import Uzytkownik
from app.schemas.user import User
from app.db import get_conn
from fastapi import Depends

class UserRepo:
    # def __init__(self, conn: pyodbc.Connection = Depends(get_conn)):
    #     self.conn = conn

    def __init__(self, session: Session):
        self.session = session

    def get_by_login(self, login) -> User | None:
        statement = (
            select(Uzytkownik)
            .options(selectinload(Uzytkownik.Role_))
            .where(Uzytkownik.UZT_Login == login)
        )
        result = self.session.execute(statement).scalar_one_or_none()
        return result


    def add_user(self, user: Uzytkownik):
        self.session.add(user)

    """
    Funkcja zwracająca listę użytkowników z wyczyszczonym polem hasła
    """
    def get_all_users(self):
        return (self.session.query(Uzytkownik)
                .options(selectinload(Uzytkownik.Role_))
                .options(defer(Uzytkownik.UZT_pwd))
                .all())

    def get_user_by_id(self, uzt_id:int) -> Uzytkownik | None:
        return self.session.get(Uzytkownik, uzt_id)
