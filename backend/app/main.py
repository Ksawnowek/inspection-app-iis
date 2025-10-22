from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api.routers.zadania import router as zadania_router
from app.api.routers.protokoly import router as protokoly_router
from app.api.routers.auth import router as auth_router
from app.core.paths import PDF_DIR, SIG_DIR  # sam import utworzy katalogi

ALLOWED = os.getenv("ALLOWED_ORIGINS", "http://localhost:8080,http://localhost:5173").split(",")

app = FastAPI(title="GHSerwis API")

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



