import {
  SimulationStateMode,
  SimulationTargets,
} from '../types/simulation';

export const STATE_TARGETS: Record<SimulationStateMode, SimulationTargets> = {
  SUNLIGHT: {
    cloudCover: 12.0, // 10–15% Low cloud cover
    turbidity: 8.0, // Clear water column
    temperature: 27.6,
    ph: 8.22,
    ledIntensity: 0.0, // LED OFF
    targetMinutes: 0.0, // Low-light timer = 0
  },
  CLOUDY: {
    cloudCover: 78.0, // High cloud cover
    turbidity: 28.0, // Moderate turbidity
    temperature: 26.4,
    ph: 8.08,
    ledIntensity: 78.0, // Supplemental lighting output
    targetMinutes: 36.0, // Accumulates past 30 min persistence threshold
  },
  RAINY: {
    cloudCover: 95.0, // Very high cloud cover
    turbidity: 62.0, // Elevated turbidity
    temperature: 25.1,
    ph: 7.92,
    ledIntensity: 100.0, // Max supplemental output
    targetMinutes: 48.0, // Deep low-light persistence
  },
  NORMAL_DAY: {
    cloudCover: 12.0,
    turbidity: 8.0,
    temperature: 27.6,
    ph: 8.22,
    ledIntensity: 0.0,
    targetMinutes: 0.0,
  },
  CLOUDY_EVENT: {
    cloudCover: 78.0,
    turbidity: 28.0,
    temperature: 26.4,
    ph: 8.08,
    ledIntensity: 78.0,
    targetMinutes: 36.0,
  },
  STORM_CONDITION: {
    cloudCover: 95.0,
    turbidity: 62.0,
    temperature: 25.1,
    ph: 7.92,
    ledIntensity: 100.0,
    targetMinutes: 48.0,
  },
  PERSISTENT_LOW_LIGHT: {
    cloudCover: 78.0,
    turbidity: 28.0,
    temperature: 26.4,
    ph: 8.08,
    ledIntensity: 78.0,
    targetMinutes: 36.0,
  },
  SUNLIGHT_RESTORED: {
    cloudCover: 12.0,
    turbidity: 8.0,
    temperature: 27.6,
    ph: 8.22,
    ledIntensity: 0.0,
    targetMinutes: 0.0,
  },
  MANUAL_CUSTOM: {
    cloudCover: 50.0,
    turbidity: 25.0,
    temperature: 26.8,
    ph: 8.1,
    ledIntensity: 0.0,
    targetMinutes: 0.0,
    isCustomManual: true,
  },
};

/**
 * Calculates surface solar irradiance from diurnal sun angle and cloud cover
 */
export function calculateSolarIrradiance(hour: number, cloudCover: number): number {
  const solarZenithFactor = Math.max(0, Math.sin(((hour - 6) / 14) * Math.PI));
  if (solarZenithFactor <= 0) return 0;

  const cloudTransmission = Math.max(0.08, 1 - (cloudCover / 100) * 0.88);
  const baseIrradiance = 1050 * solarZenithFactor;
  return Math.round(baseIrradiance * cloudTransmission);
}

/**
 * Calculates underwater photopic Lux at depth using Beer-Lambert optical attenuation
 */
export function calculateUnderwaterLux(
  solarIrradiance: number,
  turbidity: number,
  depthMeters = 3.5
): number {
  if (solarIrradiance <= 2) return 2.0;

  const attenuationK = 0.06 + (turbidity / 100) * 0.32;
  const transmissionRatio = Math.exp(-attenuationK * depthMeters);

  const underwaterLux = solarIrradiance * 1.55 * transmissionRatio;
  return Math.max(2.0, Math.round(underwaterLux * 10) / 10);
}

/**
 * Linear interpolation helper for smooth, physically realistic state transitions
 */
export function lerp(current: number, target: number, speed: number): number {
  return current + (target - current) * speed;
}
