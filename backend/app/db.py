import os
import urllib

import pyodbc
from contextlib import contextmanager
from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# ODBC: ustaw w .env
# MSSQL_ODBC_CONNSTR="DRIVER={ODBC Driver 18 for SQL Server};SERVER=host,1433;DATABASE=GHSerwis;UID=user;PWD=pass;Encrypt=yes;TrustServerCertificate=yes"

CONN_STR = os.getenv("MSSQL_ODBC_CONNSTR")
connect_url = "mssql+pyodbc:///?odbc_connect=" + urllib.parse.quote_plus(CONN_STR)
engine = create_engine(connect_url, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_raw_conn():
    if not CONN_STR:
        raise RuntimeError("Brak zmiennej środowiskowej MSSQL_ODBC_CONNSTR")
    return pyodbc.connect(CONN_STR)

@contextmanager
def connection():
    conn = get_raw_conn()
    try:
        yield conn
    finally:
        conn.close()

# FastAPI dependency
def get_conn():
    with connection() as c:
        yield c


def get_engine():
    """Zwraca instancję SQLAlchemy Engine bazującą na tym samym connection stringu."""
    if not CONN_STR:
        raise RuntimeError("Brak zmiennej środowiskowej MSSQL_ODBC_CONNSTR")

    # Zakodowanie connection stringu do formatu akceptowanego przez SQLAlchemy
    connect_url = "mssql+pyodbc:///?odbc_connect=" + urllib.parse.quote_plus(CONN_STR)

    # Utworzenie engine z opcjami zgodnymi z nowym API
    engine = create_engine(connect_url, future=True)
    return engine


def get_session():
    """
    Zależność (Dependency) FastAPI, która dostarcza sesję SQLAlchemy.
    Zapewnia, że sesja jest zawsze zamykana po zakończeniu żądania.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()