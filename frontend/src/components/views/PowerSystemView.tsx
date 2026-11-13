import React from 'react';
import {
  Zap,
  Sun,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Clock,
  Cpu,
  Radio,
  Lightbulb,
  Layers,
} from 'lucide-react';
import {
  PowerSystemTelemetry,
  PowerSystemConfig,
  EnvironmentalConditions,
  DecisionEngineState,
} from '../../types/simulation';

interface PowerSystemViewProps {
  powerSystem?: PowerSystemTelemetry;
  environment: EnvironmentalConditions;
  decisionState: DecisionEngineState;
  onUpdateConfig?: (newConfig: Partial<PowerSystemConfig>) => void;
  onSetBatterySoc?: (socPercent: number) => void;
  onResetPower?: () => void;
}

export const PowerSystemView: React.FC<PowerSystemViewProps> = ({
  powerSystem,
  environment,
  decisionState,
  onUpdateConfig,
  onSetBatterySoc,
  onResetPower,
}) => {
  if (!powerSystem) {
    return (
      <div className="p-6 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl text-slate-400 font-mono-data text-xs">
        Loading Power Subsystem Telemetry...
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
    batteryUsableEnergyRemainingWh,
    batterySocPercent,
    batteryVoltage,
    batteryCurrentAmps,
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
  const isLedOn = decisionState.lightingState === 'ACTIVE_SUPPLEMENTAL';

  return (
    <div className="space-y-5 select-none">
      {/* Top Banner Header */}
      <div className="p-5 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-display font-extrabold text-white tracking-wide">
                Buoy Energy Budget & Power Subsystem
              </h1>
              <p className="text-xs font-sans text-slate-400">
                LiFePO4 Marine Battery Bank • MPPT Solar Ingress • 96-Hour Storm Autonomy Reserve
              </p>
            </div>
          </div>
        </div>

        {/* Quick Mode & Autonomy Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-display font-bold ${
              has96HourAutonomy
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}
          >
            {has96HourAutonomy ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{autonomyStatusMessage}</span>
          </div>

          <button
            onClick={() => onResetPower && onResetPower()}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono-data"
            title="Reset Power Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Main 4 Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Solar Ingress */}
        <div className="p-4 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-sans uppercase mb-2">
            <span>Solar Generation</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-display font-extrabold text-amber-300">
            {solarGenerationWatts.toFixed(1)}{' '}
            <span className="text-xs font-mono-data font-normal text-slate-400">Watts</span>
          </div>
          <div className="text-[11px] font-mono-data text-slate-400 mt-2 flex justify-between border-t border-slate-800/60 pt-1.5">
            <span>Irradiance:</span>
            <span className="text-slate-200">{environment.solarIrradiance.toFixed(0)} W/m²</span>
          </div>
        </div>

        {/* Card 2: Battery Remaining Wh */}
        <div className="p-4 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-sans uppercase mb-2">
            <span>Battery Energy</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-display font-extrabold text-cyan-300">
            {batteryEnergyRemainingWh.toFixed(0)}{' '}
            <span className="text-xs font-mono-data font-normal text-slate-400">
              / {batteryTotalCapacityWh.toFixed(0)} Wh
            </span>
          </div>
          <div className="text-[11px] font-mono-data text-slate-400 mt-2 flex justify-between border-t border-slate-800/60 pt-1.5">
            <span>SOC & Voltage:</span>
            <span className="text-slate-200">
              {batterySocPercent.toFixed(1)}% ({batteryVoltage.toFixed(2)}V)
            </span>
          </div>
        </div>

        {/* Card 3: Total Load */}
        <div className="p-4 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-sans uppercase mb-2">
            <span>Active System Load</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-display font-extrabold text-purple-300">
            {totalLoadWatts.toFixed(1)}{' '}
            <span className="text-xs font-mono-data font-normal text-slate-400">Watts</span>
          </div>
          <div className="text-[11px] font-mono-data text-slate-400 mt-2 flex justify-between border-t border-slate-800/60 pt-1.5">
            <span>Base / LED:</span>
            <span className="text-slate-200">
              {baseLoadWatts.toFixed(1)}W / {ledLoadWatts.toFixed(1)}W
            </span>
          </div>
        </div>

        {/* Card 4: Estimated Runtime */}
        <div className="p-4 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-sans uppercase mb-2">
            <span>Backup Autonomy</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div
            className={`text-2xl font-display font-extrabold ${
              isCritical
                ? 'text-rose-400'
                : estimatedRuntimeHours > 100
                ? 'text-emerald-300'
                : 'text-amber-300'
            }`}
          >
            {estimatedRuntimeHours >= 999 ? '∞ (Self-sust.)' : `${estimatedRuntimeHours.toFixed(1)} h`}
          </div>
          <div className="text-[11px] font-mono-data text-slate-400 mt-2 flex justify-between border-t border-slate-800/60 pt-1.5">
            <span>Net Power:</span>
            <span className={isCharging ? 'text-emerald-400' : 'text-amber-400'}>
              {netPowerWatts > 0 ? `+${netPowerWatts.toFixed(1)}W` : `${netPowerWatts.toFixed(1)}W`}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Architecture Diagram & Energy Budget Calculation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT (7 cols): Architecture & Load Breakdown */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-display font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Subsystem Power Flow Architecture
            </h2>
            <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              State: {powerState}
            </span>
          </div>

          {/* Subsystem Flow Nodes */}
          <div className="space-y-3 font-mono-data text-xs">
            {/* Node 1: Solar */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="font-bold text-white">Marine Solar PV Array (100W Nominal)</div>
                  <div className="text-[10px] text-slate-400">
                    Sunlight Irradiance: {environment.solarIrradiance.toFixed(0)} W/m²
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-amber-300">+{solarGenerationWatts.toFixed(1)} W</div>
                <div className="text-[9px] text-slate-500">Gross Ingress</div>
              </div>
            </div>

            {/* Node 2: MPPT */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="font-bold text-white">MPPT Charge Controller & DC-DC Bus</div>
                  <div className="text-[10px] text-slate-400">
                    Conversion Efficiency: {(config.powerConversionEfficiency * 100).toFixed(0)}% •
                    Bus Voltage: {batteryVoltage.toFixed(2)}V
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-cyan-300">
                  {batteryCurrentAmps > 0 ? `+${batteryCurrentAmps.toFixed(2)} A` : `${batteryCurrentAmps.toFixed(2)} A`}
                </div>
                <div className="text-[9px] text-slate-500">
                  {batteryCurrentAmps > 0 ? 'Charge Current' : 'Discharge Current'}
                </div>
              </div>
            </div>

            {/* Node 3: Battery Bank */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-bold text-white">
                    LiFePO4 Battery Bank ({config.batteryNominalVoltage}V {config.batteryCapacityAh}Ah)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Total: {batteryTotalCapacityWh.toFixed(0)} Wh • Usable DoD (
                    {(config.maxUsableDoD * 100).toFixed(0)}%): {batteryUsableCapacityWh.toFixed(0)} Wh
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-300">
                  {batteryEnergyRemainingWh.toFixed(0)} Wh ({batterySocPercent.toFixed(0)}%)
                </div>
                <div className="text-[9px] text-slate-500">Usable: {batteryUsableEnergyRemainingWh.toFixed(0)} Wh</div>
              </div>
            </div>

            {/* Node 4: Loads */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <div className="font-bold text-slate-200">Active Buoy System Loads</div>
                <div className="font-bold text-purple-300">-{totalLoadWatts.toFixed(1)} W Total</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                  <div className="text-slate-400 text-[9px] flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-cyan-400" /> ESP32 MCU
                  </div>
                  <div className="font-bold text-slate-200 mt-0.5">{config.esp32PowerWatts.toFixed(1)} W</div>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                  <div className="text-slate-400 text-[9px] flex items-center gap-1">
                    <Radio className="w-3 h-3 text-cyan-400" /> Multi-Sensors
                  </div>
                  <div className="font-bold text-slate-200 mt-0.5">{config.sensorPowerWatts.toFixed(1)} W</div>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                  <div className="text-slate-400 text-[9px] flex items-center gap-1">
                    <Radio className="w-3 h-3 text-cyan-400" /> LoRa TX/RX
                  </div>
                  <div className="font-bold text-slate-200 mt-0.5">{config.loraPowerWatts.toFixed(1)} W</div>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                  <div className="text-slate-400 text-[9px] flex items-center gap-1">
                    <Lightbulb className={`w-3 h-3 ${isLedOn ? 'text-blue-400 animate-pulse' : 'text-slate-600'}`} />
                    Underwater LED
                  </div>
                  <div className={`font-bold mt-0.5 ${isLedOn ? 'text-blue-300' : 'text-slate-500'}`}>
                    {ledLoadWatts.toFixed(1)} W {isLedOn ? '(78%)' : '(OFF)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT (5 cols): 96-Hour Storm Autonomy Assessment & Live Tuning */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-display font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              96-Hour Storm Autonomy Budget
            </h2>
            <span className="text-[10px] font-mono-data text-slate-400">4-Day Target</span>
          </div>

          {/* Autonomy Calculation Box */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5 font-mono-data text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Target Autonomy:</span>
              <span className="font-bold text-white">{autonomyTargetHours} Hours (4 Days)</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Base Survival Budget (2.5W × 96h):</span>
              <span className="font-bold text-cyan-300">240.0 Wh</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Intermittent Supplemental Lighting:</span>
              <span className="font-bold text-blue-300">150.0 Wh</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-2 font-bold">
              <span>Total Required Wh for 96h:</span>
              <span className="text-white">390.0 Wh</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-2 font-bold">
              <span>Configured Battery Usable Wh:</span>
              <span className={has96HourAutonomy ? 'text-emerald-400' : 'text-rose-400'}>
                {batteryUsableCapacityWh.toFixed(0)} Wh
              </span>
            </div>
          </div>

          {/* Result Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-3 ${
              has96HourAutonomy
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}
          >
            {has96HourAutonomy ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
            )}
            <div>
              <div className="font-display font-bold text-xs uppercase">{autonomyStatusMessage}</div>
              <div className="text-[10px] font-sans text-slate-300 mt-0.5">
                {has96HourAutonomy
                  ? 'Configured energy storage exceeds the 96-hour storm safety threshold with zero solar input.'
                  : `Battery bank capacity is insufficient for 96h survival. Add +${requiredAdditionalWh} Wh capacity.`}
              </div>
            </div>
          </div>

          {/* Quick Simulation Testing */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
            <div className="text-xs font-display font-bold text-slate-300">Test Battery States:</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onSetBatterySoc && onSetBatterySoc(95)}
                className="p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-xs font-mono-data text-emerald-300 text-center transition-all"
              >
                95% (Normal)
              </button>
              <button
                onClick={() => onSetBatterySoc && onSetBatterySoc(45)}
                className="p-2 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-xs font-mono-data text-amber-300 text-center transition-all"
              >
                45% (Backup)
              </button>
              <button
                onClick={() => onSetBatterySoc && onSetBatterySoc(10)}
                className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-xs font-mono-data text-rose-300 text-center transition-all"
              >
                10% (Critical)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
