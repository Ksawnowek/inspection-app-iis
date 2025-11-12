from fastapi import HTTPException, status, Cookie
from typing import Annotated
from sqlalchemy.orm import Session
from app.models.models import Uzytkownik
from app.repositories.users_repo import UserRepo
from app.repositories.zadania_repo import ZadaniaRepo
from app.repositories.zdjecia_repo import ZdjeciaRepo
from app.services.auth_service import AuthService
from app.services.zadania_service import ZadaniaService
from app.services.zdjecia_service import ZdjeciaService
from app.core.paths import PDF_DIR
from fastapi import Depends
from app.db import get_session
from app.repositories.protokoly_repo import ProtokolyRepo
from app.services.file_service import FileService
from app.services.PDF_service import PDFService
from app.services.protokoly_service import ProtokolyService
from app.services.pdf_service_old import PdfService

def get_user_repo(session: Session = Depends(get_session)) -> UserRepo:
    return UserRepo(session)

def get_zadania_repo(session: Session = Depends(get_session))->ZadaniaRepo:
    return ZadaniaRepo(session)

def get_protokoly_repo(session: Session = Depends(get_session)) -> ProtokolyRepo:
    return ProtokolyRepo( session)

def get_zdjecia_repo(
    session: Session = Depends(get_session)
) -> ZdjeciaRepo:
    return ZdjeciaRepo(session)

def get_auth_service(
        repo: UserRepo = Depends(get_user_repo)
):
    return AuthService(repo)

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


def get_zdjecia_service(
        repo: ZdjeciaRepo = Depends(get_zdjecia_repo)
)-> ZdjeciaService:
    return ZdjeciaService(repo)

def get_pdf_service(
        zadania_service: ZadaniaService = Depends(get_zadania_service),
        protokoly_service: ProtokolyService = Depends(get_protokoly_service)
):
    return PDFService(zadania_service, protokoly_service, PDF_DIR)

async def get_current_user_from_cookie(
    service: AuthService = Depends(get_auth_service),
    access_token: Annotated[str | None, Cookie()] = None
) -> Uzytkownik:
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