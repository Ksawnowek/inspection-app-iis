from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Response, status

from app.dependencies import get_zdjecia_service
from app.services.zdjecia_service import ZdjeciaService

router = APIRouter(prefix="/api/zdjecia", tags=["Zdjecia"])

@router.post("/pozycja/{ppoz_id}")
async def post_pozycja_zdjecie(ppoz_id: int, file: UploadFile = File(...), service: ZdjeciaService = Depends(get_zdjecia_service)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Dozwolone są tylko pliki obrazów")
    return await service.add_pozycja_zdjecie(ppoz_id, file)


@router.delete("/pozycja/{zdjp_id}")
def delete_pozycja_zdjecie(zdjp_id: int, service: ZdjeciaService = Depends(get_zdjecia_service)):
    service.delete_pozycja_zdjecie(zdjp_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
