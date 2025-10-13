from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.routers import orders, inspections
app=FastAPI(title="Inspection API (IIS-ready)")
app.add_middleware(CORSMiddleware, allow_origins=settings.ALLOWED_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(orders.router); app.include_router(inspections.router)
@app.get("/healthz")
def health(): return {"status":"ok"}
