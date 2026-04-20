"""
API Routing logic for the real estate prediction endpoints.
Provides clean HTTP separation invoking backend ML services.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.ml_service import ml_service
from typing import Dict, Any

router = APIRouter()

class EvOzellikleri(BaseModel):
    bedrooms: int = Field(..., ge=0, le=30, description="Oda sayısı 0-30 arası olmalı")
    bathrooms: float = Field(..., ge=0.0, le=20.0)
    sqft_living: int = Field(..., gt=100, le=50000, description="Evin içi en az 100 sqft olmalı")
    sqft_lot: int = Field(..., gt=0)
    floors: float = Field(..., ge=1.0, le=10.0)
    waterfront: int = Field(..., ge=0, le=1)
    view: int = Field(..., ge=0, le=4)
    condition: int = Field(..., ge=1, le=5)
    grade: int = Field(..., ge=1, le=13)
    sqft_above: int = Field(..., ge=0)
    sqft_basement: int = Field(..., ge=0)
    yr_built: int = Field(..., ge=1900, le=2026)
    yr_renovated: int = Field(..., ge=0)
    zipcode: int
    lat: float
    long: float
    sqft_living15: int
    sqft_lot15: int

@router.get("/")
def ana_sayfa() -> Dict[str, str]:
    """Root endpoint for API health check."""
    return {"mesaj": "Emlak Fiyat Tahmin API'si çalışıyor. Lütfen /docs adresine giderek arayüzü inceleyin."}

@router.post("/tahmin_et")
def fiyat_tahmini_yap(ev: EvOzellikleri) -> Dict[str, Any]:
    """
    Computes a ML price prediction for the given housing features.
    """
    try:
        # Compatibility with pydantic v1 (dict) and v2 (model_dump)
        payload = ev.model_dump() if hasattr(ev, 'model_dump') else ev.dict()
        tahmin_edilen_fiyat = ml_service.predict_price(payload)
        return {
            "durum": "basarili",
            "tahmini_fiyat_dolar": round(tahmin_edilen_fiyat, 2)
        }
    except Exception as e:
        return {
            "durum": "hata",
            "mesaj": f"Tahmin sırasında bir sorun oluştu: {str(e)}"
        }

@router.get("/king_county_boundary")
def get_king_county_boundary() -> Dict[str, Any]:
    """
    Returns the King County geographical boundary polygon logic.
    """
    try:
        return ml_service.get_geojson_boundary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/houses_geojson")
def get_houses_geojson() -> Dict[str, Any]:
    """
    Returns the dataset coordinate clusters.
    """
    try:
        return ml_service.get_house_clusters()
    except Exception as e:
        return {"error": f"Veri seti yüklenemedi: {str(e)}"}
