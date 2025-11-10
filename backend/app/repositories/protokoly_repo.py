from typing import Any, Dict, List
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, text  # <-- Importujemy `text`
from app.models.models import ProtokolNagl, ProtokolPoz, ZdjeciaProtokolPoz


class ProtokolyRepo:
    def __init__(self, session: Session) -> None:
        # 1. Wstrzykujemy JUŻ TYLKO sesję
        self.session = session

    def naglowek(self, pnagl_id: int) -> Dict[str, Any] | None:
        # 2. Wykonujemy surowe zapytanie SQL przez sesję
        stmt = text("SELECT * FROM dbo.v_ProtokolNaglWidok WHERE PNAGL_Id = :pnagl_id")
        result = self.session.execute(stmt, {"pnagl_id": pnagl_id})

        # Pobieramy wiersz (Row)
        row = result.fetchone()
        if not row:
            return None

        # Konwertujemy `Row` na słownik, aby zachować typ zwracany
        return dict(row._mapping)

    def pozycje(self, pnagl_id: int) -> List[Dict[str, Any]]:
        # 3. To samo dla listy pozycji
        stmt = text("SELECT * FROM dbo.v_ProtokolPozWidok WHERE PPOZ_PNAGL_Id = :pnagl_id ORDER BY PPOZ_Lp")
        result = self.session.execute(stmt, {"pnagl_id": pnagl_id})

        # Zwracamy listę słowników
        return [dict(row._mapping) for row in result.fetchall()]

    def zapisz_pozycje(self, ppoz: Dict[str, Any], uzytkownik: str | None):
        # 4. Wywołanie procedury składowanej przez sesję
        stmt = text(
            """
            EXEC dbo.sp_PPOZ_Zapisz 
                @PPOZ_Id = :ppoz_id, 
                @PPOZ_OcenaNP = :ocena_np, 
                @PPOZ_OcenaO = :ocena_o, 
                @PPOZ_OcenaNR = :ocena_nr, 
                @PPOZ_OcenaNA = :ocena_na, 
                @PPOZ_Uwagi = :uwagi, 
                @PPOZ_CzyZdjecia = :czy_zdjecia
            """
        )

        params = {
            "ppoz_id": ppoz["PPOZ_Id"],
            "ocena_np": ppoz.get("PPOZ_OcenaNP"),
            "ocena_o": ppoz.get("PPOZ_OcenaO"),
            "ocena_nr": ppoz.get("PPOZ_OcenaNR"),
            "ocena_na": ppoz.get("PPOZ_OcenaNA"),
            "uwagi": ppoz.get("PPOZ_Uwagi"),
            "czy_zdjecia": 1 if ppoz.get("PPOZ_CzyZdjecia") else 0
        }

        self.session.execute(stmt, params)



    def podpisz(self, pnagl_id: int, podpis_klienta: str, zaakceptowal: str):
        stmt = text("EXEC dbo.sp_PNAGL_Podpisz :pnagl_id, :podpis, :akcept")

        params = {
            "pnagl_id": pnagl_id,
            "podpis": podpis_klienta,
            "akcept": zaakceptowal
        }

        self.session.execute(stmt, params)
        # 6. BRAK COMMIT!

    def ustaw_pdf_sciezke(self, pnagl_id: int, sciezka: str):
        # 7. Tę metodę najlepiej przerobić na ORM, skoro mamy już model
        #    To jest czystsze i bezpieczniejsze niż surowy UPDATE.
        nagl = self.session.get(ProtokolNagl, pnagl_id)
        if nagl:
            nagl.PNAGL_PdfPath = sciezka
            # Obiekt `nagl` jest już "brudny" (dirty) w sesji,
            # więc `get_session` zrobi commit tej zmiany.

        # Oryginalna wersja (gdybyś nie chciał używać ORM):
        # stmt = text("UPDATE dbo.ProtokolNagl SET PNAGL_PdfPath = :sciezka WHERE PNAGL_Id = :pnagl_id")
        # self.session.execute(stmt, {"sciezka": sciezka, "pnagl_id": pnagl_id})
        # 8. BRAK COMMIT!

    # --- Te metody były już poprawne ---

    def get_naglowek_pozycje_by_id(self, pnagl_id) -> ProtokolNagl:
        stmt = select(ProtokolNagl).where(ProtokolNagl.PNAGL_Id == pnagl_id)
        stmt = stmt.options(
            selectinload(ProtokolNagl.ProtokolPoz)
            .selectinload(ProtokolPoz.ZdjeciaProtokolPoz)
        )
        nagl = self.session.scalars(stmt).one_or_none()
        return nagl

    def get_protokol_nagl_by_id(self, pnagl_id):
        return self.session.get(ProtokolNagl, pnagl_id)

    def get_poz_by_id(self, ppoz_id):
        return self.session.get(ProtokolPoz, ppoz_id)