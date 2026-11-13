"""
AQUALUME - Real-time ML Predictor
Loads trained Random Forest model and provides inference functions.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

FEATURE_NAMES = [
    "cloud_cover_percent",
    "solar_irradiance",
    "underwater_light_level",
    "turbidity",
    "time_of_day",
    "low_light_duration_minutes",
]

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "random_forest_model.joblib")

class MarineMLPredictor:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
        else:
            self.model = None

    def predict(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Infers illumination_required and probability for a given feature vector.
        """
        if self.model is None:
            self.load_model()
            if self.model is None:
                raise RuntimeError("ML model file not found. Run app.ml.train first.")

        # Ensure correct ordering of features
        feature_vector = pd.DataFrame([{
            "cloud_cover_percent": float(features.get("cloud_cover_percent", 0.0)),
            "solar_irradiance": float(features.get("solar_irradiance", 0.0)),
            "underwater_light_level": float(features.get("underwater_light_level", 0.0)),
            "turbidity": float(features.get("turbidity", 0.0)),
            "time_of_day": float(features.get("time_of_day", 12.0)),
            "low_light_duration_minutes": float(features.get("low_light_duration_minutes", 0.0)),
        }])[FEATURE_NAMES]

        pred = int(self.model.predict(feature_vector)[0])
        probabilities = self.model.predict_proba(feature_vector)[0]
        prob_illumination = float(probabilities[1]) if len(probabilities) > 1 else float(probabilities[0])

        return {
            "illumination_required": pred,
            "probability": round(prob_illumination, 4),
            "model_status": "SYNTHETIC_EVALUATION_MODEL",
            "model_type": "RandomForestClassifier",
            "features_evaluated": features,
            "notice": "Trained exclusively on synthetic development data for software prototype evaluation. Not calibrated for physical in-situ deployment without marine sensor baseline.",
        }

# Global singleton predictor instance
ml_predictor = MarineMLPredictor()
