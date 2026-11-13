import React from 'react';
import {
  WeatherMode,
  DecisionEngineState,
  EnvironmentalConditions,
  BuoyHardwareTelemetry,
} from '../../types/simulation';
import { Terminal, ShieldCheck, AlertCircle } from 'lucide-react';

interface DebugStatusPanelProps {
  currentWeather: WeatherMode;
  environment: EnvironmentalConditions;
  decisionState: DecisionEngineState;
  telemetry: BuoyHardwareTelemetry;
}

export const DebugStatusPanel: React.FC<DebugStatusPanelProps> = ({
  currentWeather,
  environment,
  decisionState,
  telemetry,
}) => {
  const isLedOn = decisionState.lightingState === 'ACTIVE_SUPPLEMENTAL';
  const currentSec = decisionState.currentLowLightDurationSeconds ?? 0;
  const targetSec = decisionState.persistenceDurationSeconds ?? 5;
  const isLowLight = environment.underwaterLightLevel < decisionState.underwaterThresholdLux;
  const mlProb = (decisionState.mlConfidenceScore * 100).toFixed(1);

  return (
    <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-xl shadow-2xl font-mono-data text-xs select-none">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-900/40">
        <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>REAL-TIME PIPELINE DEBUG HUD</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-[9px] text-cyan-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>Active Monitor</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* Selected Weather */}
        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-[9px] text-slate-400 uppercase">Selected Weather</div>
          <div className="text-xs font-bold text-white uppercase">{currentWeather}</div>
        </div>

        {/* Simulation */}
        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-[9px] text-slate-400 uppercase">Simulation</div>
          <div className="text-xs font-bold text-emerald-400">RUNNING</div>
        </div>

        {/* Underwater Light */}
        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-[9px] text-slate-400 uppercase">Underwater Light</div>
          <div className={`text-xs font-bold ${isLowLight ? 'text-rose-400' : 'text-emerald-400'}`}>
            {environment.underwaterLightLevel} lux
          </div>
        </div>

        {/* Threshold */}
        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-[9px] text-slate-400 uppercase">Threshold</div>
          <div className="text-xs font-bold text-cyan-300">{decisionState.underwaterThresholdLux} lux</div>
        </div>

        {/* Low Light */}
        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-[9px] text-slate-400 uppercase">Low Light</div>
          <div className={`text-xs font-bold ${isLowLight ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isLowLight ? 'TRUE' : 'FALSE'}
          </div>
        </div>

        {/* Persistence */}
        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-[9px] text-slate-400 uppercase">Persistence</div>
          <div className={`text-xs font-bold ${currentSec >= targetSec ? 'text-emerald-400' : 'text-amber-300'}`}>
            {currentSec} / {targetSec} sec
          </div>
        </div>

        {/* ML Prediction */}
        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-[9px] text-slate-400 uppercase">ML Prediction</div>
          <div className={`text-xs font-bold truncate ${decisionState.mlIlluminationRequired === 1 ? 'text-rose-300' : 'text-slate-400'}`}>
            {decisionState.mlIlluminationRequired === 1 ? `REQ (${mlProb}%)` : `STANDBY (${mlProb}%)`}
          </div>
        </div>

        {/* Final Decision / LED */}
        <div className={`p-2 rounded-lg border ${isLedOn ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-slate-900/80 border-slate-800 text-slate-400'}`}>
          <div className="text-[9px] text-slate-400 uppercase">Final LED State</div>
          <div className="text-xs font-extrabold flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isLedOn ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            <span>{isLedOn ? 'ACTIVATE LED (ON)' : 'LED OFF'}</span>
          </div>
        </div>
      </div>

      {/* POWER SUBSYSTEM METRICS ROW */}
      {telemetry.powerSystem && (
        <div className="mt-2.5 pt-2 border-t border-cyan-950/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {/* Power State */}
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Power State</div>
            <div
              className={`text-xs font-bold ${
                telemetry.powerSystem.powerState === 'NORMAL'
                  ? 'text-emerald-400'
                  : telemetry.powerSystem.powerState === 'BACKUP'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {telemetry.powerSystem.powerState}
            </div>
          </div>

          {/* Solar Gen */}
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Solar Ingress</div>
            <div className="text-xs font-bold text-amber-300">
              {telemetry.powerSystem.solarGenerationWatts.toFixed(1)} W
            </div>
          </div>

          {/* Base Load */}
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Base Load</div>
            <div className="text-xs font-bold text-cyan-300">
              {telemetry.powerSystem.baseLoadWatts.toFixed(1)} W
            </div>
          </div>

          {/* LED Load */}
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">LED Load</div>
            <div
              className={`text-xs font-bold ${
                telemetry.powerSystem.ledLoadWatts > 0 ? 'text-blue-300' : 'text-slate-500'
              }`}
            >
              {telemetry.powerSystem.ledLoadWatts.toFixed(1)} W
            </div>
          </div>

          {/* Total Load */}
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Total Load</div>
            <div className="text-xs font-bold text-purple-300">
              {telemetry.powerSystem.totalLoadWatts.toFixed(1)} W
            </div>
          </div>

          {/* Battery Wh */}
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Battery Wh (SOC)</div>
            <div className="text-xs font-bold text-white">
              {telemetry.powerSystem.batteryEnergyRemainingWh.toFixed(0)} Wh (
              {telemetry.powerSystem.batterySocPercent.toFixed(0)}%)
            </div>
          </div>

          {/* Est. Runtime */}
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[9px] text-slate-400 uppercase">Est. Runtime</div>
            <div className="text-xs font-bold text-emerald-300">
              {telemetry.powerSystem.estimatedRuntimeHours >= 999
                ? '∞ (Net +)'
                : `${telemetry.powerSystem.estimatedRuntimeHours.toFixed(1)} h`}
            </div>
          </div>

          {/* 96-Hour Autonomy */}
          <div
            className={`p-2 rounded-lg border ${
              telemetry.powerSystem.has96HourAutonomy
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="text-[9px] uppercase opacity-80">96h Autonomy</div>
            <div className="text-[10.5px] font-bold truncate">
              {telemetry.powerSystem.has96HourAutonomy ? 'AVAILABLE' : 'INSUFFICIENT'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
