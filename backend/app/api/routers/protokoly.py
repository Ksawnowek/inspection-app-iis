import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import Optional
from app.db import get_conn
from app.repositories.protokoly_repo import ProtokolyRepo
from app.schemas.protokoly import ZapisProtokolu
from app.services.protokoly_service import generuj_pdf, pdf_output_path
from app.services.pdf_zadanie_service import render_zadanie_pdf as generate_zadanie_pdf

router = APIRouter(prefix="/api/protokoly", tags=["Protokoły"])
repo = ProtokolyRepo()

@router.get("/{pnagl_id}")
def podglad(pnagl_id: int, conn = Depends(get_conn)):
    nag = repo.naglowek(conn, pnagl_id)
    if not nag:
        raise HTTPException(404, "Nie znaleziono protokołu")
    poz = repo.pozycje(conn, pnagl_id)
    return {"inspection": nag, "values": poz}

@router.put("/{pnagl_id}")
def zapisz(pnagl_id: int, payload: ZapisProtokolu, conn = Depends(get_conn)):
    try:
        for v in payload.values:
            repo.zapisz_pozycje(conn, v.model_dump(), payload.user)
        return {"ok": True}
    except Exception as e:
        raise HTTPException(400, str(e))

@router.post("/{pnagl_id}/pdf")
def generuj(pnagl_id: int, conn = Depends(get_conn)):
    nag = repo.naglowek(conn, pnagl_id)
    if not nag:
        raise HTTPException(404, "Nie znaleziono protokołu")
    poz = repo.pozycje(conn, pnagl_id)
    out_path = pdf_output_path(pnagl_id)
    generuj_pdf(nag, poz, out_path)
    repo.ustaw_pdf_sciezke(conn, pnagl_id, out_path)
    return {"pdf_path": out_path}

@router.get("/{pnagl_id}/pdf")
def pobierz(pnagl_id: int, conn = Depends(get_conn)):
    nag = repo.naglowek(conn, pnagl_id)
    if not nag:
        raise HTTPException(404, "Nie znaleziono protokołu")
    path = nag.get("PNAGL_PdfPath")
    if not path or not os.path.exists(path):
        raise HTTPException(404, "PDF nie został wygenerowany")
    return FileResponse(path, media_type="application/pdf", filename=f"protokol_{pnagl_id}.pdf")

@router.post("/pozycje/{ppoz_id}/zdjecia")
def dodaj_zdjecie(ppoz_id: int, plik: UploadFile = File(...), conn = Depends(get_conn)):
    # zapis pliku
    base = os.path.join(os.getenv("STORAGE_DIR","./storage"), "images")
    os.makedirs(base, exist_ok=True)
    sciezka = os.path.join(base, plik.filename)
    with open(sciezka, "wb") as f:
        f.write(plik.file.read())
    repo.dodaj_zdjecie(conn, ppoz_id, sciezka)
    return {"ok": True, "path": sciezka}

@router.post("/{pnagl_id}/podpis")
def podpis(pnagl_id: int, podpis_klienta: str = Form(...), kto: str = Form("Klient"), conn = Depends(get_conn)):
    # podpis_klienta może być np. dataURL lub tekst – backend odkłada tylko string do bazy
    repo.podpisz(conn, pnagl_id, podpis_klienta, kto)
    return {"ok": True}
