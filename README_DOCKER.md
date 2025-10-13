# Docker kit (dev/stage) + workflow do IIS na końcu
1) Skopiuj pliki:
   - `backend.Dockerfile` -> `backend/Dockerfile`
   - `frontend.Dockerfile` -> `frontend/Dockerfile`
   - `docker-compose.yml` do katalogu głównego projektu
   - `docker/nginx/default.conf` w tej samej strukturze
2) Skopiuj `backend.env.docker.example` do `backend/.env.docker` i uzupełnij połączenie do MSSQL.
3) Uruchom: `docker compose up --build`
   - Frontend: http://localhost:8080
   - API: http://localhost:8001/api
Na produkcję pod IIS zbuduj artefakty (frontend `dist/`, backend jako usługa Windows) i skonfiguruj proxy `/api`.
