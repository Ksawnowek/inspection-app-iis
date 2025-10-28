from typing import Optional
import datetime

from sqlalchemy import BigInteger, Boolean, Column, ForeignKeyConstraint, Identity, Index, Integer, NCHAR, PrimaryKeyConstraint, SmallInteger, Table, Unicode, text
from sqlalchemy.dialects.mssql import DATETIME2
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass


t_Kontrakt = Table(
    'Kontrakt', Base.metadata,
    Column('KONT_Id', Integer, Identity(start=1, increment=1), nullable=False),
    Column('KONT_Kontrakt', SmallInteger, nullable=False),
    Column('KONT_UrzadzenieNumer', NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False),
    Column('KONT_UrzadzenieOpis', NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
)


class Role(Base):
    __tablename__ = 'Role'
    __table_args__ = (
        PrimaryKeyConstraint('ROL_Id', name='PK_ROLE'),
    )

    ROL_Id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    ROL_Opis: Mapped[str] = mapped_column(NCHAR(10, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)

    Uzytkownik: Mapped[list['Uzytkownik']] = relationship('Uzytkownik', back_populates='Role_')


class UrGrupa(Base):
    __tablename__ = 'UrGrupa'
    __table_args__ = (
        PrimaryKeyConstraint('URG_Id', name='PK_PrzegladGrupa'),
    )

    URG_Id: Mapped[int] = mapped_column(Integer, primary_key=True)
    URG_Kod: Mapped[str] = mapped_column(NCHAR(2, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    URG_Typ: Mapped[str] = mapped_column(NCHAR(1, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    URG_Opis: Mapped[str] = mapped_column(NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)


t_UrOperacja = Table(
    'UrOperacja', Base.metadata,
    Column('URO_Id', Integer, nullable=False),
    Column('URO_URG_Id', Integer, nullable=False),
    Column('URO_Kod', NCHAR(2, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False),
    Column('URO_Opis', NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
)


class ZadanieNagl(Base):
    __tablename__ = 'ZadanieNagl'
    __table_args__ = (
        PrimaryKeyConstraint('ZNAG_Id', name='PK_ZadanieNaglowek'),
    )

    ZNAG_Id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ZNAG_DataDokumentu: Mapped[datetime.datetime] = mapped_column(DATETIME2, nullable=False)
    ZNAG_KlientNumer: Mapped[int] = mapped_column(BigInteger, nullable=False)
    ZNAG_KlientNazwa: Mapped[str] = mapped_column(NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    ZNAG_KlientTelefon: Mapped[str] = mapped_column(NCHAR(16, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    ZNAG_KlientAdres: Mapped[str] = mapped_column(NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    ZNAG_KlientMiasto: Mapped[str] = mapped_column(NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    ZNAG_KlientPowiat: Mapped[str] = mapped_column(NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    ZNAG_KategoriaKod: Mapped[str] = mapped_column(NCHAR(20, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    ZNAG_KategoriaOpis: Mapped[str] = mapped_column(NCHAR(20, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    ZNAG_Kontrakt: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    ZNAG_DataPlanowana: Mapped[datetime.datetime] = mapped_column(DATETIME2, nullable=False)
    ZNAG_TypPrzegladu: Mapped[Optional[str]] = mapped_column(NCHAR(1, 'SQL_Latin1_General_CP1_CI_AS'))
    ZNAG_Czestotliwosc: Mapped[Optional[int]] = mapped_column(SmallInteger)
    ZNAG_Osoby: Mapped[Optional[str]] = mapped_column(NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS'))
    ZNAG_DataWykonania: Mapped[Optional[datetime.datetime]] = mapped_column(DATETIME2)
    ZNAG_GodzSwieta: Mapped[Optional[str]] = mapped_column(NCHAR(25, 'SQL_Latin1_General_CP1_CI_AS'))
    ZNAG_GodzSobNoc: Mapped[Optional[str]] = mapped_column(NCHAR(25, 'SQL_Latin1_General_CP1_CI_AS'))
    ZNAG_GodzDojazdu: Mapped[Optional[str]] = mapped_column(NCHAR(25, 'SQL_Latin1_General_CP1_CI_AS'))
    ZNAG_GodzNaprawa: Mapped[Optional[str]] = mapped_column(NCHAR(25, 'SQL_Latin1_General_CP1_CI_AS'))
    ZNAG_GodzWyjazd: Mapped[Optional[str]] = mapped_column(NCHAR(25, 'SQL_Latin1_General_CP1_CI_AS'))
    ZNAG_GodzDieta: Mapped[Optional[str]] = mapped_column(NCHAR(25, 'SQL_Latin1_General_CP1_CI_AS'))
    ZNAG_GodzKm: Mapped[Optional[str]] = mapped_column(NCHAR(25, 'SQL_Latin1_General_CP1_CI_AS'))
    ZNAG_KlientNazwisko: Mapped[Optional[str]] = mapped_column(NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'))
    ZNAG_KlientDzial: Mapped[Optional[str]] = mapped_column(NCHAR(25, 'SQL_Latin1_General_CP1_CI_AS'))
    ZNAG_KlientDataZatw: Mapped[Optional[datetime.datetime]] = mapped_column(DATETIME2)
    ZNAG_KlientPodpis: Mapped[Optional[str]] = mapped_column(NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'))

    ZadaniePoz: Mapped[list['ZadaniePoz']] = relationship('ZadaniePoz', back_populates='ZadanieNagl_')


class Zdjecia(Base):
    __tablename__ = 'Zdjecia'
    __table_args__ = (
        PrimaryKeyConstraint('ZDJ_Id', name='PK_Zdjecia'),
    )

    ZDJ_Id: Mapped[int] = mapped_column(Integer, Identity(start=1, increment=1), primary_key=True)
    ZDJ_ParentId: Mapped[int] = mapped_column(Integer, nullable=False)
    ZDJ_Sciezka: Mapped[str] = mapped_column(NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)


t_v_ProtokolNaglWidok = Table(
    'v_ProtokolNaglWidok', Base.metadata,
    Column('PNAGL_Id', Integer, nullable=False),
    Column('PNAGL_ZPOZ_Id', Integer, nullable=False),
    Column('PNAGL_Typ', NCHAR(1, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False),
    Column('PNAGL_Tytul', NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False),
    Column('PNAGL_Klient', NCHAR(120, 'SQL_Latin1_General_CP1_CI_AS')),
    Column('PNAGL_Miejscowosc', NCHAR(120, 'SQL_Latin1_General_CP1_CI_AS')),
    Column('PNAGL_Producent', NCHAR(120, 'SQL_Latin1_General_CP1_CI_AS')),
    Column('PNAGL_Udzwig', NCHAR(20, 'SQL_Latin1_General_CP1_CI_AS')),
    Column('PNAGL_NrUrzadzenia', NCHAR(20, 'SQL_Latin1_General_CP1_CI_AS')),
    Column('PNAGL_ModelWciagnika', NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS')),
    Column('PNAGL_PodpisKlienta', NCHAR(10, 'SQL_Latin1_General_CP1_CI_AS')),
    Column('PNAGL_DataAkceptacji', DATETIME2),
    Column('PNAGL_UZTOstatni', NCHAR(50, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False),
    Column('PNAGL_PdfPath', Unicode(500, 'SQL_Latin1_General_CP1_CI_AS')),
    Column('ZPOZ_ZNAG_Id', Integer, nullable=False),
    Column('ZPOZ_UrzadzenieNumer', NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False),
    Column('ZPOZ_UrzadzenieOpis', NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False),
    Column('ZNAG_Kontrakt', SmallInteger, nullable=False),
    Column('ZNAG_KlientNazwa', NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False),
    Column('ZNAG_KlientMiasto', NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
)


t_v_ProtokolPozWidok = Table(
    'v_ProtokolPozWidok', Base.metadata,
    Column('PPOZ_Id', Integer, nullable=False),
    Column('PPOZ_PNAGL_Id', Integer, nullable=False),
    Column('PPOZ_Lp', SmallInteger, nullable=False),
    Column('PPOZ_GrupaOperacji', NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False),
    Column('PPOZ_Operacja', NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False),
    Column('PPOZ_OcenaNP', Boolean, nullable=False),
    Column('PPOZ_OcenaO', Boolean, nullable=False),
    Column('PPOZ_OcenaNR', Boolean, nullable=False),
    Column('PPOZ_OcenaNA', Boolean, nullable=False),
    Column('PPOZ_Uwagi', NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS')),
    Column('PPOZ_CzyZdjecia', Boolean, nullable=False),
    Column('PPOZ_UZTOstatni', NCHAR(50, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False),
    Column('ZdjeciaCount', Integer)
)


t_v_Zadania = Table(
    'v_Zadania', Base.metadata,
    Column('ZNAG_Id', Integer, nullable=False),
    Column('ZNAG_DataDokumentu', DATETIME2, nullable=False),
    Column('ZNAG_Kontrakt', SmallInteger, nullable=False),
    Column('ZNAG_KlientNazwa', NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False),
    Column('ZNAG_KlientMiasto', NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False),
    Column('ZNAG_TypPrzegladu', NCHAR(1, 'SQL_Latin1_General_CP1_CI_AS')),
    Column('Poz_All', Integer),
    Column('Poz_DoPrzegladu', Integer),
    Column('Protokoly_Aktywne', Integer),
    Column('Protokoly_Zamkniete', Integer)
)


t_v_ZadaniePozycje = Table(
    'v_ZadaniePozycje', Base.metadata,
    Column('ZPOZ_Id', Integer, nullable=False),
    Column('ZPOZ_ZNAG_Id', Integer, nullable=False),
    Column('ZPOZ_UrzadzenieNumer', NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False),
    Column('ZPOZ_UrzadzenieOpis', NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False),
    Column('ZPOZ_UrzadzenieDoPrzegladu', Boolean, nullable=False),
    Column('PNAGL_Id', Integer),
    Column('PNAGL_Aktywny', Integer),
    Column('PNAGL_DataAkceptacji', DATETIME2)
)


class Uzytkownik(Base):
    __tablename__ = 'Uzytkownik'
    __table_args__ = (
        ForeignKeyConstraint(['UZT_ROL_Id'], ['Role.ROL_Id'], name='FK_UZYTKOWNIK_ROLE'),
        PrimaryKeyConstraint('UZT_Id', name='PK_UZYTKOWNIK'),
        Index('IX_UZYTKOWNIK', 'UZT_Id')
    )

    UZT_Id: Mapped[int] = mapped_column(SmallInteger, Identity(start=1, increment=1), primary_key=True)
    UZT_Imie: Mapped[str] = mapped_column(NCHAR(25, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    UZT_Nazwisko: Mapped[str] = mapped_column(NCHAR(40, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    UZT_ROL_Id: Mapped[int] = mapped_column(SmallInteger, nullable=False, server_default=text('((101))'))
    UZT_TS: Mapped[datetime.datetime] = mapped_column(DATETIME2, nullable=False, server_default=text('(getdate())'))
    UZT_Login: Mapped[Optional[str]] = mapped_column(NCHAR(10, 'SQL_Latin1_General_CP1_CI_AS'))
    UZT_pwd: Mapped[Optional[str]] = mapped_column(NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'))

    Role_: Mapped['Role'] = relationship('Role', back_populates='Uzytkownik')


class ZadaniePoz(Base):
    __tablename__ = 'ZadaniePoz'
    __table_args__ = (
        ForeignKeyConstraint(['ZPOZ_ZNAG_Id'], ['ZadanieNagl.ZNAG_Id'], name='FK_ZadaniePoz_ZadanieNagl'),
        PrimaryKeyConstraint('ZPOZ_Id', name='PK_ZadaniePoz'),
        Index('IX_ZadaniePoz', 'ZPOZ_ZNAG_Id')
    )

    ZPOZ_Id: Mapped[int] = mapped_column(Integer, Identity(start=1, increment=1), primary_key=True)
    ZPOZ_ZNAG_Id: Mapped[int] = mapped_column(Integer, nullable=False)
    ZPOZ_UrzadzenieNumer: Mapped[str] = mapped_column(NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    ZPOZ_UrzadzenieOpis: Mapped[str] = mapped_column(NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    ZPOZ_UrzadzenieDoPrzegladu: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('((1))'))

    ZadanieNagl_: Mapped['ZadanieNagl'] = relationship('ZadanieNagl', back_populates='ZadaniePoz')
    ProtokolNagl: Mapped[list['ProtokolNagl']] = relationship('ProtokolNagl', back_populates='ZadaniePoz_')


class ProtokolNagl(Base):
    __tablename__ = 'ProtokolNagl'
    __table_args__ = (
        ForeignKeyConstraint(['PNAGL_ZPOZ_Id'], ['ZadaniePoz.ZPOZ_Id'], name='FK_ProtokolNagl_ZadanieNagl'),
        PrimaryKeyConstraint('PNAGL_Id', name='PK_ProtokolNNagl')
    )

    PNAGL_Id: Mapped[int] = mapped_column(Integer, Identity(start=1, increment=1), primary_key=True)
    PNAGL_ZPOZ_Id: Mapped[int] = mapped_column(Integer, nullable=False)
    PNAGL_Typ: Mapped[str] = mapped_column(NCHAR(1, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    PNAGL_Tytul: Mapped[str] = mapped_column(NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    PNAGL_Aktywny: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('((1))'))
    PNAGL_UZTOstatni: Mapped[str] = mapped_column(NCHAR(50, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False, server_default=text("(N'System')"))
    PNAGL_TS: Mapped[datetime.datetime] = mapped_column(DATETIME2, nullable=False, server_default=text('(getdate())'))
    PNAGL_Klient: Mapped[Optional[str]] = mapped_column(NCHAR(120, 'SQL_Latin1_General_CP1_CI_AS'))
    PNAGL_Miejscowosc: Mapped[Optional[str]] = mapped_column(NCHAR(120, 'SQL_Latin1_General_CP1_CI_AS'))
    PNAGL_Producent: Mapped[Optional[str]] = mapped_column(NCHAR(120, 'SQL_Latin1_General_CP1_CI_AS'))
    PNAGL_Udzwig: Mapped[Optional[str]] = mapped_column(NCHAR(20, 'SQL_Latin1_General_CP1_CI_AS'))
    PNAGL_NrUrzadzenia: Mapped[Optional[str]] = mapped_column(NCHAR(20, 'SQL_Latin1_General_CP1_CI_AS'))
    PNAGL_ModelWciagnika: Mapped[Optional[str]] = mapped_column(NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'))
    PNAGL_Uwagi: Mapped[Optional[str]] = mapped_column(NCHAR(512, 'SQL_Latin1_General_CP1_CI_AS'))
    PNAGL_CzyZaakceptowany: Mapped[Optional[bool]] = mapped_column(Boolean)
    PNAGL_Zaakceptowal: Mapped[Optional[str]] = mapped_column(NCHAR(50, 'SQL_Latin1_General_CP1_CI_AS'))
    PNAGL_PodpisKlienta: Mapped[Optional[str]] = mapped_column(NCHAR(10, 'SQL_Latin1_General_CP1_CI_AS'))
    PNAGL_DataAkceptacji: Mapped[Optional[datetime.datetime]] = mapped_column(DATETIME2)
    PNAGL_PdfPath: Mapped[Optional[str]] = mapped_column(Unicode(500, 'SQL_Latin1_General_CP1_CI_AS'))

    ZadaniePoz_: Mapped['ZadaniePoz'] = relationship('ZadaniePoz', back_populates='ProtokolNagl')
    ProtokolPoz: Mapped[list['ProtokolPoz']] = relationship('ProtokolPoz', back_populates='ProtokolNagl_')


class ProtokolPoz(Base):
    __tablename__ = 'ProtokolPoz'
    __table_args__ = (
        ForeignKeyConstraint(['PPOZ_PNAGL_Id'], ['ProtokolNagl.PNAGL_Id'], name='FK_ProtokolPoz_ProtokolNagl'),
        PrimaryKeyConstraint('PPOZ_Id', name='PK_ProtokolPoz')
    )

    PPOZ_Id: Mapped[int] = mapped_column(Integer, Identity(start=1, increment=1), primary_key=True)
    PPOZ_PNAGL_Id: Mapped[int] = mapped_column(Integer, nullable=False)
    PPOZ_Lp: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    PPOZ_GrupaOperacji: Mapped[str] = mapped_column(NCHAR(60, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    PPOZ_Operacja: Mapped[str] = mapped_column(NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False)
    PPOZ_OcenaNP: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('((0))'))
    PPOZ_OcenaO: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('((0))'))
    PPOZ_OcenaNR: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('((0))'))
    PPOZ_OcenaNA: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('((0))'))
    PPOZ_CzyZdjecia: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('((0))'))
    PPOZ_UZTOstatni: Mapped[str] = mapped_column(NCHAR(50, 'SQL_Latin1_General_CP1_CI_AS'), nullable=False, server_default=text("(N'System')"))
    PPOZ_TS: Mapped[datetime.datetime] = mapped_column(DATETIME2, nullable=False, server_default=text('(getdate())'))
    PPOZ_Uwagi: Mapped[Optional[str]] = mapped_column(NCHAR(255, 'SQL_Latin1_General_CP1_CI_AS'))

    ProtokolNagl_: Mapped['ProtokolNagl'] = relationship('ProtokolNagl', back_populates='ProtokolPoz')
