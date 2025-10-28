from fastapi import Depends
from app.repositories.zadania_repo import ZadaniaRepo
from app.schemas.user import User
from typing import Any, Dict, List, Optional


class ZadaniaService:
    def __init__(self, repo: ZadaniaRepo = Depends(ZadaniaRepo)):
        self.repo = repo

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