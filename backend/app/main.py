from fastapi import Request
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles
from app.api.routers.zadania import router as zadania_router
from app.api.routers.protokoly import router as protokoly_router
from app.api.routers.zdjecia import router as zdjecia_router
from app.api.routers.auth import router as auth_router
from app.core.paths import PDF_DIR, SIG_DIR, STORAGE_DIR  # sam import utworzy katalogi
from fastapi.security import OAuth2PasswordBearer

ALLOWED = os.getenv("ALLOWED_ORIGINS", "http://localhost:8080,http://localhost:5173").split(",")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
app = FastAPI(title="GHSerwis API")

app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/healthz")
def healthz(): 
    return {"status": "ok"}

app.include_router(zadania_router)
app.include_router(protokoly_router)
app.include_router(auth_router)
app.include_router(zdjecia_router)


@app.middleware("http")
async def measure_header_size_middleware(request: Request, call_next):
    # Pozwól endpointowi (np. /api/auth/login) wygenerować odpowiedź
    response = await call_next(request)

    # Przechwytujemy odpowiedź TUŻ ZANIM zostanie wysłana do Nginxa

    # Sprawdzamy tylko ścieżkę logowania, żeby nie spamować logów
    if "/api/auth/login" in request.url.path:

        # Używamy sys.stderr, aby logi pojawiły się natychmiast
        print("\n--- 🕵️‍♂️ ANALIZA NAGŁÓWKÓW ODPOWIEDZI Z PYTHONA ---", file=sys.stderr)

        total_size_bytes = 0

        # response.headers działa jak słownik
        for name, value in response.headers.items():
            # Standardowy format nagłówka to: "Nazwa: Wartość\r\n"
            # Liczymy rozmiar w bajtach (utf-8 jest bezpiecznym kodowaniem)
            header_line = f"{name}: {value}\r\n"
            line_size = len(header_line.encode('utf-8'))

            total_size_bytes += line_size

            print(f"  > Nagłówek: {name}", file=sys.stderr)
            print(f"    Rozmiar: {line_size} bajtów", file=sys.stderr)

            # Pokażmy fragment ciastek dla kontekstu
            if name.lower() == 'set-cookie':
                print(f"    Wartość (fragment): {value[:40]}...", file=sys.stderr)

        # Trzeba też dodać linię statusu, np. "HTTP/1.1 200 OK\r\n"
        # Załóżmy bezpiecznie, że to ok. 30 bajtów
        total_size_bytes += 30

        print("\n" + "=" * 40, file=sys.stderr)
        print(f"  ŁĄCZNY ROZMIAR NAGŁÓWKÓW: {total_size_bytes} bajtów", file=sys.stderr)
        print(f"  (Czyli około: {total_size_bytes / 1024:.2f} kB)", file=sys.stderr)
        print("=" * 40 + "\n", file=sys.stderr)

    return response
