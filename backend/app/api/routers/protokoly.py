# app/routers/protokoly_router.py
# (Zależności: fastapi, app.dependencies.get_protokoly_service, app.errors)

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from fastapi.responses import FileResponse
from starlette import status

from app.domain.requestsDTO import ProtokolPozUpdateDTO, ProtokolNaglUpdateDTO
from app.schemas.protokoly import ZapisProtokolu
from app.services.PDF_service import PDFService
from app.services.protokoly_service import ProtokolyService
from app.dependencies import get_protokoly_service, get_pdf_service
from app.errors import ProtokolNotFound, PdfNotGenerated, SaveError

router = APIRouter(prefix="/api/protokoly", tags=["Protokoły"])

# Zamiast globalnego 'repo', wstrzykujemy 'service' do każdego endpointu
# @router.get("/{pnagl_id}")
# def podglad(pnagl_id: int, service: ProtokolyService = Depends(get_protokoly_service)):
#     try:
#         return service.get_protokol_details(pnagl_id)
#     except ProtokolNotFound as e:
#         raise HTTPException(status_code=404, detail=str(e))

@router.get("/naglowek/{pnagl_id}")
def get_pnagl_by_id(pnagl_id: int, service: ProtokolyService = Depends(get_protokoly_service)):
    try:
        return service.get_protokol_nagl_by_id(pnagl_id)
    except ProtokolNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/pozycje/{pnagl_id}")
def get_pozycje_by_id(pnagl_id: int, service: ProtokolyService = Depends(get_protokoly_service)):
    try:
        res = service.get_protokol_pozycje(pnagl_id)
        return res
    except ProtokolNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.patch("/pozycje/patch/{ppoz_id}")
def patch_pozycja(ppoz_id:int, update_dto: ProtokolPozUpdateDTO, service: ProtokolyService = Depends(get_protokoly_service)):
    try:
        updated_poz = service.patch_ppoz(ppoz_id, update_dto)
        return updated_poz
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.patch("/naglowek/{pnagl_id}")
def patch_naglowek(pnagl_id: int, update_dto: ProtokolNaglUpdateDTO, service: ProtokolyService = Depends(get_protokoly_service)):
    try:
        updated_nagl = service.patch_pnagl(pnagl_id, update_dto)
        return updated_nagl
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{pnagl_id}")
def zapisz(payload: ZapisProtokolu, service: ProtokolyService = Depends(get_protokoly_service)):
    # Zakładamy, że pnagl_id jest w payloadu lub nie jest potrzebne w serwisie
    # Jeśli jest potrzebne, dodaj: payload.pnagl_id = pnagl_id
    try:
        service.zapisz_pozycje(payload)
        return {"ok": True}
    except SaveError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{pnagl_id}/pdf")
def generuj(pnagl_id: int, service: ProtokolyService = Depends(get_protokoly_service)):
    try:
        return service.generuj_pdf_protokolu(pnagl_id)
    except ProtokolNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Ogólny błąd serwera
        raise HTTPException(status_code=500, detail=f"Błąd generowania PDF: {e}")

@router.get("/{pnagl_id}/pdf")
def pobierz(pnagl_id: int, service: ProtokolyService = Depends(get_protokoly_service)):
    try:
        path = service.get_sciezke_pdf(pnagl_id)
        return FileResponse(path, media_type="application/pdf", filename=f"protokol_{pnagl_id}.pdf")
    except (ProtokolNotFound, PdfNotGenerated) as e:
        raise HTTPException(status_code=404, detail=str(e))

# @router.post("/pozycje/{ppoz_id}/zdjecia")
# def dodaj_zdjecie(
#     ppoz_id: int,
#     plik: UploadFile = File(...),
#     service: ProtokolyService = Depends(get_protokoly_service)
# ):
#     try:
#         return service.dodaj_zdjecie(ppoz_id, plik)
#     except SaveError as e:
#         raise HTTPException(status_code=400, detail=str(e))

@router.post("/{pnagl_id}/podpis")
def podpis(
    pnagl_id: int,
    body: dict = Body(...),
    service: ProtokolyService = Depends(get_protokoly_service)
):
    try:
        podpis_klienta = body.get("podpis_klienta", "")
        kto = body.get("zaakceptowal", "Klient")
        return service.zapisz_podpis(pnagl_id, podpis_klienta, kto)
    except SaveError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/pozycja/{ppoz_id}/zdjecia")
async def post_pozycja_zdjecie(ppoz_id: int, file: UploadFile = File(...), service: ProtokolyService = Depends(get_protokoly_service)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Dozwolone są tylko pliki obrazów")
    return await service.add_pozycja_zdjecie(ppoz_id, file)


@router.post("/{pnagl_id}/pdf/generuj")
def generuj_pdf(
        pnagl_id: int,
        pdf_service: PDFService = Depends(get_pdf_service),
        body: dict | None = Body(None),
):
    serwisanci = (body or {}).get("serwisanci") or []
    try:
        out_path = pdf_service.generuj_pdf_protokol(
            pnagl_id
        )
    except Exception as e:
        # Obsługa innych błędów generowania
        raise HTTPException(500, detail="Błąd podczas generowania pliku PDF") from e

    return FileResponse(
        str(out_path),
        media_type="application/pdf",
        filename=f"protokol_{pnagl_id}.pdf"
    )