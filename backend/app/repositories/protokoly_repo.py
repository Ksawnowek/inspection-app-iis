from typing import Any, Dict, List
import pyodbc
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from app.models.models import ProtokolNagl, ProtokolPoz
from sqlalchemy.engine import Engine


class ProtokolyRepo:
    def __init__(self, conn: pyodbc.Connection, session: Session) -> None:
        # Wstrzyknięcie zależności (połączenia) przez konstruktor
        self.conn = conn
        self.session = session

    def naglowek(self, pnagl_id: int) -> Dict[str, Any] | None:
        cur = self.conn.cursor()
        cur.execute("SELECT * FROM dbo.v_ProtokolNaglWidok WHERE PNAGL_Id = ?", pnagl_id)
        row = cur.fetchone()
        if not row:
            return None
        cols = [d[0] for d in cur.description]
        return dict(zip(cols, row))

    def pozycje(self, pnagl_id: int) -> List[Dict[str, Any]]:

        cur = self.conn.cursor()
        cur.execute("SELECT * FROM dbo.v_ProtokolPozWidok WHERE PPOZ_PNAGL_Id = ? ORDER BY PPOZ_Lp", pnagl_id)
        cols = [d[0] for d in cur.description]
        return [dict(zip(cols, r)) for r in cur.fetchall()]

    def zapisz_pozycje(self, ppoz: Dict[str, Any], uzytkownik: str | None):
        # Używamy cur i self.conn
        cur = self.conn.cursor()
        cur.execute(
            "EXEC dbo.sp_PPOZ_Zapisz ?,?,?,?,?,?,?",
            ppoz["PPOZ_Id"],
            ppoz.get("PPOZ_OcenaNP"),
            ppoz.get("PPOZ_OcenaO"),
            ppoz.get("PPOZ_OcenaNR"),
            ppoz.get("PPOZ_OcenaNA"),
            ppoz.get("PPOZ_Uwagi"),
            1 if ppoz.get("PPOZ_CzyZdjecia") else 0
        )
        self.conn.commit()

    def podpisz(self, pnagl_id: int, podpis_klienta: str, zaakceptowal: str):
        cur = self.conn.cursor()
        cur.execute("EXEC dbo.sp_PNAGL_Podpisz ?, ?, ?", pnagl_id, podpis_klienta, zaakceptowal)
        self.conn.commit()

    def dodaj_zdjecie(self, parent_ppoz_id: int, sciezka: str):
        cur = self.conn.cursor()
        cur.execute("EXEC dbo.sp_Zdjecie_Dodaj ?, ?", parent_ppoz_id, sciezka)
        self.conn.commit()

    def ustaw_pdf_sciezke(self, pnagl_id: int, sciezka: str):
        cur = self.conn.cursor()
        cur.execute("UPDATE dbo.ProtokolNagl SET PNAGL_PdfPath = ? WHERE PNAGL_Id = ?", sciezka, pnagl_id)
        self.conn.commit()

    def naglowek2(self, pnagl_id) -> ProtokolNagl:
        stmt = select(ProtokolNagl).where(ProtokolNagl.PNAGL_Id == pnagl_id)
        stmt = stmt.options(
            selectinload(ProtokolNagl.ProtokolPoz)
            .selectinload(ProtokolPoz.ZdjeciaProtokolPoz)
        )
        nagl = self.session.scalars(stmt).one_or_none()
        return nagl
