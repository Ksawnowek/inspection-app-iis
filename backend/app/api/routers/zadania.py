# backend/app/api/routers/zadania.py
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import FileResponse

from app.db import get_conn
from app.repositories.zadania_repo import ZadaniaRepo
from app.services.pdf_zadanie_service import render_zadanie_pdf as generate_zadanie_pdf
from app.services.pdf_zadanie_service import render_zadanie_pdf
from app.core.paths import PDF_DIR

router = APIRouter(prefix="/api/zadania", tags=["Zadania"])


# ============= LISTA / SZCZEGÓŁY =============

@router.get("")
def list_zadania(
    dateFrom: str | None = None,
    dateTo: str | None = None,
    onlyOpen: bool = False,
    conn = Depends(get_conn),
):
    """
    Zwraca listę zadań (możesz filtrować datą i tylko otwarte).
    Repo powinno obsłużyć te filtry; jeżeli masz prostą listę, po prostu je zignoruje.
    """
    repo = ZadaniaRepo()
    return repo.lista(conn, date_from=dateFrom, date_to=dateTo, only_open=onlyOpen)


@router.get("/{znag_id}")
def get_zadanie(znag_id: int, conn = Depends(get_conn)):
    """
    Zwraca nagłówek zadania (np. z widoku v_Zadania).
    """
    repo = ZadaniaRepo()
    nag = repo.naglowek(conn, znag_id)
    if not nag:
        raise HTTPException(404, "Zadanie nie istnieje")
    return nag


@router.get("/{znag_id}/pozycje")
def get_zadanie_pozycje(znag_id: int, conn = Depends(get_conn)):
    """
    Zwraca pozycje zadania (np. z widoku v_ZadaniePozycje).
    """
    repo = ZadaniaRepo()
    return repo.pozycje(conn, znag_id)


# ============= ZARZĄDZANIE POZYCJĄ (flaga do przeglądu) =============

@router.put("/pozycje/{zpoz_id}/do-przegladu")
def set_do_przegladu(
    zpoz_id: int,
    payload: dict = Body(...),   # {"value": true/false, "user": "kto"}
    conn = Depends(get_conn),
):
    value = bool(payload.get("value"))
    user = payload.get("user")
    repo = ZadaniaRepo()
    repo.ustaw_do_przegladu(conn, zpoz_id, value, user)
    return {"ok": True}


# ============= GENEROWANIE PDF =============

@router.post("/{znag_id}/pdf/generuj")
def generuj_pdf(znag_id: int, body: dict | None = Body(None), conn=Depends(get_conn)):
    repo = ZadaniaRepo()
    nagl = repo.naglowek(conn, znag_id)
    if not nagl:
        raise HTTPException(404, "Zadanie nie istnieje")
    poz = repo.pozycje(conn, znag_id)

    serwisanci = (body or {}).get("serwisanci") or []
    out_path = PDF_DIR / f"zadanie_{znag_id}.pdf"

    render_zadanie_pdf(
        out_path=str(out_path),
        naglowek=nagl,
        pozycje=poz,
        serwisanci=serwisanci
    )
    return FileResponse(str(out_path), media_type="application/pdf", filename=f"zadanie_{znag_id}.pdf")