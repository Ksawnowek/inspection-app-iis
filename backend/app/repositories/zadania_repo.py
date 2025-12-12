from typing import Any, Dict, List, Optional
from sqlalchemy import select, func, desc, text  # <-- Dodane `text`
from sqlalchemy.orm import Session, Mapped
from app.models.models import t_v_Zadania, ZadanieNagl, ZadaniePoz, ZadanieInneOpis, ZadanieInneMaterial  # Importujemy Table t_v_Zadania


class ZadaniaRepo:
    def __init__(self, session: Session):
        # 1. Wstrzykujemy JUŻ TYLKO sesję
        self.session = session

    def lista_zadan(self,
                    kontrakt: str | None = None,
                    date_from: str | None = None,
                    date_to: str | None = None,
                    search: str | None = None,
                    page: int = 1,
                    page_size: int = 25) -> Dict[str, Any]:
        """
        Pobiera listę zadań łącząc widok v_Zadania z tabelą ZadanieNagl (aby uzyskać pola godzin).
        Obsługuje paginację i wyszukiwanie.

        Returns:
            Dict z kluczami:
            - items: List[Dict[str, Any]] - lista zadań na bieżącej stronie
            - total: int - całkowita liczba zadań (po filtrowaniu)
            - page: int - bieżąca strona
            - page_size: int - rozmiar strony
            - total_pages: int - całkowita liczba stron
        """
        # JOIN widoku v_Zadania z tabelą ZadanieNagl
        stmt = (
            select(
                t_v_Zadania,
                ZadanieNagl.ZNAG_GodzSwieta,
                ZadanieNagl.ZNAG_GodzSobNoc,
                ZadanieNagl.ZNAG_GodzDojazdu,
                ZadanieNagl.ZNAG_GodzNaprawa,
                ZadanieNagl.ZNAG_GodzWyjazd,
                ZadanieNagl.ZNAG_GodzDieta,
                ZadanieNagl.ZNAG_GodzKm,
                ZadanieNagl.ZNAG_KategoriaKod,
                ZadanieNagl.ZNAG_KategoriaOpis,
                ZadanieNagl.ZNAG_DataWykonania,
                ZadanieNagl.ZNAG_Urzadzenie,
                ZadanieNagl.ZNAG_Tonaz,
                ZadanieNagl.ZNAG_AwariaNumer,
                ZadanieNagl.ZNAG_OkrGwar,
            )
            .select_from(t_v_Zadania)
            .join(ZadanieNagl, t_v_Zadania.c.vZNAG_Id == ZadanieNagl.ZNAG_Id)
        )

        if kontrakt:
            stmt = stmt.where(t_v_Zadania.c.vZNAG_Kontrakt == kontrakt)

        if date_from:
            stmt = stmt.where(t_v_Zadania.c.vZNAG_DataDokumentu >= date_from)

        if date_to:
            stmt = stmt.where(
                t_v_Zadania.c.vZNAG_DataDokumentu < func.dateadd('day', 1, date_to)
            )

        # Wyszukiwanie po ID lub nazwie klienta
        if search:
            search_lower = search.lower()
            # Sprawdzamy czy search jest liczbą (ID)
            if search.isdigit():
                # Wyszukiwanie po ID (dokładne dopasowanie na początku lub zawierające)
                stmt = stmt.where(
                    func.cast(t_v_Zadania.c.vZNAG_Id, text('VARCHAR')).like(f'{search}%')
                )
            else:
                # Wyszukiwanie po nazwie klienta (case-insensitive)
                stmt = stmt.where(
                    func.lower(t_v_Zadania.c.vZNAG_KlientNazwa).like(f'%{search_lower}%')
                )

        # Zliczamy całkowitą liczbę rekordów (po filtrowaniu)
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.session.execute(count_stmt).scalar()

        # Sortowanie
        stmt = stmt.order_by(
            t_v_Zadania.c.vZNAG_DataDokumentu.desc(),
            t_v_Zadania.c.vZNAG_Id.desc()
        )

        # Paginacja
        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        result = self.session.execute(stmt).mappings().all()

        # Mapujemy kolumny godzin i nowe pola do formatu z prefixem vZNAG_
        mapped_result = []
        for row in result:
            row_dict = dict(row)
            row_dict['vZNAG_GodzSwieta'] = row_dict.pop('ZNAG_GodzSwieta', None)
            row_dict['vZNAG_GodzSobNoc'] = row_dict.pop('ZNAG_GodzSobNoc', None)
            row_dict['vZNAG_GodzDojazdu'] = row_dict.pop('ZNAG_GodzDojazdu', None)
            row_dict['vZNAG_GodzNaprawa'] = row_dict.pop('ZNAG_GodzNaprawa', None)
            row_dict['vZNAG_GodzWyjazd'] = row_dict.pop('ZNAG_GodzWyjazd', None)
            row_dict['vZNAG_GodzDieta'] = row_dict.pop('ZNAG_GodzDieta', None)
            row_dict['vZNAG_GodzKm'] = row_dict.pop('ZNAG_GodzKm', None)
            row_dict['vZNAG_KategoriaKod'] = row_dict.pop('ZNAG_KategoriaKod', None)
            row_dict['vZNAG_KategoriaOpis'] = row_dict.pop('ZNAG_KategoriaOpis', None)
            row_dict['vZNAG_DataWykonania'] = row_dict.pop('ZNAG_DataWykonania', None)
            row_dict['vZNAG_Urzadzenie'] = row_dict.pop('ZNAG_Urzadzenie', None)
            row_dict['vZNAG_Tonaz'] = row_dict.pop('ZNAG_Tonaz', None)
            row_dict['vZNAG_AwariaNumer'] = row_dict.pop('ZNAG_AwariaNumer', None)
            row_dict['vZNAG_OkrGwar'] = row_dict.pop('ZNAG_OkrGwar', None)
            mapped_result.append(row_dict)

        # Obliczamy całkowitą liczbę stron
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0

        return {
            "items": mapped_result,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }

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
        stmt = text("SELECT * FROM dbo.v_Zadania WHERE vZNAG_Id = :znag_id")
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
              kontrakt: str | None = None,
              search: str | None = None,
              page: int = 1,
              page_size: int = 25) -> Dict[str, Any]:
        # Ta metoda (alias) deleguje do lista_zadan z paginacją
        return self.lista_zadan(
            kontrakt=kontrakt,
            date_from=date_from,
            date_to=date_to,
            search=search,
            page=page,
            page_size=page_size
        )

    def get_zadanie_by_id(self, znagl_id: int) -> ZadanieNagl | None:
        # Ta metoda (ORM) jest OK
        zadanie = self.session.get(ZadanieNagl, znagl_id)
        return zadanie

    def get_podpis(self, znag_id: int) -> Mapped[str|None]:
        return self.session.get(ZadanieNagl, znag_id).ZNAG_KlientPodpis

    def get_pozycje_orm(self, znag_id: int) -> List[ZadaniePoz]:
        """Pobiera pozycje zadania jako obiekty ORM (nie słowniki)."""
        stmt = select(ZadaniePoz).where(ZadaniePoz.ZPOZ_ZNAG_Id == znag_id).order_by(ZadaniePoz.ZPOZ_UrzadzenieNumer)
        result = self.session.execute(stmt)
        return list(result.scalars().all())

    def naglowek_pelny(self, znag_id: int) -> Optional[Dict[str, Any]]:
        """Pobiera pełne dane zadania z tabeli ZadanieNagl (wszystkie kolumny włącznie z godzinami)."""
        zadanie = self.session.get(ZadanieNagl, znag_id)
        if not zadanie:
            return None

        # Konwersja obiektu ORM na słownik z prefixem "vZNAG_"
        return {
            "vZNAG_Id": zadanie.ZNAG_Id,
            "vZNAG_DataDokumentu": zadanie.ZNAG_DataDokumentu,
            "vZNAG_TypPrzegladu": zadanie.ZNAG_TypPrzegladu,
            "vZNAG_KlientNazwa": zadanie.ZNAG_KlientNazwa,
            "vZNAG_KlientMiasto": zadanie.ZNAG_KlientMiasto,
            "vZNAG_DataPlanowana": zadanie.ZNAG_DataPlanowana,
            "vZNAG_DataWykonania": zadanie.ZNAG_DataWykonania,
            "vZNAG_Uwagi": zadanie.ZNAG_Uwagi,
            "vZNAG_UwagiGodziny": zadanie.ZNAG_UwagiGodziny,
            "vZNAG_KlientPodpis": zadanie.ZNAG_KlientPodpis,
            "vZNAG_GodzSwieta": zadanie.ZNAG_GodzSwieta,
            "vZNAG_GodzSobNoc": zadanie.ZNAG_GodzSobNoc,
            "vZNAG_GodzDojazdu": zadanie.ZNAG_GodzDojazdu,
            "vZNAG_GodzNaprawa": zadanie.ZNAG_GodzNaprawa,
            "vZNAG_GodzWyjazd": zadanie.ZNAG_GodzWyjazd,
            "vZNAG_GodzDieta": zadanie.ZNAG_GodzDieta,
            "vZNAG_GodzKm": zadanie.ZNAG_GodzKm,
            "vZNAG_KlientNazwisko": zadanie.ZNAG_KlientNazwisko,
            "vZNAG_KlientDzial": zadanie.ZNAG_KlientDzial,
            "vZNAG_KlientDataZatw": zadanie.ZNAG_KlientDataZatw,
            "vZNAG_Osoby": zadanie.ZNAG_Osoby,
        }

    def get_opis_prac(self, znag_id: int) -> List[ZadanieInneOpis]:
        """Pobiera opisy prac dla zadania (dla awarii i prac różnych)."""
        stmt = select(ZadanieInneOpis).where(ZadanieInneOpis.ZOP_ZNAGL_Id == znag_id)
        result = self.session.execute(stmt)
        return list(result.scalars().all())

    def get_materialy(self, znag_id: int) -> List[Dict[str, Any]]:
        """Pobiera materiały użyte w zadaniu (dla awarii i prac różnych) używając funkcji fun_ZadanieInnePoz."""
        from sqlalchemy import text

        # Wywołanie funkcji SQL fun_ZadanieInnePoz która zwraca materiały posortowane z Lp
        stmt = text("""
            SELECT Lp, ZMAT_Kod, ZMAT_Opis, ZMAT_Ilosc
            FROM dbo.fun_ZadanieInnePoz(:znag_id)
            ORDER BY Lp
        """)

        result = self.session.execute(stmt, {"znag_id": znag_id})
        return [dict(row._mapping) for row in result]