from typing import Annotated, Optional, Dict, Any, List

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import FileResponse
from starlette import status

# Usunięto import get_conn i ZadaniaRepo, bo są ukryte za serwisem

from app.dependencies import get_current_user_from_cookie, get_zadania_service, get_pdf_service
from app.domain.requestsDTO import ZadanieUpdateDTO
from app.schemas.user import User
from app.services.PDF_service import PDFService
# Usunięto nieużywany import AuthService
from app.services.pdf_zadanie_service import render_zadanie_pdf  # Używamy tylko aliasu
from app.core.paths import PDF_DIR
from app.services.zadania_service import ZadaniaService

router = APIRouter(prefix="/api/zadania", tags=["Zadania"])



CurrentUserDep = Annotated[User, Depends(get_current_user_from_cookie)]


# ============= LISTA / SZCZEGÓŁY =============

@router.get("")
def list_zadania(
        zadania_service: ZadaniaService = Depends(get_zadania_service),
        dateFrom: str | None = None,
        dateTo: str | None = None,
        onlyOpen: bool = False,
) -> List[Dict[str, Any]]:
    """
    Zwraca listę zadań (możesz filtrować datą i tylko otwarte).
    Korzysta z ZadaniaService, który deleguje wywołanie do Repo.
    """
    return zadania_service.get_lista(
        date_from=dateFrom,
        date_to=dateTo,
        only_open=onlyOpen
    )

@router.patch("/patch/{znag_id}")
def patch_zadania(
        znag_id: int,
        update_dto: ZadanieUpdateDTO,
        service: ZadaniaService = Depends(get_zadania_service)
):
    try:
        updated_zadanie = service.patch_zadanie(znag_id, update_dto)
        return updated_zadanie
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{znag_id}")
def get_zadanie(
        znag_id: int,
        zadania_service: ZadaniaService = Depends(get_zadania_service)
) -> Dict[str, Any]:
    """
    Zwraca nagłówek zadania (np. z widoku v_Zadania).
    """
    nag = zadania_service.get_naglowek(znag_id)
    if not nag:
        raise HTTPException(404, "Zadanie nie istnieje")
    return nag


@router.get("/{znag_id}/pozycje")
def get_zadanie_pozycje(
        current_user: CurrentUserDep,
        znag_id: int,
        zadania_service: ZadaniaService = Depends(get_zadania_service)):
    """
    Zwraca pozycje zadania (np. z widoku v_ZadaniePozycje). 
    Używa logiki z Serwisu, aby zastosować filtry zależne od roli użytkownika.
    """
    result = zadania_service.get_pozycje_by_user_role(current_user, znag_id)

    if not result:
        # Możesz chcieć zwrócić pustą listę zamiast 404, ale zachowałem logikę:
        raise HTTPException(status_code=404, detail="Pozycje nie istnieją")

    return result


# ============= ZARZĄDZANIE POZYCJĄ (flaga do przeglądu) =============

@router.put("/pozycje/{zpoz_id}/do-przegladu")
def set_do_przegladu(
        zpoz_id: int,
        zadania_service: ZadaniaService = Depends(get_zadania_service),
        payload: Dict[str, Any] = Body(...),  # {"value": true/false, "user": "kto"}
):
    """
    Ustawia flagę 'do przeglądu' w wybranej pozycji zadania.
    """
    value = bool(payload.get("value"))
    user = payload.get("user")

    result = zadania_service.set_do_przegladu(zpoz_id, value, user)

    if not result:
        raise HTTPException(status_code=500, detail="Operacja nie powiodła się (rollback w DB)")

    return {"ok": True}


# ============= GENEROWANIE PDF =============

@router.post("/{znag_id}/pdf/generuj")
def generuj_pdf(
        znag_id: int,
        pdf_service: PDFService = Depends(get_pdf_service),
        body: dict | None = Body(None),
):
    serwisanci = (body or {}).get("serwisanci") or []
    try:
        out_path = pdf_service.generuj_pdf_zadania(
            znag_id=znag_id,
            serwisanci=serwisanci
        )
    except Exception as e:
        # Obsługa innych błędów generowania
        raise HTTPException(500, detail="Błąd podczas generowania pliku PDF") from e

    return FileResponse(
        str(out_path),
        media_type="application/pdf",
        filename=f"zadanie_{znag_id}.pdf"
    )



@router.post("/{znag_id}/pdf/generuj/old")
def generuj_pdf_old(
        znag_id: int,
        zadania_service: ZadaniaService = Depends(get_zadania_service),
        body: dict | None = Body(None),
):
    """
    Generuje i zwraca plik PDF dla danego zadania.
    """
    nagl = zadania_service.get_naglowek_by_id(znag_id)
    podpis = zadania_service.get_podpis(znag_id)
    if not nagl:
        raise HTTPException(404, "Zadanie nie istnieje")

    poz = zadania_service.get_pozycje_orm(znag_id)

    serwisanci = (body or {}).get("serwisanci") or []
    out_path = PDF_DIR / f"zadanie_{znag_id}.pdf"

    render_zadanie_pdf(
        out_path=str(out_path),
        naglowek=nagl,
        podpis=podpis,
        pozycje=poz,
        serwisanci=serwisanci
    )

    return FileResponse(
        str(out_path),
        media_type="application/pdf",
        filename=f"zadanie_{znag_id}.pdf"
    )