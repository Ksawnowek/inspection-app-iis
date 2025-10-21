import os
import pyodbc
from contextlib import contextmanager
from fastapi import Depends

# ODBC: ustaw w .env
# MSSQL_ODBC_CONNSTR="DRIVER={ODBC Driver 18 for SQL Server};SERVER=host,1433;DATABASE=GHSerwis;UID=user;PWD=pass;Encrypt=yes;TrustServerCertificate=yes"

CONN_STR = os.getenv("MSSQL_ODBC_CONNSTR")

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
