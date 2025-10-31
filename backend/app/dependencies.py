from fastapi import Depends, HTTPException, status, Cookie
from typing import Annotated, Optional

from sqlalchemy.orm import Session

from app.repositories.zadania_repo import ZadaniaRepo
from app.schemas.user import User
from app.services.auth_service import AuthService
from sqlalchemy.engine import Engine

from app.services.zadania_service import ZadaniaService


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
from app.db import get_conn, get_engine, get_session
from app.repositories.protokoly_repo import ProtokolyRepo
from app.services.file_service import FileService
from app.services.pdf_service import PdfService
from app.services.protokoly_service import ProtokolyService

def get_zadania_repo(conn: pyodbc.Connection = Depends(get_conn), session: Session = Depends(get_session))->ZadaniaRepo:
    return ZadaniaRepo(conn, session)

def get_protokoly_repo(conn: pyodbc.Connection = Depends(get_conn), session: Session = Depends(get_session)) -> ProtokolyRepo:
    return ProtokolyRepo(conn, session)

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

def get_zadania_service(
        repo: ZadaniaRepo = Depends(get_zadania_repo),
        session: Session = Depends(get_session)
) -> ZadaniaService:
    return ZadaniaService(repo, session)