from typing import Any, Dict, List, Optional
from sqlalchemy import select, func, desc, text  # <-- Dodane `text`
from sqlalchemy.orm import Session
from app.models.models import t_v_Zadania, ZadanieNagl  # Importujemy Table t_v_Zadania


class ZadaniaRepo:
    def __init__(self, session: Session):
        # 1. Wstrzykujemy JUŻ TYLKO sesję
        self.session = session

    def lista_zadan(self,
                    kontrakt: str | None = None,
                    date_from: str | None = None,
                    date_to: str | None = None) -> List[Dict[str, Any]]:
        """
        Pobiera listę zadań przy użyciu sesji SQLAlchemy i obiektu Table.
        (To jest kod z Twojej metody `lista_zadan_sqlalchemy`, ale poprawiony)
        """

        # 2. Używamy obiektu Table (t_v_Zadania) zamiast surowego SQL
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

        # 3. Używamy wstrzykniętej sesji, a nie nowej
        #    .mappings().all() zwraca od razu listę słowników
        result = self.session.execute(stmt).mappings().all()
        return list(result)

    # 4. Usunąłem metodę `lista_zadan_sqlalchemy`, bo jej kod jest teraz w `lista_zadan`

    def pozycje_zadania(self, znag_id: int) -> List[Dict[str, Any]]:
        # 5. Używamy session.execute i text()
        stmt = text(
            "SELECT * FROM dbo.v_ZadaniePozycje WHERE ZPOZ_ZNAG_Id = :znag_id ORDER BY ZPOZ_UrzadzenieNumer"
        )
        result = self.session.execute(stmt, {"znag_id": znag_id})

        # Zwracamy listę słowników (zgodnie z oryginałem)
        return [dict(row._mapping) for row in result.fetchall()]

    def pozycje_serwisant(self, znag_id: int) -> List[Dict[str, Any]]:
        # 6. To samo tutaj
        stmt = text(
            "SELECT * FROM dbo.v_ZadaniePozycje WHERE ZPOZ_ZNAG_Id = :znag_id AND ZPOZ_UrzadzenieDoPrzegladu = 1 ORDER BY ZPOZ_UrzadzenieNumer"
        )
        result = self.session.execute(stmt, {"znag_id": znag_id})
        return [dict(row._mapping) for row in result.fetchall()]

    def ustaw_do_przegladu(self, zpoz_id: int, wartosc: bool, uzytkownik: str | None):
        # 7. Wywołanie procedury przez sesję
        stmt = text("EXEC dbo.sp_ZPOZ_UstawDoPrzegladu :zpoz_id, :wartosc, :uzytkownik")

        try:
            self.session.execute(stmt, {
                "zpoz_id": zpoz_id,
                "wartosc": int(wartosc),
                "uzytkownik": uzytkownik
            })
            # 8. BRAK COMMIT! get_session() to zrobi.
            return True
        except Exception as e:
            print(e)
            # 9. BRAK ROLLBACK! get_session() to zrobi.
            return False

    def naglowek(self, znag_id: int) -> Optional[Dict[str, Any]]:
        stmt = text("SELECT * FROM dbo.v_Zadania WHERE ZNAG_Id = :znag_id")
        result = self.session.execute(stmt, {"znag_id": znag_id})
        row = result.fetchone()

        if not row:
            return None
        return dict(row._mapping)

    def pozycje(self, znag_id: int) -> List[Dict[str, Any]]:
        # Ta metoda (alias) jest OK
        return self.pozycje_zadania(znag_id)

    def lista(self,
              date_from: str | None = None,
              date_to: str | None = None,
              only_open: bool = False,
              kontrakt: str | None = None) -> List[Dict[str, Any]]:
        # Ta metoda (alias) jest OK
        return self.lista_zadan(kontrakt=kontrakt, date_from=date_from, date_to=date_to)

    def get_zadanie_by_id(self, znagl_id: int) -> ZadanieNagl | None:
        # Ta metoda (ORM) jest OK
        zadanie = self.session.get(ZadanieNagl, znagl_id)
        return zadanie