from typing import Any, Dict, List, Optional
import pyodbc
from sqlalchemy.engine import Engine
from sqlalchemy import select, func, desc
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.models.models import t_v_Zadania, ZadanieNagl


class ZadaniaRepo:
    def __init__(self, conn: pyodbc.Connection,  session: Session):
        self.conn = conn
        self.session = session

    def lista_zadan(self,
                    kontrakt: str | None = None,
                    date_from: str | None = None,
                    date_to: str | None = None) -> List[Dict[str, Any]]:
        sql = "SELECT * FROM dbo.v_Zadania WHERE 1=1"
        args: list[Any] = []
        if kontrakt:
            sql += " AND vZNAG_Kontrakt = ?"
            args.append(kontrakt)
        if date_from:
            sql += " AND vZNAG_DataDokumentu >= ?"
            args.append(date_from)
        if date_to:
            sql += " AND vZNAG_DataDokumentu < DATEADD(day,1,?)"
            args.append(date_to)

        sql += " ORDER BY vZNAG_DataDokumentu DESC, vZNAG_Id DESC"
        cur = self.conn.cursor() # Zmiana: użycie self.conn
        cur.execute(sql, tuple(args))
        cols = [d[0] for d in cur.description]
        return [dict(zip(cols, r)) for r in cur.fetchall()]

    def lista_zadan_sqlalchemy(self,
                               kontrakt: str | None = None,
                               date_from: str | None = None,
                               date_to: str | None = None) -> List[Dict[str, Any]]:
        """
        Pobiera listę zadań przy użyciu sesji SQLAlchemy i obiektu Table.
        """

        stmt = select(t_v_Zadania)

        if kontrakt:
            stmt = stmt.where(t_v_Zadania.c.vZNAG_Kontrakt == kontrakt)

        if date_from:
            stmt = stmt.where(t_v_Zadania.c.vZNAG_DataDokumentu >= date_from)

        if date_to:
            stmt = stmt.where(
                t_v_Zadania.c.vZNAG_DataDokumentu < func.dateadd('day', 1, date_to)
            )

        stmt = stmt.order_by(
            t_v_Zadania.c.vZNAG_DataDokumentu.desc(),
            t_v_Zadania.c.vZNAG_Id.desc()
        )

        with Session(self.engine) as session:
            result = session.execute(stmt).mappings().all()

            return list(result)

    def pozycje_zadania(self, znag_id: int) -> List[Dict[str, Any]]:
        cur = self.conn.cursor()
        cur.execute(
            "SELECT * FROM dbo.v_ZadaniePozycje WHERE ZPOZ_ZNAG_Id = ? ORDER BY ZPOZ_UrzadzenieNumer",
            znag_id
        )
        cols = [d[0] for d in cur.description]
        return [dict(zip(cols, r)) for r in cur.fetchall()]

    def pozycje_serwisant(self, znag_id: int) -> List[Dict[str, Any]]:
        cur = self.conn.cursor()
        cur.execute(
            "SELECT * FROM dbo.v_ZadaniePozycje WHERE ZPOZ_ZNAG_Id = ? AND ZPOZ_UrzadzenieDoPrzegladu = 1 ORDER BY ZPOZ_UrzadzenieNumer",
            znag_id
        )
        cols = [d[0] for d in cur.description]
        return [dict(zip(cols, r)) for r in cur.fetchall()]

    def ustaw_do_przegladu(self, zpoz_id: int, wartosc: bool, uzytkownik: str | None):
        cur = self.conn.cursor() # Zmiana: użycie self.conn
        sql = "EXEC dbo.sp_ZPOZ_UstawDoPrzegladu ?, ?, ?"
        try:
            cur.execute(sql, (zpoz_id, int(wartosc), uzytkownik))
            self.conn.commit() # Zmiana: użycie self.conn
            return True
        except (pyodbc.Error, Exception) as e:
            print(e)
            self.conn.rollback() # Zmiana: użycie self.conn
            return False

    def naglowek(self, znag_id: int) -> Optional[Dict[str, Any]]:
        cur = self.conn.cursor() # Zmiana: użycie self.conn
        cur.execute("SELECT * FROM dbo.v_Zadania WHERE ZNAG_Id = ?", znag_id)
        row = cur.fetchone()
        if not row:
            return None
        cols = [d[0] for d in cur.description]
        return dict(zip(cols, row))

    def pozycje(self, znag_id: int) -> List[Dict[str, Any]]:
        # Alias jest teraz prosty, ponieważ pozycje_zadania używa self.conn
        return self.pozycje_zadania(znag_id)

    def lista(self,
              date_from: str | None = None,
              date_to: str | None = None,
              only_open: bool = False,
              kontrakt: str | None = None) -> List[Dict[str, Any]]:
        # Alias jest prosty, ponieważ lista_zadan używa self.conn
        return self.lista_zadan(kontrakt=kontrakt, date_from=date_from, date_to=date_to)

    def get_zadanie_by_id(self, znagl_id: int) -> ZadanieNagl | None:
        zadanie = self.session.get(ZadanieNagl, znagl_id)
        return zadanie
