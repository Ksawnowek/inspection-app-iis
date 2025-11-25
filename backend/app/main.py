import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles
from app.api.routers.zadania import router as zadania_router
from app.api.routers.protokoly import router as protokoly_router
from app.api.routers.zdjecia import router as zdjecia_router
from app.api.routers.users import router as users_router
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
app.include_router(users_router)

