from sqlalchemy.types import TypeDecorator, NCHAR, CHAR, String
import sqlalchemy.types


class TrimmedString(TypeDecorator):
    """
    Typ, który automatycznie usuwa białe znaki z prawej strony (rstrip)
    przy każdym odczycie z bazy danych.

    Działa dla NCHAR, CHAR, VARCHAR, NVARCHAR itp.
    """
    impl = sqlalchemy.types.String
    cache_ok = True

    def process_result_value(self, value, dialect):
        return value.rstrip() if value is not None else None