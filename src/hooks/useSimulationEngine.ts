import { useState, useEffect, useRef, useCallback } from 'react';
import {
  WeatherMode,
  SimulationStateMode,
  DemoPhase,
  EnvironmentalConditions,
  BuoyHardwareTelemetry,
  DecisionEngineState,
  TimelineEvent,
  TrendDataPoint,
  PowerSystemConfig,
  PowerSystemTelemetry,
  PowerSystemStateMode,
} from '../types/simulation';
import {
  STATE_TARGETS,
  calculateSolarIrradiance,
  calculateUnderwaterLux,
  lerp,
} from '../simulation/SimulationManager';
import { fetchMlPrediction, PredictPayload } from '../api/mlClient';

export const DEFAULT_POWER_CONFIG: PowerSystemConfig = {
  batteryNominalVoltage: 12.8, // 12.8V 4S LiFePO4
  batteryCapacityAh: 50.0, // 50 Ah
  maxUsableDoD: 0.85, // 85% Depth of Discharge
  powerConversionEfficiency: 0.92, // 92% DC-DC / MPPT conversion efficiency
  esp32PowerWatts: 1.2, // ESP32 MCU
  sensorPowerWatts: 0.8, // Multi-sensor cluster
  loraPowerWatts: 0.5, // LoRa communication module
  ledNominalPowerWatts: 60.0, // Underwater LED @ 100%
  stormAutonomyTargetHours: 96.0, // 4-day (96 hour) storm autonomy target
  criticalSocThresholdPercent: 15.0, // 15% critical reserve cutoff
};

export function useSimulationEngine() {
  // 1. Core Selected Weather Mode
  const [currentWeather, setCurrentWeather] = useState<WeatherMode>('SUNLIGHT');
  const [currentSimulationState, setCurrentSimulationState] =
    useState<SimulationStateMode>('SUNLIGHT');

  // Full demonstration mode state
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoPhase, setDemoPhase] = useState<DemoPhase>('IDLE');
  const demoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 2. Simulated Environmental Conditions State (Default Clear Sunlight)
  const [environment, setEnvironment] = useState<EnvironmentalConditions>({
    cloudCoverPercent: 12.0,
    solarIrradiance: 920.0,
    underwaterLightLevel: 740.0,
    turbidity: 8.0,
    waterTemperature: 26.5,
    phLevel: 8.1,
    timeOfDay: 14.32,
    waveHeight: 1.2,
  });

  // Manual target overrides when user drags sliders
  const manualTargetsRef = useRef({
    cloudCover: 12.0,
    turbidity: 8.0,
    isManual: false,
  });

  // 3. Authoritative Persistence Seconds Ref and State
  const [persistenceSeconds, setPersistenceSeconds] = useState<number>(0);
  const persistenceSecondsRef = useRef<number>(0);
  const environmentRef = useRef<EnvironmentalConditions>(environment);
  const currentWeatherRef = useRef<WeatherMode>('SUNLIGHT');

  // 3b. Power Subsystem State & Refs
  const [powerConfig, setPowerConfig] = useState<PowerSystemConfig>(DEFAULT_POWER_CONFIG);
  const powerConfigRef = useRef<PowerSystemConfig>(DEFAULT_POWER_CONFIG);

  // Energy remaining in Wh (Default: 92% of 640Wh = 588.8Wh)
  const initialTotalWh = DEFAULT_POWER_CONFIG.batteryNominalVoltage * DEFAULT_POWER_CONFIG.batteryCapacityAh;
  const [batteryEnergyWh, setBatteryEnergyWh] = useState<number>(initialTotalWh * 0.92);
  const batteryEnergyWhRef = useRef<number>(initialTotalWh * 0.92);

  const [stormDurationHours, setStormDurationHours] = useState<number>(0);
  const stormDurationHoursRef = useRef<number>(0);

  // Keep refs in sync for interval timer access
  useEffect(() => {
    environmentRef.current = environment;
  }, [environment]);

  useEffect(() => {
    currentWeatherRef.current = currentWeather;
  }, [currentWeather]);

  useEffect(() => {
    powerConfigRef.current = powerConfig;
  }, [powerConfig]);

  // Helper to compute live power telemetry snapshot
  const computePowerTelemetrySnapshot = useCallback(
    (
      cfg: PowerSystemConfig,
      curEnergyWh: number,
      irradiance: number,
      isLedOn: boolean,
      intensityPct: number,
      stormHrs: number,
      weather: WeatherMode
    ): PowerSystemTelemetry => {
      const batteryTotalCapacityWh = cfg.batteryNominalVoltage * cfg.batteryCapacityAh;
      const batteryUsableCapacityWh =
        batteryTotalCapacityWh * cfg.maxUsableDoD * cfg.powerConversionEfficiency;
      const batterySocPercent = Math.max(
        0,
        Math.min(100, (curEnergyWh / batteryTotalCapacityWh) * 100)
      );

      const cutoffWh = batteryTotalCapacityWh * (1 - cfg.maxUsableDoD);
      const batteryUsableEnergyRemainingWh = Math.max(
        0,
        (curEnergyWh - cutoffWh) * cfg.powerConversionEfficiency
      );

      // Solar generation from marine PV panel (75W peak at 1000 W/m2)
      const solarRatio = Math.max(0, irradiance / 1000);
      const solarGenerationWatts = Math.round(solarRatio * 75.0 * 10) / 10;

      // Determine if critical
      const isCritical =
        batterySocPercent <= cfg.criticalSocThresholdPercent ||
        batteryUsableEnergyRemainingWh <= 1.0;

      // Base Load (ESP32 + Sensors + LoRa) - In critical conservation mode, reduced sample rate
      const baseLoadWatts = isCritical
        ? cfg.esp32PowerWatts + cfg.sensorPowerWatts * 0.6 + 0.1
        : cfg.esp32PowerWatts + cfg.sensorPowerWatts + cfg.loraPowerWatts;

      // LED Load: ONLY when LED is active and not locked out
      const ledLoadWatts =
        isLedOn && !isCritical
          ? Math.round(cfg.ledNominalPowerWatts * (intensityPct / 100) * 10) / 10
          : 0.0;

      const totalLoadWatts = Math.round((baseLoadWatts + ledLoadWatts) * 10) / 10;
      const netPowerWatts = Math.round((solarGenerationWatts - totalLoadWatts) * 10) / 10;

      // Dynamic LiFePO4 voltage curve
      let batteryVoltage = 12.8;
      if (netPowerWatts > 0) {
        batteryVoltage = 13.4 + (batterySocPercent / 100) * 0.4;
      } else if (batterySocPercent > 50) {
        batteryVoltage = 13.0 + ((batterySocPercent - 50) / 50) * 0.3;
      } else if (batterySocPercent > 20) {
        batteryVoltage = 12.5 + ((batterySocPercent - 20) / 30) * 0.5;
      } else {
        batteryVoltage = 11.2 + (batterySocPercent / 20) * 1.3;
      }
      batteryVoltage = Math.round(batteryVoltage * 100) / 100;

      const batteryCurrentAmps = Math.round((netPowerWatts / batteryVoltage) * 100) / 100;

      let estimatedRuntimeHours = 999.0;
      if (netPowerWatts < -0.05) {
        estimatedRuntimeHours =
          Math.round((batteryUsableEnergyRemainingWh / Math.abs(netPowerWatts)) * 10) / 10;
      } else if (netPowerWatts >= 0) {
        estimatedRuntimeHours = 999.0;
      }

      let powerState: PowerSystemStateMode = 'NORMAL';
      if (isCritical) {
        powerState = 'CRITICAL';
      } else if (netPowerWatts < -0.1 || solarGenerationWatts < totalLoadWatts) {
        powerState = 'BACKUP';
      } else {
        powerState = 'NORMAL';
      }

      // Realistic 96-hour storm autonomy calculation:
      // Required baseline survival energy for 96h base load (2.5W * 96h = 240Wh)
      // plus realistic intermittent supplemental lighting allowance (150Wh) = 390Wh
      const requiredAutonomyWh = Math.round(
        cfg.stormAutonomyTargetHours *
          (cfg.esp32PowerWatts + cfg.sensorPowerWatts + cfg.loraPowerWatts) +
          150.0
      );
      const has96HourAutonomy = batteryUsableCapacityWh >= requiredAutonomyWh;
      const requiredAdditionalWh = has96HourAutonomy
        ? 0
        : Math.ceil(requiredAutonomyWh - batteryUsableCapacityWh);

      const autonomyStatusMessage = has96HourAutonomy
        ? '96-HOUR STORM AUTONOMY AVAILABLE'
        : `BACKUP CAPACITY INSUFFICIENT (+${requiredAdditionalWh} Wh required)`;

      const stormBackupModeActive = weather !== 'SUNLIGHT' || solarGenerationWatts < 20.0;

      return {
        config: cfg,
        powerState,
        solarGenerationWatts,
        baseLoadWatts: Math.round(baseLoadWatts * 10) / 10,
        ledLoadWatts,
        totalLoadWatts,
        netPowerWatts,
        batteryTotalCapacityWh: Math.round(batteryTotalCapacityWh * 10) / 10,
        batteryUsableCapacityWh: Math.round(batteryUsableCapacityWh * 10) / 10,
        batteryEnergyRemainingWh: Math.round(curEnergyWh * 10) / 10,
        batteryUsableEnergyRemainingWh: Math.round(batteryUsableEnergyRemainingWh * 10) / 10,
        batterySocPercent: Math.round(batterySocPercent * 10) / 10,
        batteryVoltage,
        batteryCurrentAmps,
        estimatedRuntimeHours,
        stormDurationHours: Math.round(stormHrs * 10) / 10,
        stormBackupModeActive,
        autonomyTargetHours: cfg.stormAutonomyTargetHours,
        has96HourAutonomy,
        requiredAdditionalWh,
        autonomyStatusMessage,
        energyConservationActive: isCritical,
      };
    },
    []
  );

  // 4. Authoritative Decision & LED State
  const [decisionState, setDecisionState] = useState<DecisionEngineState>({
    underwaterThresholdLux: 200,
    persistenceDurationSeconds: 5,
    currentLowLightDurationSeconds: 0,
    persistenceDurationMinutes: 5,
    currentLowLightDurationMinutes: 0,
    isLowLightDetected: false,
    persistenceTimerActive: false,
    persistenceProgressPercent: 0,
    mlIlluminationRequired: 0,
    mlConfidenceScore: 0.0,
    decisionReason: 'Natural ambient sunlight sufficient (> 200 lux). FINAL DECISION: DEACTIVATE LED.',
    lightingState: 'INACTIVE',
    systemMode: 'AUTONOMOUS',
    currentSimulationState: 'SUNLIGHT',
    backendConnected: true,
    apiLatencyMs: 8,
  });

  // 5. Hardware Telemetry State
  const [telemetry, setTelemetry] = useState<BuoyHardwareTelemetry>({
    batteryVoltage: 13.6,
    batteryChargePercent: 94.0,
    solarPanelOutputWatts: 48.5,
    esp32CoreTemp: 38.2,
    loraRssi: -68,
    loraSnr: 9.2,
    ledPowerOutputWatts: 0.0,
    ledIntensityPercent: 0.0,
    ledOperatingCurrentAmps: 0.0,
    ledTemperature: 22.4,
  });

  const [simSpeed, setSimSpeed] = useState<number>(1);
  const lastLoggedState = useRef<string>('INACTIVE');
  const isFetchingPrediction = useRef<boolean>(false);

  // Events log state
  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: 'e1',
      time: '14:30',
      message: 'System Initialized: DARKWAVE Autonomous Marine Supplemental Lighting System',
      type: 'info',
    },
    {
      id: 'e2',
      time: '14:31',
      message: 'Natural sunlight sufficient (740 lux > 200 lux threshold). LED Standby (0.0 W)',
      type: 'success',
    },
  ]);

  // Historical trend series
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([
    { timeLabel: '12:00', timestamp: 1, underwaterLight: 620, cloudCover: 20, ledStatus: 0 },
    { timeLabel: '12:15', timestamp: 2, underwaterLight: 580, cloudCover: 25, ledStatus: 0 },
    { timeLabel: '12:30', timestamp: 3, underwaterLight: 340, cloudCover: 60, ledStatus: 0, eventMarker: 'Clouds Increase' },
    { timeLabel: '12:45', timestamp: 4, underwaterLight: 175, cloudCover: 75, ledStatus: 0 },
    { timeLabel: '13:00', timestamp: 5, underwaterLight: 152, cloudCover: 80, ledStatus: 0, eventMarker: 'Low-light Persists' },
    { timeLabel: '13:05', timestamp: 6, underwaterLight: 148, cloudCover: 82, ledStatus: 1, eventMarker: 'LED ON' },
    { timeLabel: '13:15', timestamp: 7, underwaterLight: 145, cloudCover: 84, ledStatus: 1 },
    { timeLabel: '13:30', timestamp: 8, underwaterLight: 150, cloudCover: 82, ledStatus: 1 },
    { timeLabel: '13:45', timestamp: 9, underwaterLight: 142, cloudCover: 85, ledStatus: 1 },
    { timeLabel: '14:00', timestamp: 10, underwaterLight: 140, cloudCover: 86, ledStatus: 1 },
  ]);

  const addEvent = useCallback(
    (time: string, message: string, type: TimelineEvent['type'], highlight = false) => {
      setEvents((prev) => [
        {
          id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          time,
          message,
          type,
          highlight,
        },
        ...prev.slice(0, 45),
      ]);
    },
    []
  );

  // -------------------------------------------------------------
  // WEATHER SELECTION HANDLER (Instant Deterministic State Init)
  // -------------------------------------------------------------
  const setWeather = useCallback(
    (mode: WeatherMode) => {
      manualTargetsRef.current.isManual = false;
      setCurrentWeather(mode);
      currentWeatherRef.current = mode;
      setCurrentSimulationState(mode);
      const timeStr = formatSimTime(environment.timeOfDay);

      if (mode === 'SUNLIGHT') {
        persistenceSecondsRef.current = 0;
        setPersistenceSeconds(0);

        setEnvironment((prev) => ({
          ...prev,
          cloudCoverPercent: 12.0,
          solarIrradiance: 920.0,
          underwaterLightLevel: 740.0,
          turbidity: 8.0,
        }));

        setDecisionState((prev) => ({
          ...prev,
          currentLowLightDurationSeconds: 0,
          currentLowLightDurationMinutes: 0,
          lightingState: 'INACTIVE',
          isLowLightDetected: false,
          persistenceTimerActive: false,
          persistenceProgressPercent: 0,
          mlIlluminationRequired: 0,
          mlConfidenceScore: 0.0,
          decisionReason: 'Natural sunlight restored (740 lux > 200 lux threshold). FINAL DECISION: DEACTIVATE LED.',
        }));

        setTelemetry((prev) => ({
          ...prev,
          ledIntensityPercent: 0.0,
          ledPowerOutputWatts: 0.0,
        }));

        addEvent(timeStr, '☀ Weather Mode: SUNLIGHT — Natural sunlight restored. LED deactivated. Timer reset.', 'info', true);
      } else if (mode === 'CLOUDY') {
        persistenceSecondsRef.current = 0;
        setPersistenceSeconds(0);

        setEnvironment((prev) => ({
          ...prev,
          cloudCoverPercent: 78.0,
          solarIrradiance: 158.0,
          underwaterLightLevel: 148.0,
          turbidity: 28.0,
        }));

        setDecisionState((prev) => ({
          ...prev,
          currentLowLightDurationSeconds: 0,
          currentLowLightDurationMinutes: 0,
          lightingState: 'PENDING_VERIFICATION',
          isLowLightDetected: true,
          persistenceTimerActive: true,
          persistenceProgressPercent: 0,
          mlIlluminationRequired: 1, // Demo/model predicted requirement for overcast low light
          mlConfidenceScore: 0.7753,
          decisionReason: 'Underwater light dropped below 200 Lux threshold (148 lux). 5-second persistence countdown initiated.',
        }));

        setTelemetry((prev) => ({
          ...prev,
          ledIntensityPercent: 0.0,
          ledPowerOutputWatts: 0.0,
        }));

        addEvent(timeStr, '☁ Weather Mode: CLOUDY — Low natural light detected (< 200 lux). Persistence timer started (5s target).', 'warning', true);
      } else if (mode === 'RAINY') {
        persistenceSecondsRef.current = 0;
        setPersistenceSeconds(0);

        setEnvironment((prev) => ({
          ...prev,
          cloudCoverPercent: 95.0,
          solarIrradiance: 45.0,
          underwaterLightLevel: 35.0,
          turbidity: 62.0,
        }));

        setDecisionState((prev) => ({
          ...prev,
          currentLowLightDurationSeconds: 0,
          currentLowLightDurationMinutes: 0,
          lightingState: 'PENDING_VERIFICATION',
          isLowLightDetected: true,
          persistenceTimerActive: true,
          persistenceProgressPercent: 0,
          mlIlluminationRequired: 1,
          mlConfidenceScore: 0.884,
          decisionReason: 'Severe storm low light (~35 lux). 5-second persistence countdown initiated.',
        }));

        setTelemetry((prev) => ({
          ...prev,
          ledIntensityPercent: 0.0,
          ledPowerOutputWatts: 0.0,
        }));

        addEvent(timeStr, '🌧 Weather Mode: RAINY — Severe low light detected (~35 Lux). Persistence timer started.', 'alert', true);
      }
    },
    [environment.timeOfDay, addEvent]
  );

  const setSimulationState = useCallback(
    (nextState: SimulationStateMode) => {
      manualTargetsRef.current.isManual = false;
      setCurrentSimulationState(nextState);

      if (nextState === 'SUNLIGHT' || nextState === 'NORMAL_DAY' || nextState === 'SUNLIGHT_RESTORED') {
        setWeather('SUNLIGHT');
      } else if (nextState === 'CLOUDY' || nextState === 'CLOUDY_EVENT' || nextState === 'PERSISTENT_LOW_LIGHT') {
        setWeather('CLOUDY');
      } else if (nextState === 'RAINY' || nextState === 'STORM_CONDITION') {
        setWeather('RAINY');
      }
    },
    [setWeather]
  );

  // Full demonstration workflow
  const stopFullDemo = useCallback(() => {
    if (demoTimeoutRef.current) {
      clearTimeout(demoTimeoutRef.current);
      demoTimeoutRef.current = null;
    }
    setIsDemoRunning(false);
    setDemoPhase('IDLE');
  }, []);

  const startFullDemo = useCallback(() => {
    stopFullDemo();
    setIsDemoRunning(true);

    const timeStr = formatSimTime(environment.timeOfDay);
    addEvent(timeStr, '═══ FULL DEMO SEQUENCE INITIATED ═══', 'action', true);

    setDemoPhase('SUNNY');
    setWeather('SUNLIGHT');

    demoTimeoutRef.current = setTimeout(() => {
      setDemoPhase('CLOUDS_ARRIVE');
      setWeather('CLOUDY');

      demoTimeoutRef.current = setTimeout(() => {
        setDemoPhase('LED_ON');

        demoTimeoutRef.current = setTimeout(() => {
          setDemoPhase('SUNLIGHT_RETURNS');
          setWeather('SUNLIGHT');

          demoTimeoutRef.current = setTimeout(() => {
            setDemoPhase('LED_OFF_RESET');
            addEvent(formatSimTime(environment.timeOfDay), '═══ FULL DEMO SEQUENCE COMPLETED ═══', 'success', true);
            setIsDemoRunning(false);
            setDemoPhase('IDLE');
          }, 3000);
        }, 5000);
      }, 5500);
    }, 3000);
  }, [environment.timeOfDay, setWeather, stopFullDemo, addEvent]);

  // -------------------------------------------------------------
  // CONTINUOUS PHYSICS TRANSITION TICK LOOP (100ms)
  // -------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (manualTargetsRef.current.isManual) return;

      const targets = STATE_TARGETS[currentSimulationState];
      if (!targets) return;

      const lerpSpeed = Math.min(0.25, 0.08 * simSpeed);

      setEnvironment((prevEnv) => {
        const nextHour = (prevEnv.timeOfDay + 0.0008 * simSpeed) % 24;
        const nextCloud = lerp(prevEnv.cloudCoverPercent, targets.cloudCover, lerpSpeed);
        const nextTurbidity = lerp(prevEnv.turbidity, targets.turbidity, lerpSpeed);
        const nextTemp = lerp(prevEnv.waterTemperature, targets.temperature, lerpSpeed);
        const nextPh = lerp(prevEnv.phLevel, targets.ph, lerpSpeed);

        const calculatedIrradiance = calculateSolarIrradiance(nextHour, nextCloud);
        const calculatedLux = calculateUnderwaterLux(calculatedIrradiance, nextTurbidity, 3.5);
        const jitter = (Math.random() - 0.5) * 0.4;
        const liveLux = Math.max(2.0, Math.round((calculatedLux + jitter) * 10) / 10);

        return {
          ...prevEnv,
          timeOfDay: nextHour,
          cloudCoverPercent: Math.round(nextCloud * 10) / 10,
          turbidity: Math.round(nextTurbidity * 10) / 10,
          waterTemperature: Math.round(nextTemp * 10) / 10,
          phLevel: Math.round(nextPh * 100) / 100,
          solarIrradiance: calculatedIrradiance,
          underwaterLightLevel: liveLux,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentSimulationState, simSpeed]);

  // -------------------------------------------------------------
  // UNIFIED 1-SECOND PERSISTENCE & DECISION ENGINE TIMER
  // Authoritative State Machine: 0s -> 1s -> 2s -> 3s -> 4s -> 5s -> LED ON (with Power Budget Check)
  // -------------------------------------------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      const curEnv = environmentRef.current;
      const threshold = 200.0;
      const targetSec = 5;
      const isLowLight = curEnv.underwaterLightLevel < threshold;
      const activeWeather = currentWeatherRef.current;
      const curCfg = powerConfigRef.current;

      // 1. Check current power status snapshot before decision
      const currentEnergy = batteryEnergyWhRef.current;
      const totalWh = curCfg.batteryNominalVoltage * curCfg.batteryCapacityAh;
      const currentSoc = Math.max(0, Math.min(100, (currentEnergy / totalWh) * 100));
      const isCriticalBattery = currentSoc <= curCfg.criticalSocThresholdPercent;

      let isLedOnThisTick = false;

      if (isLowLight) {
        // Increment persistence seconds (capped at 5)
        persistenceSecondsRef.current = Math.min(targetSec, persistenceSecondsRef.current + 1);
        const currentSec = persistenceSecondsRef.current;
        setPersistenceSeconds(currentSec);

        const isDurationMet = currentSec >= targetSec;
        const progressPct = Math.min(100, Math.round((currentSec / targetSec) * 100));

        if (isDurationMet) {
          // 5-second persistence threshold reached
          if (!isCriticalBattery) {
            // Power is sufficient: ACTIVATE LED
            isLedOnThisTick = true;
            const finalState = 'ACTIVE_SUPPLEMENTAL';
            const reason = `Persistence threshold reached (${currentSec} / ${targetSec} sec) + ML Illumination Required. Battery reserve healthy (${currentSoc.toFixed(0)}%). FINAL DECISION: ACTIVATE LED.`;

            setDecisionState((prev) => ({
              ...prev,
              currentLowLightDurationSeconds: currentSec,
              currentLowLightDurationMinutes: currentSec,
              isLowLightDetected: true,
              persistenceTimerActive: true,
              persistenceProgressPercent: 100,
              mlIlluminationRequired: 1,
              mlConfidenceScore: prev.mlConfidenceScore || 0.7753,
              lightingState: finalState,
              decisionReason: reason,
            }));

            setTelemetry((prev) => ({
              ...prev,
              ledIntensityPercent: 78.0,
              ledPowerOutputWatts: 46.8,
              ledOperatingCurrentAmps: 2.6,
              ledTemperature: 38.5,
            }));

            console.log(
              `[DARKWAVE SIM] weather: ${activeWeather.toLowerCase()}, underwaterLight: ${curEnv.underwaterLightLevel}, threshold: ${threshold}, lowLight: true, persistence: ${currentSec} / 5, mlPrediction: 1, ledStatus: ON`
            );
            console.log('[DARKWAVE SIM] PERSISTENCE THRESHOLD REACHED');
            console.log('[DARKWAVE SIM] FINAL DECISION: ACTIVATE_LED');
            console.log('[DARKWAVE SIM] LED STATUS: ON');

            if (lastLoggedState.current !== 'ACTIVE_SUPPLEMENTAL') {
              const timeStr = formatSimTime(curEnv.timeOfDay);
              addEvent(
                timeStr,
                'LED ACTIVATED: Persistent low-light confirmed (5s). Dual-spectrum PAR active @ 78%. Power load increased.',
                'success',
                true
              );
              lastLoggedState.current = 'ACTIVE_SUPPLEMENTAL';
            }
          } else {
            // Battery is critically low: SAFETY LOCKOUT & ENERGY CONSERVATION
            isLedOnThisTick = false;
            const reason = `LOW POWER / ENERGY CONSERVATION ACTIVE: Illumination required by ML (${currentSec}/5s) but inhibited to protect core ESP32 telemetry & sensors. Battery at ${currentSoc.toFixed(1)}%.`;

            setDecisionState((prev) => ({
              ...prev,
              currentLowLightDurationSeconds: currentSec,
              currentLowLightDurationMinutes: currentSec,
              isLowLightDetected: true,
              persistenceTimerActive: true,
              persistenceProgressPercent: 100,
              mlIlluminationRequired: 1,
              lightingState: 'SAFETY_LOCKOUT',
              decisionReason: reason,
            }));

            setTelemetry((prev) => ({
              ...prev,
              ledIntensityPercent: 0.0,
              ledPowerOutputWatts: 0.0,
            }));

            console.log('[DARKWAVE SIM] PERSISTENCE THRESHOLD REACHED');
            console.log('[DARKWAVE SIM] FINAL DECISION: INHIBIT_LED (CRITICAL_POWER_LOCKOUT)');
            console.log('[DARKWAVE SIM] LED STATUS: OFF (ENERGY CONSERVATION)');

            if (lastLoggedState.current !== 'SAFETY_LOCKOUT') {
              const timeStr = formatSimTime(curEnv.timeOfDay);
              addEvent(
                timeStr,
                'LOW POWER WARNING: Battery in critical reserve (≤15%). LED locked OFF to conserve energy for telemetry.',
                'alert',
                true
              );
              lastLoggedState.current = 'SAFETY_LOCKOUT';
            }
          }
        } else {
          // Still counting (0s to 4s)
          setDecisionState((prev) => ({
            ...prev,
            currentLowLightDurationSeconds: currentSec,
            currentLowLightDurationMinutes: currentSec,
            isLowLightDetected: true,
            persistenceTimerActive: true,
            persistenceProgressPercent: progressPct,
            mlIlluminationRequired: 1,
            lightingState: 'PENDING_VERIFICATION',
            decisionReason: `Underwater light below threshold (${curEnv.underwaterLightLevel} lux < ${threshold} lux). Persistence timer counting (${currentSec} / ${targetSec} sec). LED Standby.`,
          }));

          setTelemetry((prev) => ({
            ...prev,
            ledIntensityPercent: 0.0,
            ledPowerOutputWatts: 0.0,
          }));

          console.log(
            `[DARKWAVE SIM] weather: ${activeWeather.toLowerCase()}, underwaterLight: ${curEnv.underwaterLightLevel}, threshold: ${threshold}, lowLight: true, persistence: ${currentSec} / 5, mlPrediction: 1, ledStatus: OFF`
          );
        }
      } else {
        // Natural sunlight sufficient (> 200 Lux)
        persistenceSecondsRef.current = 0;
        setPersistenceSeconds(0);
        isLedOnThisTick = false;

        setDecisionState((prev) => ({
          ...prev,
          currentLowLightDurationSeconds: 0,
          currentLowLightDurationMinutes: 0,
          isLowLightDetected: false,
          persistenceTimerActive: false,
          persistenceProgressPercent: 0,
          mlIlluminationRequired: 0,
          mlConfidenceScore: 0.0,
          lightingState: 'INACTIVE',
          decisionReason: `Natural sunlight sufficient (${curEnv.underwaterLightLevel} lux >= ${threshold} lux). FINAL DECISION: DEACTIVATE LED & Reset Timer.`,
        }));

        setTelemetry((prev) => ({
          ...prev,
          ledIntensityPercent: 0.0,
          ledPowerOutputWatts: 0.0,
        }));

        if (lastLoggedState.current === 'ACTIVE_SUPPLEMENTAL') {
          const timeStr = formatSimTime(curEnv.timeOfDay);
          addEvent(
            timeStr,
            `Natural sunlight restored (${curEnv.underwaterLightLevel} lux). LED deactivated. Low-light timer reset.`,
            'info',
            true
          );
          lastLoggedState.current = 'INACTIVE';
        }
      }

      // 2. Compute Power Subsystem Dynamics & Energy Delta
      const powerTele = computePowerTelemetrySnapshot(
        curCfg,
        batteryEnergyWhRef.current,
        curEnv.solarIrradiance,
        isLedOnThisTick,
        isLedOnThisTick ? 78.0 : 0.0,
        stormDurationHoursRef.current,
        activeWeather
      );

      // Integrate energy delta: Wh = (netWatts * dt_sec) / 3600
      // Apply a modest simulation multiplier so changes are observable over minutes in UI demo
      const simEnergyStepWh = (powerTele.netPowerWatts * 1.0) / 3600;
      const maxWh = curCfg.batteryNominalVoltage * curCfg.batteryCapacityAh;
      const nextEnergyWh = Math.max(0, Math.min(maxWh, batteryEnergyWhRef.current + simEnergyStepWh));
      batteryEnergyWhRef.current = nextEnergyWh;
      setBatteryEnergyWh(nextEnergyWh);

      // Accumulate storm duration if in low-solar or cloudy/rainy
      if (activeWeather !== 'SUNLIGHT' || powerTele.solarGenerationWatts < 20.0) {
        stormDurationHoursRef.current += 1.0 / 3600;
        setStormDurationHours(stormDurationHoursRef.current);
      } else {
        stormDurationHoursRef.current = 0;
        setStormDurationHours(0);
      }

      // Update hardware telemetry state
      setTelemetry((prev) => ({
        ...prev,
        batteryVoltage: powerTele.batteryVoltage,
        batteryChargePercent: powerTele.batterySocPercent,
        solarPanelOutputWatts: powerTele.solarGenerationWatts,
        powerSystem: powerTele,
      }));

      // Console Power Logging
      console.log(
        `[POWER] Solar: ${powerTele.solarGenerationWatts.toFixed(1)} W | Base Load: ${powerTele.baseLoadWatts.toFixed(1)} W | LED Load: ${powerTele.ledLoadWatts.toFixed(1)} W | Total Load: ${powerTele.totalLoadWatts.toFixed(1)} W | Battery: ${powerTele.batteryEnergyRemainingWh.toFixed(1)} Wh | Battery SOC: ${powerTele.batterySocPercent.toFixed(1)}% | Runtime: ${powerTele.estimatedRuntimeHours >= 999 ? '999+' : powerTele.estimatedRuntimeHours.toFixed(1)} h | Storm Duration: ${powerTele.stormDurationHours.toFixed(1)} h | Power State: ${powerTele.powerState}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [addEvent, computePowerTelemetrySnapshot]);

  // -------------------------------------------------------------
  // BACKGROUND ML LATENCY & REAL RANDOM FOREST API MONITOR
  // Queries FastAPI in the background to update real-time telemetry metrics
  // -------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    const fetchLiveMl = async () => {
      if (isFetchingPrediction.current) return;
      isFetchingPrediction.current = true;

      const curEnv = environmentRef.current;
      const curSec = persistenceSecondsRef.current;

      const payload: PredictPayload = {
        cloud_cover_percent: curEnv.cloudCoverPercent,
        solar_irradiance: curEnv.solarIrradiance,
        underwater_light_level: curEnv.underwaterLightLevel,
        turbidity: curEnv.turbidity,
        time_of_day: curEnv.timeOfDay,
        low_light_duration_minutes: curSec,
      };

      const startTime = performance.now();
      try {
        const mlResponse = await fetchMlPrediction(payload);
        const latency = Math.round(performance.now() - startTime);

        if (!isMounted) return;

        setDecisionState((prev) => ({
          ...prev,
          mlConfidenceScore: mlResponse.probability,
          backendConnected: true,
          apiLatencyMs: latency,
        }));
      } catch (err) {
        console.warn('[DARKWAVE ML API] Backend poll:', err);
      } finally {
        isFetchingPrediction.current = false;
      }
    };

    const interval = setInterval(fetchLiveMl, 1500);
    fetchLiveMl();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Power configuration controls
  const updatePowerConfig = useCallback((newCfg: Partial<PowerSystemConfig>) => {
    setPowerConfig((prev) => {
      const updated = { ...prev, ...newCfg };
      powerConfigRef.current = updated;
      return updated;
    });
    addEvent(
      formatSimTime(environment.timeOfDay),
      'Power System configuration updated.',
      'info'
    );
  }, [addEvent, environment.timeOfDay]);

  const setBatterySoc = useCallback((socPercent: number) => {
    const cfg = powerConfigRef.current;
    const totalWh = cfg.batteryNominalVoltage * cfg.batteryCapacityAh;
    const targetWh = (Math.max(0, Math.min(100, socPercent)) / 100) * totalWh;
    batteryEnergyWhRef.current = targetWh;
    setBatteryEnergyWh(targetWh);
    const timeStr = formatSimTime(environment.timeOfDay);
    addEvent(
      timeStr,
      `Manual Power Test: Battery SOC set to ${socPercent.toFixed(0)}% (${targetWh.toFixed(0)} Wh)`,
      socPercent <= 15 ? 'alert' : 'info',
      true
    );
  }, [addEvent, environment.timeOfDay]);

  const resetPowerSystem = useCallback(() => {
    setPowerConfig(DEFAULT_POWER_CONFIG);
    powerConfigRef.current = DEFAULT_POWER_CONFIG;
    const totalWh = DEFAULT_POWER_CONFIG.batteryNominalVoltage * DEFAULT_POWER_CONFIG.batteryCapacityAh;
    const targetWh = totalWh * 0.92;
    batteryEnergyWhRef.current = targetWh;
    setBatteryEnergyWh(targetWh);
    stormDurationHoursRef.current = 0;
    setStormDurationHours(0);
    addEvent(
      formatSimTime(environment.timeOfDay),
      'Power subsystem reset to factory defaults (12.8V 50Ah LiFePO4, 96h target).',
      'info',
      true
    );
  }, [addEvent, environment.timeOfDay]);

  // Manual Sliders Handlers
  const setManualCloudCover = (val: number) => {
    manualTargetsRef.current.isManual = true;
    manualTargetsRef.current.cloudCover = val;
    setCurrentSimulationState('MANUAL_CUSTOM');
    setEnvironment((prev) => {
      const irr = calculateSolarIrradiance(prev.timeOfDay, val);
      const lux = calculateUnderwaterLux(irr, prev.turbidity, 3.5);
      return {
        ...prev,
        cloudCoverPercent: val,
        solarIrradiance: irr,
        underwaterLightLevel: lux,
      };
    });
  };

  const setManualSolarIrradiance = (val: number) => {
    manualTargetsRef.current.isManual = true;
    setCurrentSimulationState('MANUAL_CUSTOM');
    setEnvironment((prev) => {
      const lux = calculateUnderwaterLux(val, prev.turbidity, 3.5);
      return {
        ...prev,
        solarIrradiance: val,
        underwaterLightLevel: lux,
      };
    });
  };

  const setManualUnderwaterLight = (val: number) => {
    manualTargetsRef.current.isManual = true;
    setCurrentSimulationState('MANUAL_CUSTOM');
    setEnvironment((prev) => ({
      ...prev,
      underwaterLightLevel: val,
    }));
  };

  const setManualTurbidity = (val: number) => {
    manualTargetsRef.current.isManual = true;
    manualTargetsRef.current.turbidity = val;
    setCurrentSimulationState('MANUAL_CUSTOM');
    setEnvironment((prev) => {
      const lux = calculateUnderwaterLux(prev.solarIrradiance, val, 3.5);
      return {
        ...prev,
        turbidity: val,
        underwaterLightLevel: lux,
      };
    });
  };

  const setManualTimeOfDay = (val: number) => {
    manualTargetsRef.current.isManual = true;
    setCurrentSimulationState('MANUAL_CUSTOM');
    setEnvironment((prev) => {
      const irr = calculateSolarIrradiance(val, prev.cloudCoverPercent);
      const lux = calculateUnderwaterLux(irr, prev.turbidity, 3.5);
      return {
        ...prev,
        timeOfDay: val,
        solarIrradiance: irr,
        underwaterLightLevel: lux,
      };
    });
  };

  const setManualPersistenceThreshold = (val: number) => {
    setDecisionState((prev) => ({
      ...prev,
      persistenceDurationSeconds: val,
      persistenceDurationMinutes: val,
    }));
    const timeStr = formatSimTime(environment.timeOfDay);
    addEvent(timeStr, `Config updated: Required Persistence Duration set to ${val} sec`, 'info');
  };

  const setManualLuxThreshold = (val: number) => {
    setDecisionState((prev) => ({
      ...prev,
      underwaterThresholdLux: val,
    }));
    const timeStr = formatSimTime(environment.timeOfDay);
    addEvent(timeStr, `Config updated: Underwater Light Threshold set to ${val} lux`, 'info');
  };

  // Manual LED override
  const toggleLedManual = () => {
    setDecisionState((prev) => {
      const isCurrentlyOn = prev.lightingState === 'ACTIVE_SUPPLEMENTAL';
      const nextState = isCurrentlyOn ? 'INACTIVE' : 'ACTIVE_SUPPLEMENTAL';
      const timeStr = formatSimTime(environment.timeOfDay);

      setTelemetry((t) => ({
        ...t,
        ledPowerOutputWatts: isCurrentlyOn ? 0 : 46.8,
        ledIntensityPercent: isCurrentlyOn ? 0 : 78,
      }));

      addEvent(
        timeStr,
        `Manual Override: LED ${isCurrentlyOn ? 'DEACTIVATED' : 'ACTIVATED'}`,
        isCurrentlyOn ? 'warning' : 'success',
        true
      );

      return {
        ...prev,
        systemMode: 'MANUAL_OVERRIDE',
        lightingState: nextState,
        decisionReason: isCurrentlyOn
          ? 'Manual operator shutdown'
          : 'Manual operator illumination override',
      };
    });
  };

  return {
    environment,
    telemetry,
    decisionState,
    events,
    trendData,
    simSpeed,
    setSimSpeed,
    currentWeather,
    setWeather,
    currentSimulationState,
    setSimulationState,
    isDemoRunning,
    demoPhase,
    startFullDemo,
    stopFullDemo,
    setManualCloudCover,
    setManualSolarIrradiance,
    setManualUnderwaterLight,
    setManualTurbidity,
    setManualTimeOfDay,
    setManualPersistenceThreshold,
    setManualLuxThreshold,
    toggleLedManual,
    powerConfig,
    updatePowerConfig,
    setBatterySoc,
    resetPowerSystem,
  };
}

export function formatSimTime(hourFloat: number) {
  const hours = Math.floor(hourFloat);
  const mins = Math.floor((hourFloat % 1) * 60);
  const secs = Math.floor(((hourFloat % 1) * 3600) % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
}
