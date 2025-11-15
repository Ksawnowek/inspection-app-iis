# Przykład struktury (nie do uruchomienia)
from pathlib import Path

from fastapi import HTTPException

from app.services.protokoly_service import ProtokolyService
from app.services.zadania_service import ZadaniaService
from app.utils.pdf_generator import render_zadanie_pdf, render_protokol_pdf
from app.utils.pdf_generator import render_zadanie_pdf


class PDFService:
    def __init__(self, zadania_service: ZadaniaService, protokoly_service: ProtokolyService, pdf_dir: Path):
        self._zadania_service = zadania_service
        self._protokoly_service = protokoly_service
        self._pdf_dir = pdf_dir

    def generuj_pdf_zadania(self, znag_id: int, serwisanci: list[str]) -> Path:
        # Pobieranie danych jako obiekty ORM (nie słowniki)
        nagl = self._zadania_service.get_naglowek_by_id(znag_id)
        if not nagl:
            # Warto rozważyć, czy rzucanie 404 nie powinno zostać w routerze
            # Ale jeśli chcemy, by serwis wiedział, że nie ma danych - jest OK
            raise HTTPException(404, "Zadanie nie istnieje")

        podpis = self._zadania_service.get_podpis(znag_id)
        poz = self._zadania_service.get_pozycje_orm(znag_id)

        # Generowanie ścieżki
        out_path = self._pdf_dir / f"zadanie_{znag_id}.pdf"

        # Renderowanie
        render_zadanie_pdf(
            out_path=str(out_path),
            naglowek=nagl,
            podpis=podpis,
            pozycje=poz,
            serwisanci=serwisanci
        )

        return out_path

    def generuj_pdf_protokol(self, pnagl_id: int) -> Path:
        # Pobieranie danych
        pnagl = self._protokoly_service.get_protokol_nagl_by_id(pnagl_id)
        if not pnagl:
            raise HTTPException(404, "Protokol nie istnieje")

        znag = self._zadania_service.get_naglowek_by_id(pnagl.ZadaniePoz_.ZPOZ_ZNAG_Id)

        if not znag:
            # Warto rozważyć, czy rzucanie 404 nie powinno zostać w routerze
            # Ale jeśli chcemy, by serwis wiedział, że nie ma danych - jest OK
            raise HTTPException(404, "Zadanie nie istnieje")

        protokol_grupy = self._protokoly_service.get_protokol_pozycje(pnagl_id)

        # Generowanie ścieżki
        out_path = self._pdf_dir / f"protokol_{pnagl_id}.pdf"

        # Renderowanie
        render_protokol_pdf(
            out_path=str(out_path),
            protokol_nagl=pnagl,
            zadanie_nagl=znag,
            protokol_grupy=protokol_grupy
        )

        return out_path

