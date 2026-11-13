"""
DARKWAVE - Core Configuration Settings
"""
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "DARKWAVE - Autonomous Marine Supplemental Lighting System"
    API_V1_STR: str = "/api/v1"
    SIMULATED_DATA_NOTICE: str = "SOFTWARE PROTOTYPE - Synthetic / Simulated Marine Sensor Environment"
    
    # Default persistence parameters
    DEFAULT_UNDERWATER_THRESHOLD_LUX: float = 250.0
    DEFAULT_PERSISTENCE_DURATION_MINUTES: float = 3.0
    DEFAULT_TARGET_DEPTH_METERS: float = 3.5
    
    # LED hardware parameters
    LED_MAX_POWER_WATTS: float = 65.0
    LED_NOMINAL_VOLTAGE: float = 24.0

settings = Settings()
