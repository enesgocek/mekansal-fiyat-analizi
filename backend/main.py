"""
Main application entry point.
Initializes FastAPI, binds CORS configurations, and attaches routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from core.config import ALLOWED_ORIGINS

app = FastAPI(
    title="Emlak Fiyat Tahmin Platformu",
    description="Seattle ML Housing Valuation API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect the API endpoints
app.include_router(router)
