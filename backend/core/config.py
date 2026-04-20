"""
Core configuration module for the application.
Handles absolute path resolution and environment settings.
"""

from pathlib import Path
from typing import List

# Root directory resolution (dynamically finds the project root folder)
# __file__ gives .../backend/core/config.py
# .parent.parent.parent gives the root
BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent

# Resolve critical directory paths
MODELS_DIR: Path = BASE_DIR / "models"

# Specific file paths
MODEL_FILE_PATH: Path = MODELS_DIR / "ev_fiyat_modeli.pkl"
DATASET_FILE_PATH: Path = MODELS_DIR / "kc_house_data.csv"
GEOJSON_FILE_PATH: Path = MODELS_DIR / "king_county.geojson"

# CORS Configuration
ALLOWED_ORIGINS: List[str] = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:3000",
]
