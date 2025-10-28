from typing import Any, Dict, List
import pyodbc
from app.schemas.user import User
from app.db import get_conn
from fastapi import Depends

class UserRepo:
    def __init__(self, conn: pyodbc.Connection = Depends(get_conn)):
        self.conn = conn

    def get_by_login(self, login) -> User | None:
        cur = self.conn.cursor()
        sql = """
              SELECT RTRIM(UZT_Imie)     AS UZT_Imie, 
                     RTRIM(UZT_Nazwisko) AS UZT_Nazwisko, 
                     RTRIM(UZT_Login)    AS UZT_Login, 
                     RTRIM(UZT_pwd)      AS UZT_pwd, 
                     UZT_ROL_id 
              FROM dbo.Uzytkownik
              WHERE UZT_Login = ? \
              """
        cur.execute(sql, login)

        row = cur.fetchone()

        if not row:
            return None

        cols = [d[0] for d in cur.description]
        row_dict = dict(zip(cols, row))
        return User(**row_dict)


    def add_user(self, user: User):
        sql = """
        INSERT INTO dbo.Uzytkownik 
            (UZT_Imie, UZT_Nazwisko, UZT_Login, UZT_pwd, UZT_ROL_Id)
            values (?, ?, ?, ?, ?)
        """
        cur = self.conn.cursor()
        params = (user.name, user.surname, user.login, user.pwd, user.role)

        try:
            cur.execute(sql, params)
            if cur.rowcount != 1:
                self.conn.rollback()
                return False
            else:
                self.conn.commit()
                return True

        except (pyodbc.Error, Exception) as e:
            print(e)
            self.conn.rollback()
            return False

    def get_role_name(self, role_id):
        sql = """
        SELECT 
            RTRIM(ROL_Opis) AS ROL_Opis
        from dbo.Role
        WHERE ROL_Id = ?
        """
        cur = self.conn.cursor()
        cur.execute(sql, role_id)
        row = cur.fetchone()

        if not row:
            return None

        return row[0]
