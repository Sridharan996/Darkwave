"""
AQUALUME - Environment Simulation Module
Generates synthetic atmospheric, solar, and marine water column parameters.
Clearly labeled as SYNTHETIC / SIMULATED.
"""
import math
from typing import Dict, Any

class MarineEnvironmentSimulator:
    def __init__(self):
        self.cloud_cover_percent = 35.0
        self.time_of_day = 13.5  # 13:30 (1:30 PM)
        self.turbidity = 12.5     # NTU
        self.water_temperature = 19.8 # Celsius
        self.wave_height = 0.8    # meters

    def compute_solar_irradiance(self, hour: float, cloud_cover: float) -> float:
        """Calculate surface solar irradiance using diurnal zenith curve and cloud attenuation."""
        solar_factor = max(0.0, math.sin(((hour - 6.0) / 12.0) * math.pi))
        base_irradiance = solar_factor * 1050.0  # Peak 1050 W/m² at solar noon
        effective_irradiance = base_irradiance * (1.0 - (cloud_cover / 100.0) * 0.82)
        return round(max(0.0, effective_irradiance), 1)

    def compute_underwater_lux(
        self,
        surface_irradiance: float,
        turbidity: float,
        depth_meters: float = 3.5
    ) -> float:
        """
        Calculates underwater illuminance (Lux) using Beer-Lambert optical extinction.
        Extinction coefficient increases with water turbidity (NTU).
        """
        if surface_irradiance <= 0.5:
            return 2.0 # Minimum starlight/ambient ocean background
        
        # Attenuation coefficient: base clear seawater (0.18) + turbidity contribution
        attenuation_k = 0.18 + (turbidity / 100.0) * 0.55
        transmission_ratio = math.exp(-attenuation_k * depth_meters)
        
        # 1 W/m² of solar spectrum ≈ 115 Lux
        lux = surface_irradiance * 115.0 * transmission_ratio
        return round(max(2.0, lux), 1)

    def get_state(self) -> Dict[str, Any]:
        irradiance = self.compute_solar_irradiance(self.time_of_day, self.cloud_cover_percent)
        underwater_lux = self.compute_underwater_lux(irradiance, self.turbidity)
        return {
            "is_synthetic": True,
            "cloud_cover_percent": self.cloud_cover_percent,
            "solar_irradiance": irradiance,
            "underwater_light_level": underwater_lux,
            "turbidity": self.turbidity,
            "time_of_day": round(self.time_of_day, 2),
            "water_temperature": self.water_temperature,
            "wave_height": self.wave_height,
        }
