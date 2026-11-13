"""
AQUALUME - Synthetic Sensor Simulation Module
Simulates photodiode, pyranometer, optical turbidity meters, and ESP32 hardware telemetry.
"""
import random
from typing import Dict, Any

class SensorSimulator:
    def __init__(self):
        self.noise_enabled = True

    def read_telemetry(self, env_state: Dict[str, Any], is_led_active: bool) -> Dict[str, Any]:
        # Add realistic micro-noise to sensor readings
        noise_factor = random.uniform(-0.5, 0.5) if self.noise_enabled else 0.0
        
        return {
            "is_synthetic": True,
            "sensors": {
                "photodiode_lux": max(0.0, env_state["underwater_light_level"] + noise_factor),
                "pyranometer_irradiance": max(0.0, env_state["solar_irradiance"] + noise_factor * 2),
                "turbidity_ntu": max(0.0, env_state["turbidity"] + noise_factor * 0.1),
                "pt100_temp_c": env_state["water_temperature"],
            },
            "hardware": {
                "battery_voltage": 13.4 if not is_led_active else 12.8,
                "battery_charge_percent": 92.0,
                "solar_panel_watts": round(env_state["solar_irradiance"] * 0.14, 1),
                "esp32_temp_c": 39.2,
                "lora_rssi_dbm": -74,
                "lora_snr_db": 7.8,
                "led_power_watts": 65.0 if is_led_active else 0.0,
                "led_current_amps": 2.85 if is_led_active else 0.0,
                "led_temp_c": 38.5 if is_led_active else 21.0,
            }
        }
