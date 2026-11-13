"""
DARKWAVE - Autonomous Marine Supplemental Lighting System
FastAPI Machine Learning Inference & Telemetry Service

DISCLAIMER:
All predictions and telemetry represent SYNTHETIC DEVELOPMENT DATA
for software prototype evaluation.
"""

import os
import json
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from app.core.config import settings
from app.simulation.environment import MarineEnvironmentSimulator
from app.simulation.sensors import SensorSimulator
from app.simulation.led_controller import DecisionEngineController
from app.ml.predictor import ml_predictor
from app.integrations import spark_client

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="DARKWAVE - ML Decision Backend & Simulated Telemetry API",
    version="1.0.0",
)

# Enable CORS for frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulation state singletons
env_sim = MarineEnvironmentSimulator()
sensor_sim = SensorSimulator()
decision_engine = DecisionEngineController(
    threshold_lux=settings.DEFAULT_UNDERWATER_THRESHOLD_LUX,
    persistence_duration_minutes=settings.DEFAULT_PERSISTENCE_DURATION_MINUTES,
)

# Pydantic schema for prediction input
class PredictRequest(BaseModel):
    cloud_cover_percent: float = Field(..., ge=0.0, le=100.0, description="Atmospheric cloud cover percentage (0-100%)")
    solar_irradiance: float = Field(..., ge=0.0, le=1500.0, description="Surface solar irradiance in W/m²")
    underwater_light_level: float = Field(..., ge=0.0, le=50000.0, description="Submerged photopic illuminance at depth in Lux")
    turbidity: float = Field(..., ge=0.0, le=200.0, description="Water column optical turbidity in NTU")
    time_of_day: float = Field(..., ge=0.0, le=24.0, description="Diurnal time in 24-hour decimal format (e.g. 13.08)")
    low_light_duration_minutes: float = Field(..., ge=0.0, le=500.0, description="Continuous duration below threshold in minutes")

    model_config = {
        "json_schema_extra": {
            "example": {
                "cloud_cover_percent": 82.0,
                "solar_irradiance": 132.0,
                "underwater_light_level": 148.0,
                "turbidity": 38.0,
                "time_of_day": 13.08,
                "low_light_duration_minutes": 34.0,
            }
        }
    }

class PredictResponse(BaseModel):
    illumination_required: int
    probability: float
    model_status: str
    model_type: str = "RandomForestClassifier"
    notice: str = "Trained exclusively on synthetic development data for software prototype evaluation. Not calibrated for physical in-situ deployment without marine sensor baseline."


class SparkReading(BaseModel):
    batch_id: str
    record_id: str
    timestamp: str
    weather_condition: str
    cloud_cover_percent: float
    solar_irradiance: float
    underwater_light_level: float
    turbidity: float
    temperature: float
    depth: float
    low_light_duration_minutes: float
    is_synthetic: bool = True

@app.get("/")
def read_root():
    return {
        "system": "DARKWAVE",
        "subtitle": "Autonomous Marine Supplemental Lighting System",
        "notice": settings.SIMULATED_DATA_NOTICE,
        "status": "OPERATIONAL",
        "ml_model": "RandomForestClassifier (Trained on 6,000 synthetic records)",
    }

@app.post("/predict", response_model=PredictResponse)
@app.post("/api/v1/predict", response_model=PredictResponse)
def predict_illumination(payload: PredictRequest):
    """
    POST /predict
    Evaluates environmental features using trained Random Forest Classifier
    and returns illumination_required (0 or 1) and confidence probability.
    """
    try:
        features = {
            "cloud_cover_percent": payload.cloud_cover_percent,
            "solar_irradiance": payload.solar_irradiance,
            "underwater_light_level": payload.underwater_light_level,
            "turbidity": payload.turbidity,
            "time_of_day": payload.time_of_day,
            "low_light_duration_minutes": payload.low_light_duration_minutes,
        }
        result = ml_predictor.predict(features)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics")
@app.get("/api/v1/metrics")
def get_model_metrics():
    """
    Returns model training and evaluation metrics (Accuracy, Precision, Recall, F1, Confusion Matrix).
    """
    metrics_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "ml", "models", "metrics.json"
    )
    if not os.path.exists(metrics_path):
        raise HTTPException(status_code=404, detail="Model metrics file not found. Run training pipeline first.")

    with open(metrics_path, "r") as f:
        data = json.load(f)
    return data

@app.get("/api/v1/telemetry/live")
def get_live_telemetry():
    env_state = env_sim.get_state()
    is_led_on = decision_engine.lighting_state == "ACTIVE_SUPPLEMENTAL"
    telemetry = sensor_sim.read_telemetry(env_state, is_led_on)
    decision = decision_engine.get_state()

    return {
        "synthetic_notice": settings.SIMULATED_DATA_NOTICE,
        "environment": env_state,
        "telemetry": telemetry,
        "decision_engine": decision,
    }


@app.get("/api/v1/spark/health")
def spark_health():
    try:
        return spark_client.health()
    except spark_client.SparkServiceError as error:
        raise HTTPException(status_code=503, detail=str(error))


@app.post("/api/v1/spark/process", status_code=status.HTTP_202_ACCEPTED)
def spark_process(readings: list[SparkReading]):
    if not readings:
        raise HTTPException(status_code=422, detail="At least one sensor reading is required")
    try:
        return spark_client.submit_batch([reading.model_dump() for reading in readings])
    except spark_client.SparkServiceError as error:
        raise HTTPException(status_code=503, detail=str(error))


@app.get("/api/v1/spark/batches/{batch_id}")
def spark_batch(batch_id: str):
    try:
        return spark_client.batch_status(batch_id)
    except spark_client.SparkServiceError as error:
        raise HTTPException(status_code=404 if "not found" in str(error) else 503, detail=str(error))


@app.get("/api/v1/spark/batches")
def spark_batches():
    try:
        return spark_client.batches()
    except spark_client.SparkServiceError as error:
        raise HTTPException(status_code=503, detail=str(error))


@app.get("/api/v1/spark/batches/{batch_id}/records")
def spark_batch_records(batch_id: str):
    try:
        return spark_client.batch_records(batch_id)
    except spark_client.SparkServiceError as error:
        raise HTTPException(status_code=503, detail=str(error))


@app.get("/api/v1/spark/analytics")
def spark_analytics(batch_id: str | None = None):
    try:
        return spark_client.analytics(batch_id)
    except spark_client.SparkServiceError as error:
        raise HTTPException(status_code=503, detail=str(error))


@app.get("/api/v1/spark/weather-summary")
def spark_weather_summary():
    try:
        return spark_client.weather_summary()
    except spark_client.SparkServiceError as error:
        raise HTTPException(status_code=503, detail=str(error))


@app.get("/api/v1/spark/streaming/status")
def spark_streaming_status():
    try:
        return spark_client.streaming_status()
    except spark_client.SparkServiceError as error:
        raise HTTPException(status_code=503, detail=str(error))


@app.post("/api/v1/spark/predict/{batch_id}")
def spark_batch_predict(batch_id: str):
    try:
        records = spark_client.batch_records(batch_id).get("records", [])
    except spark_client.SparkServiceError as error:
        raise HTTPException(status_code=503, detail=str(error))
    predictions = []
    for record in records:
        timestamp = record.get("timestamp", "")
        try:
            from datetime import datetime
            time_of_day = datetime.fromisoformat(timestamp.replace("Z", "+00:00")).hour
            features = {
                "cloud_cover_percent": record["cloud_cover_percent"],
                "solar_irradiance": record["solar_irradiance"],
                "underwater_light_level": record["underwater_light_level"],
                "turbidity": record["turbidity"],
                "time_of_day": float(time_of_day),
                "low_light_duration_minutes": record["low_light_duration_minutes"],
            }
            predictions.append({"record_id": record["record_id"], "prediction": ml_predictor.predict(features)})
        except (KeyError, TypeError, ValueError) as error:
            raise HTTPException(status_code=422, detail=f"Invalid cleaned record: {error}")
    return {"batch_id": batch_id, "predictions": predictions, "synthetic_notice": settings.SIMULATED_DATA_NOTICE}
