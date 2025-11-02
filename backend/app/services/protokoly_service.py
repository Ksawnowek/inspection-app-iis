from fastapi import UploadFile, HTTPException
from app.domain.requestsDTO import ProtokolPozUpdateDTO
from app.repositories.protokoly_repo import ProtokolyRepo
from app.services.file_service import FileService
from app.services.pdf_service import PdfService
from app.schemas.protokoly import ZapisProtokolu
from app.errors import ProtokolNotFound, PdfNotGenerated, SaveError
from app.models.models import ProtokolNagl, ProtokolPoz


class ProtokolyService:
    def __init__(self, repo: ProtokolyRepo, file_service: FileService, pdf_service: PdfService):
        # Wstrzykiwanie zależności przez konstruktor!
        self.repo = repo
        self.file_service = file_service
        self.pdf_service = pdf_service

    def get_protokol_details(self, pnagl_id: int):
        nag = self.repo.naglowek(pnagl_id)
        if not nag:
            raise ProtokolNotFound(pnagl_id)
        poz = self.repo.pozycje(pnagl_id)
        return {"inspection": nag, "values": poz}

    def get_protokol_pozycje(self, pnagl_id: int):
        nag = self.repo.get_naglowek_pozycje_by_id(pnagl_id)
        if not nag:
            raise ProtokolNotFound(pnagl_id)
        result = self._mapPozToGrupa(nag.ProtokolPoz)
        return result

    def zapisz_pozycje(self, payload: ZapisProtokolu):
        try:
            for v in payload.values:
                self.repo.zapisz_pozycje(v.model_dump(), payload.user)
        except Exception as e:
            # Tu można dodać logowanie błędu
            raise SaveError(f"Błąd zapisu pozycji: {e}")

    def generuj_pdf_protokolu(self, pnagl_id: int):
        details = self.get_protokol_details(pnagl_id)  # Używa metody z tego samego serwisu
        nag = details["inspection"]
        poz = details["values"]

        out_path = self.file_service.get_pdf_output_path(pnagl_id)

        self.pdf_service.generuj_protokol_pdf(nag, poz, out_path)

        self.repo.ustaw_pdf_sciezke(pnagl_id, out_path)
        return {"pdf_path": out_path}

    def get_sciezke_pdf(self, pnagl_id: int):
        nag = self.repo.naglowek(pnagl_id)
        if not nag:
            raise ProtokolNotFound(pnagl_id)

        path = nag.get("PNAGL_PdfPath")
        if not path or not self.file_service.check_file_exists(path):
            raise PdfNotGenerated(path or "Brak ścieżki w bazie")
        return path

    # def dodaj_zdjecie(self, ppoz_id: int, plik: UploadFile):
    #     try:
    #         sciezka = self.file_service.save_image(plik)
    #         self.repo.dodaj_zdjecie(ppoz_id, sciezka)
    #         return {"ok": True, "path": sciezka}
    #     except Exception as e:
    #         # Tu można dodać logowanie błędu
    #         raise SaveError(f"Błąd zapisu zdjęcia: {e}")

    def zapisz_podpis(self, pnagl_id: int, podpis_klienta: str, kto: str):
        try:
            self.repo.podpisz(pnagl_id, podpis_klienta, kto)
            return {"ok": True}
        except Exception as e:
            raise SaveError(f"Błąd zapisu podpisu: {e}")


    def _mapPozToGrupa(self, pozycje : list[ProtokolPoz]):
        poz_map = {}
        for poz in pozycje:
            if poz.PPOZ_GrupaOperacji not in poz_map:
                poz_map[poz.PPOZ_GrupaOperacji] = []
            poz_map[poz.PPOZ_GrupaOperacji].append(poz)
        return poz_map

    def get_protokol_nagl_by_id(self, pnagl_id):
        return self.repo.get_protokol_nagl_by_id(pnagl_id)

    def patch_ppoz(self, ppoz_id: int, update_dto: ProtokolPozUpdateDTO) -> ProtokolPoz:
        ppoz = self.repo.get_poz_by_id(ppoz_id)
        if ppoz is None:
            return None
        update_data = update_dto.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(ppoz, key, value)
        return ppoz