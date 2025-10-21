from typing import Any, Dict, List
import pyodbc

class ProtokolyRepo:
    def naglowek(self, conn: pyodbc.Connection, pnagl_id: int) -> Dict[str, Any] | None:
        cur = conn.cursor()
        cur.execute("SELECT * FROM dbo.v_ProtokolNaglWidok WHERE PNAGL_Id = ?", pnagl_id)
        row = cur.fetchone()
        if not row:
            return None
        cols = [d[0] for d in cur.description]
        return dict(zip(cols, row))

    def pozycje(self, conn: pyodbc.Connection, pnagl_id: int) -> List[Dict[str, Any]]:
        cur = conn.cursor()
        cur.execute("SELECT * FROM dbo.v_ProtokolPozWidok WHERE PPOZ_PNAGL_Id = ? ORDER BY PPOZ_Lp", pnagl_id)
        cols = [d[0] for d in cur.description]
        return [dict(zip(cols, r)) for r in cur.fetchall()]

    def zapisz_pozycje(self, conn: pyodbc.Connection, ppoz: Dict[str, Any], uzytkownik: str | None):
        cur = conn.cursor()
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
        conn.commit()

    def podpisz(self, conn: pyodbc.Connection, pnagl_id: int, podpis_klienta: str, zaakceptowal: str):
        cur = conn.cursor()
        cur.execute("EXEC dbo.sp_PNAGL_Podpisz ?, ?, ?", pnagl_id, podpis_klienta, zaakceptowal)
        conn.commit()

    def dodaj_zdjecie(self, conn: pyodbc.Connection, parent_ppoz_id: int, sciezka: str):
        cur = conn.cursor()
        cur.execute("EXEC dbo.sp_Zdjecie_Dodaj ?, ?", parent_ppoz_id, sciezka)
        conn.commit()

    def ustaw_pdf_sciezke(self, conn: pyodbc.Connection, pnagl_id: int, sciezka: str):
        # Jeżeli masz kolumnę PNAGL_PdfPath
        cur = conn.cursor()
        cur.execute("UPDATE dbo.ProtokolNagl SET PNAGL_PdfPath = ? WHERE PNAGL_Id = ?", sciezka, pnagl_id)
        conn.commit()
