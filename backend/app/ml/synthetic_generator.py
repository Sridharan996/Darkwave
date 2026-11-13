"""
AQUALUME - Synthetic Dataset Generator
Generates realistic, physically-sound synthetic marine environmental data.

DISCLAIMER:
All generated records are SYNTHETIC developmental data created for
software prototype evaluation and ML pipeline validation.
Not representative of physical in-situ marine sensor measurements.
"""

import math
import numpy as np
import pandas as pd

def generate_synthetic_dataset(n_samples: int = 6000, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates n_samples of synthetic marine environmental parameters with
    physically-coupled relationships and transparent synthetic ground-truth rules.
    Calibrated to match the operational prototype range:
    - Normal Day: Irradiance ~850 W/m² -> Underwater Light ~720 Lux
    - Cloudy / Storm: Irradiance ~132 W/m² -> Underwater Light ~148 Lux (Threshold: 200 Lux)
    """
    np.random.seed(random_seed)

    # 1. Operational photoperiod hours (06:00 to 18:30)
    time_of_day = np.random.uniform(6.0, 18.5, n_samples)
    # 10% dawn/dusk/night records
    night_idx = np.random.choice(n_samples, size=int(n_samples * 0.10), replace=False)
    time_of_day[night_idx] = np.random.choice(
        np.concatenate([np.random.uniform(0.0, 6.0, 400), np.random.uniform(18.5, 24.0, 400)]),
        size=len(night_idx)
    )

    # 2. Weather Condition Regimes:
    # 0: Clear / Nominal Day (35%)
    # 1: Moderate Passing Clouds (25%)
    # 2: Persistent Storm / Overcast (25%)
    # 3: Turbid Coastal Runoff (15%)
    regime = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.35, 0.25, 0.25, 0.15])

    # Cloud Cover (%)
    cloud_cover_percent = np.zeros(n_samples)
    cloud_cover_percent[regime == 0] = np.random.uniform(5.0, 25.0, np.sum(regime == 0))
    cloud_cover_percent[regime == 1] = np.random.uniform(40.0, 70.0, np.sum(regime == 1))
    cloud_cover_percent[regime == 2] = np.random.uniform(75.0, 98.0, np.sum(regime == 2))
    cloud_cover_percent[regime == 3] = np.random.uniform(45.0, 85.0, np.sum(regime == 3))
    cloud_cover_percent = np.clip(cloud_cover_percent + np.random.normal(0, 1.2, n_samples), 0.0, 100.0)

    # Turbidity (NTU)
    turbidity = np.zeros(n_samples)
    turbidity[regime == 0] = np.random.uniform(3.0, 15.0, np.sum(regime == 0))
    turbidity[regime == 1] = np.random.uniform(12.0, 28.0, np.sum(regime == 1))
    turbidity[regime == 2] = np.random.uniform(28.0, 58.0, np.sum(regime == 2))
    turbidity[regime == 3] = np.random.uniform(48.0, 90.0, np.sum(regime == 3))
    turbidity = np.clip(turbidity + np.random.normal(0, 1.0, n_samples), 1.0, 95.0)

    # Solar Irradiance (W/m²)
    zenith = np.maximum(0.0, np.sin(((time_of_day - 6.0) / 13.0) * math.pi))
    cloud_trans = np.maximum(0.08, 1.0 - (cloud_cover_percent / 100.0) * 0.86)
    solar_irradiance = np.clip(1050.0 * zenith * cloud_trans * np.random.normal(1.0, 0.02, n_samples), 0.0, 1150.0)

    # Underwater Light Level (Lux)
    # Physically calibrated sensor response: Photodiode scaling with turbidity attenuation
    k_ext = 0.06 + (turbidity / 100.0) * 0.32
    transmittance = np.exp(-k_ext * 3.5)
    underwater_light_level = np.maximum(
        2.0,
        solar_irradiance * 1.55 * transmittance + np.random.normal(0, 1.5, n_samples)
    )

    # Low-Light Duration (calibrated for 5.0 threshold)
    low_light_duration_minutes = np.zeros(n_samples)
    # For Clear/Passing, low light duration is short (< 5.0)
    low_light_duration_minutes[regime == 0] = np.random.uniform(0.0, 1.5, np.sum(regime == 0))
    low_light_duration_minutes[regime == 1] = np.random.uniform(1.0, 4.5, np.sum(regime == 1))
    # For persistent storms and turbid runoff, duration is >= 5.0 (5.0 to 15.0)
    low_light_duration_minutes[regime == 2] = np.random.uniform(5.0, 12.0, np.sum(regime == 2))
    low_light_duration_minutes[regime == 3] = np.random.uniform(5.0, 15.0, np.sum(regime == 3))
    low_light_duration_minutes = np.clip(low_light_duration_minutes, 0.0, 20.0)

    # -------------------------------------------------------------
    # Transparent Synthetic Ground-Truth Decision Rule for Training:
    # -------------------------------------------------------------
    # 1. Operational Photoperiod (06:30 to 18:30)
    is_photoperiod = (time_of_day >= 6.5) & (time_of_day <= 18.5)
    # 2. Underwater Light < 200 Lux Threshold
    is_low_light = underwater_light_level < 200.0
    # 3. Persistence Duration >= 5.0
    is_persisted = low_light_duration_minutes >= 5.0
    # 4. Environmental Attenuation (Heavy Clouds or High Turbidity or Low Solar Irradiance)
    is_attenuated = (cloud_cover_percent >= 50.0) | (turbidity >= 25.0) | (solar_irradiance < 250.0)

    illumination_required = np.where(
        is_photoperiod & is_low_light & is_persisted & is_attenuated,
        1,
        0
    )

    # Boundary sensor noise (2% edge cases)
    edge_cases = (np.abs(underwater_light_level - 200.0) < 15.0) & (np.abs(low_light_duration_minutes - 5.0) < 0.5)
    flip_mask = edge_cases & (np.random.uniform(0, 1, n_samples) < 0.05)
    illumination_required[flip_mask] = 1 - illumination_required[flip_mask]

    df = pd.DataFrame({
        "cloud_cover_percent": np.round(cloud_cover_percent, 1),
        "solar_irradiance": np.round(solar_irradiance, 1),
        "underwater_light_level": np.round(underwater_light_level, 1),
        "turbidity": np.round(turbidity, 1),
        "time_of_day": np.round(time_of_day, 2),
        "low_light_duration_minutes": np.round(low_light_duration_minutes, 1),
        "illumination_required": illumination_required.astype(int),
    })

    return df

if __name__ == "__main__":
    df = generate_synthetic_dataset(6000)
    print("Class distribution:")
    print(df["illumination_required"].value_counts(normalize=True))
    print(df.head(10))
