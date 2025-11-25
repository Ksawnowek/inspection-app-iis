from pathlib import Path
import os

STORAGE_DIR = Path(os.getenv("STORAGE_DIR", "./storage")).resolve()
PDF_DIR = STORAGE_DIR / os.getenv("PDF_SUBDIR", "pdfs")
SIG_DIR = STORAGE_DIR / os.getenv("SIG_SUBDIR", "sigs")
PHOTO_DIR = STORAGE_DIR / os.getenv("PHOTO_SUBDIR", "photos")

for p in (STORAGE_DIR, PDF_DIR, SIG_DIR, PHOTO_DIR):
    p.mkdir(parents=True, exist_ok=True)
