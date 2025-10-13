import pyodbc
from ..core.config import settings
def get_conn():
    if not settings.MSSQL_ODBC_CONNSTR:
        raise RuntimeError("MSSQL_ODBC_CONNSTR is not configured")
    return pyodbc.connect(settings.MSSQL_ODBC_CONNSTR)
