"""
AQUALUME - Decision Engine & LED Controller
Manages low-light threshold detection, persistence duration verification, and LED actuation state.
"""
from typing import Dict, Any

class DecisionEngineController:
    def __init__(
        self,
        threshold_lux: float = 250.0,
        persistence_duration_minutes: float = 3.0
    ):
        self.threshold_lux = threshold_lux
        self.persistence_duration_minutes = persistence_duration_minutes
        self.current_low_light_duration_minutes = 0.0
        self.is_low_light_detected = False
        self.persistence_timer_active = False
        self.lighting_state = "INACTIVE" # "INACTIVE", "PENDING_VERIFICATION", "ACTIVE_SUPPLEMENTAL"
        self.system_mode = "AUTONOMOUS"

    def evaluate(
        self,
        underwater_lux: float,
        ml_prediction: int,
        delta_minutes: float = 0.05
    ) -> Dict[str, Any]:
        if self.system_mode == "MANUAL_OVERRIDE":
            return self.get_state()

        if underwater_lux < self.threshold_lux:
            self.is_low_light_detected = True
            self.persistence_timer_active = True
            self.current_low_light_duration_minutes += delta_minutes

            if (
                self.current_low_light_duration_minutes >= self.persistence_duration_minutes
                and ml_prediction == 1
            ):
                self.lighting_state = "ACTIVE_SUPPLEMENTAL"
                reason = "Low light persisted beyond threshold + ML confirmed. Supplemental illumination active."
            else:
                self.lighting_state = "PENDING_VERIFICATION"
                reason = "Underwater light below threshold. Verifying persistence duration."
        else:
            # Natural light returned - reset persistence timer
            self.is_low_light_detected = False
            self.persistence_timer_active = False
            self.current_low_light_duration_minutes = 0.0
            self.lighting_state = "INACTIVE"
            reason = "Sufficient natural sunlight restored. Supplemental LED standby."

        state = self.get_state()
        state["reason"] = reason
        return state

    def get_state(self) -> Dict[str, Any]:
        progress = min(
            100.0,
            round((self.current_low_light_duration_minutes / self.persistence_duration_minutes) * 100.0, 1)
        )
        return {
            "threshold_lux": self.threshold_lux,
            "persistence_duration_minutes": self.persistence_duration_minutes,
            "current_low_light_duration_minutes": round(self.current_low_light_duration_minutes, 2),
            "is_low_light_detected": self.is_low_light_detected,
            "persistence_timer_active": self.persistence_timer_active,
            "persistence_progress_percent": progress,
            "lighting_state": self.lighting_state,
            "system_mode": self.system_mode,
        }
