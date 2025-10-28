from fastapi import Depends, HTTPException, status, Cookie
from typing import Annotated, Optional

from app.schemas.user import User
from app.services.auth_service import AuthService


async def get_current_user_from_cookie(
    service: Annotated[AuthService, Depends()],
    access_token: Annotated[str | None, Cookie()] = None
) -> User:
    if access_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated (no cookie)",
        )
    user_data = service.validate_and_decode_token(access_token)

    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials (invalid token)",
        )

    return user_data

# app/dependencies.py
# (Zależności: fastapi.Depends, app.db.get_conn, ...wszystkie serwisy i repo...)

import pyodbc
from fastapi import Depends
from app.db import get_conn  # Zakładam, że ten plik istnieje
from app.repositories.protokoly_repo import ProtokolyRepo
from app.services.file_service import FileService
from app.services.pdf_service import PdfService
from app.services.protokoly_service import ProtokolyService


def get_protokoly_repo(conn: pyodbc.Connection = Depends(get_conn)) -> ProtokolyRepo:
    return ProtokolyRepo(conn)

def get_file_service() -> FileService:
    return FileService()

def get_pdf_service() -> PdfService:
    return PdfService()

def get_protokoly_service(
    repo: ProtokolyRepo = Depends(get_protokoly_repo),
    file_service: FileService = Depends(get_file_service),
    pdf_service: PdfService = Depends(get_pdf_service)
) -> ProtokolyService:
    return ProtokolyService(repo, file_service, pdf_service)