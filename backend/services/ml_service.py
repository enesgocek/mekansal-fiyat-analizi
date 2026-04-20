"""
Machine Learning and Data Processing Service.
Responsible for interacting with the AI model and parsing GIS/tabular datasets.
"""

import json
import joblib
import pandas as pd
from core.config import MODEL_FILE_PATH, DATASET_FILE_PATH, GEOJSON_FILE_PATH
from typing import Dict, Any

class MLService:
    def __init__(self) -> None:
        """Initialize the ML Service and load the predictive model eagerly."""
        self.model = self._load_model()
        self._init_water_boundaries()

    def _init_water_boundaries(self) -> None:
        """
        Initializes approximate geometric bounding boxes for major King County
        water bodies to compute true data-independent waterfront properties.
        """
        from shapely.geometry import box
        
        # Central/Major Lakes and Coastlines (Approximate bounding polygons)
        lake_washington = box(-122.30, 47.50, -122.20, 47.75)
        lake_sammamish = box(-122.12, 47.55, -122.06, 47.65)
        puget_sound = box(-122.50, 47.30, -122.35, 47.80)
        
        self.water_bodies = [lake_washington, lake_sammamish, puget_sound]

    def _is_waterfront(self, lat: float, lon: float) -> int:
        """
        Checks if a given coordinate is physically near a major water body.
        Uses a ~200m buffer zone check against shapely polygon boundaries.
        """
        from shapely.geometry import Point
        # Buffer of 0.002 degrees is approx 200 meters.
        target_point = Point(lon, lat).buffer(0.002)
        
        for pool in self.water_bodies:
            if target_point.intersects(pool):
                return 1
        return 0

    def _load_model(self) -> Any:
        """
        Loads the pre-trained ML model from disk.
        
        Returns:
            The loaded machine learning model.
            
        Raises:
            Exception: If the model file cannot be found or loaded.
        """
        try:
            print("Yapay Zeka Modeli yükleniyor...")
            model = joblib.load(MODEL_FILE_PATH)
            print("Model başarıyla yüklendi!")
            return model
        except Exception as e:
            print(f"HATA: Model yüklenemedi! Dosya eksik: {MODEL_FILE_PATH}. Detay: {e}")
            raise RuntimeError(f"Could not load ML model: {e}")

    def predict_price(self, payload: Dict[str, Any]) -> float:
        """
        Predicts the real estate price based on housing features.

        Args:
            payload (dict): A dictionary representation of house properties.

        Returns:
            float: The predicted price in USD.
        """
        # --- True Spatial Geometry Detection (Data-Independent) ---
        if "lat" in payload and "long" in payload:
            is_water = self._is_waterfront(payload["lat"], payload["long"])
            payload["waterfront"] = is_water
            
        df_istek = pd.DataFrame([payload])
        prediction = self.model.predict(df_istek)[0]
        return float(prediction)

    def get_geojson_boundary(self) -> Dict[str, Any]:
        """
        Loads the King County geojson boundary data.

        Returns:
            dict: The FeatureCollection geojson format dictionary.
        """
        with open(GEOJSON_FILE_PATH, "r", encoding="utf-8") as f:
            geometry = json.load(f)
            return {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": geometry,
                        "properties": {"name": "King County"}
                    }
                ]
            }

    def get_house_clusters(self) -> Dict[str, Any]:
        """
        Loads house location points from the dataset for rendering 3D clusters.

        Returns:
            dict: GeoJSON FeatureCollection containing all house points.
        """
        df_harita = pd.read_csv(DATASET_FILE_PATH, usecols=["long", "lat"]).dropna()
        features = []
        for row in df_harita.itertuples(index=False):
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(row.long), float(row.lat)]
                },
                "properties": {}
            })
            
        return {
            "type": "FeatureCollection",
            "features": features
        }

# Global singleton instance
ml_service = MLService()
