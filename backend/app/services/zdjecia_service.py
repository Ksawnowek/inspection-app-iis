import os
import uuid
import aiofiles
import asyncio
from pathlib import Path

from fastapi import HTTPException

from app.core.paths import STORAGE_DIR
from app.repositories.zdjecia_repo import ZdjeciaRepo


class ZdjeciaService:
    def __init__(self, repo: ZdjeciaRepo):
        self.repo = repo
        self.storage_dir = Path(STORAGE_DIR)
        self.photo_subdir_name = os.getenv("PHOTO_SUBDIR", "photos")
        self.photo_dir = self.storage_dir / self.photo_subdir_name
        self.photo_dir.mkdir(parents=True, exist_ok=True)

    async def add_pozycja_zdjecie(self, ppoz_id, file):
        file_ext = os.path.splitext(file.filename)[1]
        safe_filename = f"{uuid.uuid4()}{file_ext}"
        #TODO zmiana zhardcodeowanej wartości
        file_path = self.photo_dir / safe_filename
        try:
            async with aiofiles.open(file_path, "wb") as out_file:
                content = await file.read()
                await out_file.write(content)
        except Exception as e:
            print(f"BŁĄD REPOZYTORIUM: Nie udało się zapisać pliku {file_path}: {e}")
            raise HTTPException(status_code=500, detail="Błąd zapisu pliku na serwerze")

        file_url = f"/storage/{self.photo_subdir_name}/{safe_filename}"

        zdjecie = self.repo.dodaj_zdjecie(ppoz_id, file_url)

        return zdjecie

    def delete_pozycja_zdjecie(self, zdjp_id: int):
        zdjecie = self.repo.get_pozycja_zdjecie_by_id(zdjp_id)

        if zdjecie is None:
            raise HTTPException(status_code=404, detail="Nie znaleziono zdjęcia o podanym ID")

        try:
            file_name = Path(zdjecie.ZDJP_Sciezka).name
            file_path_to_delete = self.photo_dir / file_name
        except Exception as e:
            print(f"BŁĄD: Nie można ustalić ścieżki pliku dla {zdjecie.ZDJP_Sciezka}: {e}")
            raise HTTPException(status_code=500, detail="Błąd przetwarzania ścieżki pliku")

        try:
            os.remove(file_path_to_delete)
        except FileNotFoundError:
            print(f"OSTRZEŻENIE: Próbowano usunąć plik, którego nie ma na dysku: {file_path_to_delete}")
        except Exception as e:
            print(f"BŁĄD: Nie udało się usunąć pliku {file_path_to_delete}: {e}")
            raise HTTPException(status_code=500, detail=f"Błąd podczas usuwania pliku z dysku.")

        self.repo.delete_zdjecie(zdjecie)

        return True
