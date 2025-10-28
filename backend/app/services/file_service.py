import os
from fastapi import UploadFile


class FileService:
    def __init__(self):
        # Konfigurację można też wstrzyknąć, ale os.getenv jest tu akceptowalne
        self.storage_dir = os.getenv("STORAGE_DIR", "./storage")
        self.pdf_subdir = os.getenv("PDF_SUBDIR", "pdfs")
        self.img_subdir = "images"

    def _ensure_dir(self, path: str):
        os.makedirs(path, exist_ok=True)

    def get_pdf_output_path(self, pnagl_id: int) -> str:
        base = os.path.join(self.storage_dir, self.pdf_subdir)
        self._ensure_dir(base)
        return os.path.join(base, f"protokol_{pnagl_id}.pdf")

    def save_image(self, plik: UploadFile) -> str:
        base = os.path.join(self.storage_dir, self.img_subdir)
        self._ensure_dir(base)
        sciezka = os.path.join(base, plik.filename)

        with open(sciezka, "wb") as f:
            f.write(plik.file.read())
        return sciezka

    def check_file_exists(self, path: str) -> bool:
        return os.path.exists(path)