import React, { useState } from 'react';
import {
  Zap,
  BatteryCharging,
  BatteryWarning,
  Sun,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  RotateCcw,
  Clock,
  Cpu,
  Lightbulb,
} from 'lucide-react';
import {
  PowerSystemTelemetry,
  PowerSystemConfig,
  PowerSystemStateMode,
} from '../../types/simulation';

interface PowerManagementPanelProps {
  powerSystem?: PowerSystemTelemetry;
  onUpdateConfig?: (newConfig: Partial<PowerSystemConfig>) => void;
  onSetBatterySoc?: (socPercent: number) => void;
  onResetPower?: () => void;
}

export const PowerManagementPanel: React.FC<PowerManagementPanelProps> = ({
  powerSystem,
  onUpdateConfig,
  onSetBatterySoc,
  onResetPower,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);

  if (!powerSystem) {
    return (
      <div className="p-4 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl text-slate-400 text-xs font-mono-data">
        Initializing Power System telemetry...
      </div>
    );
  }

  const {
    config,
    powerState,
    solarGenerationWatts,
    baseLoadWatts,
    ledLoadWatts,
    totalLoadWatts,
    netPowerWatts,
    batteryTotalCapacityWh,
    batteryUsableCapacityWh,
    batteryEnergyRemainingWh,
    batterySocPercent,
    batteryVoltage,
    estimatedRuntimeHours,
    stormDurationHours,
    stormBackupModeActive,
    autonomyTargetHours,
    has96HourAutonomy,
    requiredAdditionalWh,
    autonomyStatusMessage,
  } = powerSystem;

  const isCharging = netPowerWatts > 0;
  const isCritical = powerState === 'CRITICAL';
  const isBackup = powerState === 'BACKUP';

  // SVG Circular SOC Gauge
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((batterySocPercent / 100) * circumference);

  const getPowerStateBadge = (state: PowerSystemStateMode) => {
    switch (state) {
      case 'NORMAL':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[9.5px] font-mono-data font-bold text-emerald-300 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            NORMAL
          </span>
        );
      case 'BACKUP':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-[9.5px] font-mono-data font-bold text-amber-300 flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            BACKUP (DISCHARGING)
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/60 text-[9.5px] font-mono-data font-bold text-rose-300 flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            CRITICAL (ENERGY CONSERVATION)
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl shadow-xl select-none space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-display font-bold uppercase tracking-wider text-slate-200">
            Power & Energy Management
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {getPowerStateBadge(powerState)}
          <button
            onClick={() => setShowConfigModal(!showConfigModal)}
            className="p-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-cyan-300 transition-all text-[10px] flex items-center gap-1"
            title="Configure Power Model"
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden sm:inline">Config</span>
          </button>
        </div>
      </div>

      {/* 96-Hour Storm Autonomy Banner */}
      <div
        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
          has96HourAutonomy
            ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/40 border-emerald-500/40'
            : 'bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-slate-900/40 border-rose-500/40'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`p-2 rounded-lg border flex-shrink-0 ${
              has96HourAutonomy
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
            }`}
          >
            {has96HourAutonomy ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <div
              className={`text-[11px] font-display font-bold tracking-wide uppercase ${
                has96HourAutonomy ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {autonomyStatusMessage}
            </div>
            <div className="text-[10px] font-sans text-slate-400 leading-tight mt-0.5">
              Target: {autonomyTargetHours}h zero-sun storm reserve | Usable:{' '}
              {batteryUsableCapacityWh.toFixed(0)} Wh (DoD {(config.maxUsableDoD * 100).toFixed(0)}%)
            </div>
          </div>
        </div>

        {/* Storm Mode Indicator */}
        <div className="flex flex-col items-end flex-shrink-0 text-right font-mono-data">
          <span
            className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold border ${
              stormBackupModeActive
                ? 'bg-amber-950/80 border-amber-500/40 text-amber-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Storm Mode: {stormBackupModeActive ? 'ACTIVE' : 'STANDBY'}
          </span>
          <span className="text-[9px] text-slate-400 mt-1">
            Storm Elapsed: {stormDurationHours.toFixed(1)}h
          </span>
        </div>
      </div>

      {/* Main Battery State Block */}
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
          isCritical
            ? 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
            : isBackup
            ? 'bg-amber-950/20 border-amber-500/30'
            : 'bg-slate-900/40 border-slate-800'
        }`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${
              isCritical
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                : isCharging
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
            }`}
          >
            {isCritical ? (
              <BatteryWarning className="w-5 h-5" />
            ) : isCharging ? (
              <BatteryCharging className="w-5 h-5" />
            ) : (
              <Zap className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-display font-extrabold text-white">
                {batteryEnergyRemainingWh.toFixed(0)}{' '}
                <span className="text-xs font-sans text-slate-400 font-normal">
                  / {batteryTotalCapacityWh.toFixed(0)} Wh
                </span>
              </span>
              <span className="text-[10px] font-mono-data text-cyan-300">
                ({batteryVoltage.toFixed(2)}V)
              </span>
            </div>
            <div className="text-[10.5px] font-sans text-slate-400 leading-tight mt-0.5">
              {isCritical
                ? 'CRITICAL RESERVE: LED locked OFF. Preserving core MCU & sensors.'
                : isCharging
                ? `Solar charging active (+${netPowerWatts.toFixed(1)} W net)`
                : `Battery discharging (-${Math.abs(netPowerWatts).toFixed(1)} W net)`}
            </div>
          </div>
        </div>

        {/* Circular Gauge */}
        <div className="relative flex flex-col items-center justify-center flex-shrink-0">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 72 72">
            <circle
              cx="36"
              cy="36"
              r={radius}
              className="stroke-slate-800"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="36"
              cy="36"
              r={radius}
              className={
                isCritical
                  ? 'stroke-rose-500'
                  : isCharging
                  ? 'stroke-emerald-400'
                  : batterySocPercent > 30
                  ? 'stroke-amber-400'
                  : 'stroke-rose-400'
              }
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] font-mono-data font-bold text-white leading-none">
              {batterySocPercent.toFixed(0)}%
            </span>
            <span className="text-[7.5px] font-sans text-slate-400 uppercase mt-0.5">
              SOC
            </span>
          </div>
        </div>
      </div>

      {/* Energy Flow & Load Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-data text-xs">
        {/* Solar Generation */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-[9px] uppercase font-sans mb-1">
            <span>Solar Input</span>
            <Sun className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-amber-300">
            {solarGenerationWatts.toFixed(1)}{' '}
            <span className="text-[10px] text-slate-400 font-normal">W</span>
          </div>
          <div className="text-[8.5px] text-slate-500 mt-0.5">PV Marine Panel</div>
        </div>

        {/* Base Load */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-[9px] uppercase font-sans mb-1">
            <span>Base Load</span>
            <Cpu className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-cyan-300">
            {baseLoadWatts.toFixed(1)}{' '}
            <span className="text-[10px] text-slate-400 font-normal">W</span>
          </div>
          <div className="text-[8.5px] text-slate-500 mt-0.5">
            ESP32+Sensors+LoRa
          </div>
        </div>

        {/* LED Load */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-[9px] uppercase font-sans mb-1">
            <span>LED Load</span>
            <Lightbulb
              className={`w-3 h-3 ${
                ledLoadWatts > 0 ? 'text-blue-400 animate-pulse' : 'text-slate-600'
              }`}
            />
          </div>
          <div
            className={`text-sm font-bold ${
              ledLoadWatts > 0 ? 'text-blue-300' : 'text-slate-400'
            }`}
          >
            {ledLoadWatts.toFixed(1)}{' '}
            <span className="text-[10px] text-slate-400 font-normal">W</span>
          </div>
          <div className="text-[8.5px] text-slate-500 mt-0.5">
            {ledLoadWatts > 0 ? 'Dual-PAR Active' : 'LED Standby'}
          </div>
        </div>

        {/* Estimated Runtime */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-[9px] uppercase font-sans mb-1">
            <span>Est. Runtime</span>
            <Clock className="w-3 h-3 text-emerald-400" />
          </div>
          <div
            className={`text-sm font-bold ${
              isCritical
                ? 'text-rose-400'
                : estimatedRuntimeHours > 100
                ? 'text-emerald-300'
                : 'text-amber-300'
            }`}
          >
            {estimatedRuntimeHours >= 999
              ? '∞ (Self-sust.)'
              : `${estimatedRuntimeHours.toFixed(1)} h`}
          </div>
          <div className="text-[8.5px] text-slate-500 mt-0.5">
            {isCharging ? 'Net Positive' : 'At Current Load'}
          </div>
        </div>
      </div>

      {/* Power Architecture Flow Bar */}
      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 font-mono-data text-[9.5px]">
        <div className="text-slate-400 font-sans uppercase text-[8.5px] mb-1.5">
          Power Subsystem Architecture:
        </div>
        <div className="flex items-center justify-between gap-1 text-slate-300 overflow-x-auto pb-1">
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-amber-300 flex-shrink-0">
            Solar Panel ({solarGenerationWatts.toFixed(0)}W)
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300 flex-shrink-0">
            MPPT ({(config.powerConversionEfficiency * 100).toFixed(0)}% η)
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-300 flex-shrink-0">
            {config.batteryNominalVoltage}V {config.batteryCapacityAh}Ah Battery
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-purple-300 flex-shrink-0">
            DC Bus ({totalLoadWatts.toFixed(1)}W)
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-blue-300 flex-shrink-0">
            ESP32 / LoRa / LED Driver
          </span>
        </div>
      </div>

      {/* Interactive Quick Testing Controls */}
      <div className="pt-1 flex items-center justify-between gap-2">
        <div className="text-[9.5px] text-slate-400 font-sans">Quick Power Test:</div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSetBatterySoc && onSetBatterySoc(95)}
            className="px-2 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-[9px] font-mono-data text-emerald-300 transition-all"
            title="Set Battery SOC to 95% (Healthy/Normal)"
          >
            Full (95%)
          </button>
          <button
            onClick={() => onSetBatterySoc && onSetBatterySoc(45)}
            className="px-2 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-[9px] font-mono-data text-amber-300 transition-all"
            title="Set Battery SOC to 45% (Backup Mode)"
          >
            Backup (45%)
          </button>
          <button
            onClick={() => onSetBatterySoc && onSetBatterySoc(10)}
            className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-[9px] font-mono-data text-rose-300 transition-all"
            title="Set Battery SOC to 10% (Test Critical Low Power Lockout)"
          >
            Critical (10%)
          </button>
          <button
            onClick={() => onResetPower && onResetPower()}
            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all"
            title="Reset Power Parameters to Default"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Configuration Drawer / Modal */}
      {showConfigModal && (
        <div className="p-3 rounded-xl bg-slate-950/95 border border-cyan-500/40 space-y-3 font-mono-data text-xs mt-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="font-display font-bold text-white text-[11px] uppercase">
              Power Model Configuration
            </span>
            <button
              onClick={() => setShowConfigModal(false)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
            <div>
              <label className="text-slate-400 block mb-0.5">
                Battery Capacity (Ah):
              </label>
              <input
                type="number"
                min="10"
                max="200"
                step="5"
                value={config.batteryCapacityAh}
                onChange={(e) =>
                  onUpdateConfig &&
                  onUpdateConfig({ batteryCapacityAh: parseFloat(e.target.value) || 50 })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-0.5">
                Nominal Voltage (V):
              </label>
              <input
                type="number"
                min="3.2"
                max="48"
                step="0.1"
                value={config.batteryNominalVoltage}
                onChange={(e) =>
                  onUpdateConfig &&
                  onUpdateConfig({ batteryNominalVoltage: parseFloat(e.target.value) || 12.8 })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-0.5">
                Max Usable DoD (%):
              </label>
              <input
                type="number"
                min="50"
                max="95"
                step="5"
                value={Math.round(config.maxUsableDoD * 100)}
                onChange={(e) =>
                  onUpdateConfig &&
                  onUpdateConfig({ maxUsableDoD: (parseFloat(e.target.value) || 85) / 100 })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-0.5">
                Storm Autonomy Target (h):
              </label>
              <input
                type="number"
                min="24"
                max="240"
                step="12"
                value={config.stormAutonomyTargetHours}
                onChange={(e) =>
                  onUpdateConfig &&
                  onUpdateConfig({
                    stormAutonomyTargetHours: parseFloat(e.target.value) || 96,
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
