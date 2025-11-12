from typing import Any, Dict, List
import pyodbc
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

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

    # def get_role_name(self, role_id):
    #     sql = """
    #     SELECT
    #         RTRIM(ROL_Opis) AS ROL_Opis
    #     from dbo.Role
    #     WHERE ROL_Id = ?
    #     """
    #     cur = self.conn.cursor()
    #     cur.execute(sql, role_id)
    #     row = cur.fetchone()
    #
    #     if not row:
    #         return None
    #
    #     return row[0]
