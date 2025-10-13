# Inspection API (Service + Repository, IIS-ready)
Warstwy: repositories (MSSQL procs/views), services (logika, PDF, FTP/SFTP), api (FastAPI).
## Start lokalny
```
python -m venv .venv && . .venv/Scripts/activate
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```
## IIS
- ARR + URL Rewrite, proxy `/api` -> `http://127.0.0.1:8001`
- `windows/install_service.ps1` (NSSM) – usługa Windows dla Uvicorn
## SQL
Uruchom `scripts/sql/*.sql` w bazie MSSQL.
