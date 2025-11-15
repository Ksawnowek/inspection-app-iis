from fastapi import Depends
from sqlalchemy.orm import Session

from app.domain.requestsDTO import ZadanieUpdateDTO
from app.models.models import ZadanieNagl, ZadaniePoz
from app.repositories.zadania_repo import ZadaniaRepo
from app.schemas.user import User
from typing import Any, Dict, List, Optional


class ZadaniaService:
    def __init__(self, repo: ZadaniaRepo, session: Session):
        self.repo = repo
        self.session = session

    def get_pozycje_by_user_role(self, user: User, znag_id: int) -> List[Dict[str, Any]]:
        if user.role == 101:
            return self.repo.pozycje_serwisant(znag_id)
        else:
            return self.repo.pozycje_zadania(znag_id)

    def set_do_przegladu(self, zpoz_id: int, wartosc: bool, uzytkownik: str | None) -> bool:
        return self.repo.ustaw_do_przegladu(zpoz_id, wartosc, uzytkownik)

    def get_lista_zadan(self,
                        kontrakt: str | None = None,
                        date_from: str | None = None,
                        date_to: str | None = None) -> List[Dict[str, Any]]:
        return self.repo.lista_zadan(kontrakt, date_from, date_to)

    def get_lista_zadan_sqlalchemy(self,
                        kontrakt: str | None = None,
                        date_from: str | None = None,
                        date_to: str | None = None) -> List[Dict[str, Any]]:
        return self.repo.lista_zadan_sqlalchemy(kontrakt, date_from, date_to)

    def get_naglowek(self, znag_id: int) -> Optional[Dict[str, Any]]:
        return self.repo.naglowek(znag_id)

    def get_lista(self,
                  date_from: str | None = None,
                  date_to: str | None = None,
                  only_open: bool = False,
                  kontrakt: str | None = None) -> List[Dict[str, Any]]:
        return self.repo.lista(date_from, date_to, only_open, kontrakt)

    def get_pozycje(self, znag_id: int) -> List[Dict[str, Any]]:
        return self.repo.pozycje(znag_id)

    def patch_zadanie(self, znag_id: int, dto_data: ZadanieUpdateDTO) -> ZadanieNagl:
        zadanie = self.repo.get_zadanie_by_id(znag_id)
        if zadanie is None:
            return None
        update_data = dto_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(zadanie, key, value)
        try:
            self.session.commit()
            self.session.refresh(zadanie)
            return zadanie
        except Exception as e:
            self.session.rollback()
            print(f"Błąd podczas patch_zadanie: {e}")
            raise RuntimeError("Błąd serwera podczas zapisu danych.")

    def zapisz_podpis(self, znag_id, podpis_klienta):
        pass

    def get_podpis(self, znag_id):
        return self.repo.get_podpis(znag_id)

    def get_naglowek_by_id(self, znag_id) -> type[ZadanieNagl] | None:
        return self.session.get(ZadanieNagl, znag_id)

    def get_pozycje_orm(self, znag_id: int) -> List[ZadaniePoz]:
        """Pobiera pozycje zadania jako obiekty ORM (nie słowniki)."""
        return self.repo.get_pozycje_orm(znag_id)

    def get_naglowek_pelny(self, znag_id: int) -> Optional[Dict[str, Any]]:
        """Pobiera pełne dane zadania (wszystkie kolumny włącznie z godzinami)."""
        return self.repo.naglowek_pelny(znag_id)
