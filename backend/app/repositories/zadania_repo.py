from typing import Any, Dict, List, Optional
import pyodbc

class ZadaniaRepo:
    def lista_zadan(self, conn: pyodbc.Connection,
                    kontrakt: str | None = None,
                    date_from: str | None = None,
                    date_to: str | None = None) -> List[Dict[str, Any]]:
        sql = "SELECT * FROM dbo.v_Zadania WHERE 1=1"
        args: list[Any] = []
        if kontrakt:
            sql += " AND ZNAG_Kontrakt = ?"
            args.append(kontrakt)
        if date_from:
            sql += " AND ZNAG_DataDokumentu >= ?"
            args.append(date_from)
        if date_to:
            sql += " AND ZNAG_DataDokumentu < DATEADD(day,1,?)"
            args.append(date_to)

        sql += " ORDER BY ZNAG_DataDokumentu DESC, ZNAG_Id DESC"
        cur = conn.cursor()
        cur.execute(sql, tuple(args))  # <- tuple
        cols = [d[0] for d in cur.description]
        return [dict(zip(cols, r)) for r in cur.fetchall()]

    def pozycje_zadania(self, conn: pyodbc.Connection, znag_id: int) -> List[Dict[str, Any]]:
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM dbo.v_ZadaniePozycje WHERE ZPOZ_ZNAG_Id = ? ORDER BY ZPOZ_UrzadzenieNumer",
            znag_id
        )
        cols = [d[0] for d in cur.description]
        return [dict(zip(cols, r)) for r in cur.fetchall()]

    def ustaw_do_przegladu(self, conn: pyodbc.Connection, zpoz_id: int, wartosc: bool, uzytkownik: str | None):
        cur = conn.cursor()
        cur.execute("EXEC dbo.sp_ZPOZ_UstawDoPrzegladu ?, ?, ?", zpoz_id, int(wartosc), uzytkownik)
        conn.commit()

    def naglowek(self, conn: pyodbc.Connection, znag_id: int) -> Optional[Dict[str, Any]]:
        cur = conn.cursor()
        cur.execute("SELECT * FROM dbo.v_Zadania WHERE ZNAG_Id = ?", znag_id)
        row = cur.fetchone()
        if not row:
            return None
        cols = [d[0] for d in cur.description]
        return dict(zip(cols, row))

    def pozycje(self, conn: pyodbc.Connection, znag_id: int) -> List[Dict[str, Any]]:
        # alias spójny z routerem
        return self.pozycje_zadania(conn, znag_id)

    def lista(self, conn: pyodbc.Connection,
              date_from: str | None = None,
              date_to: str | None = None,
              only_open: bool = False,
              kontrakt: str | None = None) -> List[Dict[str, Any]]:
        # alias spójny z routerem (na razie ignoruje only_open)
        return self.lista_zadan(conn, kontrakt=kontrakt, date_from=date_from, date_to=date_to)
