from sqlalchemy.orm import Session

from app.models.models import ZdjeciaProtokolPoz
from app.repositories.protokoly_repo import ProtokolyRepo


class ZdjeciaRepo:
    def __init__(self,  session: Session):
        self.session = session

    def dodaj_zdjecie(self, parent_ppoz_id: int, sciezka: str):
        zdjecie = ZdjeciaProtokolPoz()
        zdjecie.ZDJP_PPOZ_Id = parent_ppoz_id
        zdjecie.ZDJP_Sciezka = sciezka
        self.session.add(zdjecie)
        return zdjecie

    def get_pozycja_zdjecie_by_id(self, zdjp_id):
        return self.session.get(ZdjeciaProtokolPoz, zdjp_id)

    def delete_zdjecie(self, zdjecie):
        self.session.delete(zdjecie)