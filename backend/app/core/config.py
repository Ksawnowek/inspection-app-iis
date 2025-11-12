import os
from dotenv import load_dotenv
load_dotenv()
class Settings:
    APP_HOST=os.getenv("APP_HOST","127.0.0.1")
    APP_PORT=int(os.getenv("APP_PORT","8001"))
    ALLOWED_ORIGINS=[o.strip() for o in os.getenv("ALLOWED_ORIGINS","http://localhost:5173").split(",")]
    MSSQL_ODBC_CONNSTR=os.getenv("MSSQL_ODBC_CONNSTR","")
    STORAGE_DIR=os.getenv("STORAGE_DIR","./storage")
    PDF_SUBDIR=os.getenv("PDF_SUBDIR","pdfs")
    SIG_SUBDIR=os.getenv("SIG_SUBDIR","sigs")
    PHOTO_SUBDIR=os.getenv("PHOTO_SUBDIR","photos")
    FTP={"host":os.getenv("FTP_HOST",""),"port":int(os.getenv("FTP_PORT","21")),"user":os.getenv("FTP_USER",""),"pass":os.getenv("FTP_PASS",""),"basedir":os.getenv("FTP_BASEDIR","/reports")}
    SFTP={"host":os.getenv("SFTP_HOST",""),"port":int(os.getenv("SFTP_PORT","22")),"user":os.getenv("SFTP_USER",""),"pass":os.getenv("SFTP_PASS",""),"basedir":os.getenv("SFTP_BASEDIR","/reports")}
    SECRET_KEY = os.getenv("SECRET_KEY","")
    TOKEN_ALGORITHM = os.getenv("ALGORITHM","")
    ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES",480)
    REFRESH_TOKEN_EXPIRE_DAYS = os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 30)
    REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY","")
settings=Settings()
