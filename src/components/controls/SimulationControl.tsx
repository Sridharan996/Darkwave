import React from 'react';
import { GlassPanel } from '../common/GlassPanel';
import {
  Sliders,
  CloudSun,
  Droplets,
  Clock,
  Timer,
  SunMedium,
  Zap,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { EnvironmentalConditions, DecisionEngineState } from '../../types/simulation';

interface SimulationControlProps {
  environment: EnvironmentalConditions;
  decisionState: DecisionEngineState;
  activeScenario: string;
  onApplyScenario: (scenario: string) => void;
  onUpdateCloudCover: (val: number) => void;
  onUpdateTurbidity: (val: number) => void;
  onUpdateTimeOfDay: (val: number) => void;
  onUpdateThresholdLux: (val: number) => void;
  onUpdatePersistenceDuration: (val: number) => void;
  onToggleManualLed: () => void;
}

export const SimulationControl: React.FC<SimulationControlProps> = ({
  environment,
  decisionState,
  activeScenario,
  onApplyScenario,
  onUpdateCloudCover,
  onUpdateTurbidity,
  onUpdateTimeOfDay,
  onUpdateThresholdLux,
  onUpdatePersistenceDuration,
  onToggleManualLed,
}) => {
  const scenarios = [
    { id: 'nominal', label: 'Nominal Atmosphere', desc: 'Clear sky, moderate light' },
    { id: 'storm', label: 'Dense Storm Front', desc: '92% Cloud cover + turbidity spike' },
    { id: 'turbidity_runoff', label: 'Coastal Runoff', desc: '82 NTU Turbidity light blockage' },
    { id: 'clear_noon', label: 'Equatorial Noon', desc: 'Peak 1050 W/m² Irradiance' },
    { id: 'dusk', label: 'Dusk Transition', desc: 'Declining solar angle (18:00)' },
  ];

  return (
    <GlassPanel
      title="Environmental Simulation & Control Matrix"
      subtitle="Synthesize marine conditions, adjust persistence thresholds, or trigger stress scenarios"
      badge={
        <div className="p-1 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
          <Sliders className="w-3.5 h-3.5" />
        </div>
      }
      headerAction={
        <button
          onClick={() => onApplyScenario('nominal')}
          className="flex items-center gap-1 text-[10px] font-mono-data px-2 py-1 rounded bg-slate-900/80 border border-cyan-900/50 text-cyan-300 hover:bg-cyan-950 transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Defaults
        </button>
      }
    >
      <div className="space-y-4">
        
        {/* Scenario Quick Buttons */}
        <div>
          <label className="text-[10px] font-mono-data text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Simulation Scenarios (Preset Weather Triggers)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => onApplyScenario(sc.id)}
                className={`text-left p-2 rounded-xl border transition-all ${
                  activeScenario === sc.id
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                    : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold truncate">{sc.label}</div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">{sc.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2 border-t border-cyan-900/20">
          
          {/* Cloud Cover Slider */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-cyan-900/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono-data">
              <span className="flex items-center gap-1.5 text-slate-300">
                <CloudSun className="w-3.5 h-3.5 text-cyan-400" /> Cloud Cover
              </span>
              <span className="text-cyan-300 font-bold">{environment.cloudCoverPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={environment.cloudCoverPercent}
              onChange={(e) => onUpdateCloudCover(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono-data">
              <span>0% (Clear)</span>
              <span>100% (Overcast)</span>
            </div>
          </div>

          {/* Water Turbidity Slider */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-cyan-900/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono-data">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Turbidity (NTU)
              </span>
              <span className="text-cyan-300 font-bold">{environment.turbidity} NTU</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={environment.turbidity}
              onChange={(e) => onUpdateTurbidity(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono-data">
              <span>1 NTU (Crystal Clear)</span>
              <span>100 NTU (Heavy Silt)</span>
            </div>
          </div>

          {/* Time of Day Slider */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-cyan-900/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono-data">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Time of Day
              </span>
              <span className="text-cyan-300 font-bold">
                {Math.floor(environment.timeOfDay).toString().padStart(2, '0')}:
                {Math.floor((environment.timeOfDay % 1) * 60).toString().padStart(2, '0')}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="23.9"
              step="0.1"
              value={environment.timeOfDay}
              onChange={(e) => onUpdateTimeOfDay(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono-data">
              <span>00:00 (Midnight)</span>
              <span>12:00 (Noon)</span>
              <span>23:59 (Night)</span>
            </div>
          </div>

          {/* Light Threshold Slider */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-cyan-900/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono-data">
              <span className="flex items-center gap-1.5 text-slate-300">
                <SunMedium className="w-3.5 h-3.5 text-amber-400" /> Trigger Threshold
              </span>
              <span className="text-amber-300 font-bold">{decisionState.underwaterThresholdLux} Lux</span>
            </div>
            <input
              type="range"
              min="50"
              max="800"
              step="10"
              value={decisionState.underwaterThresholdLux}
              onChange={(e) => onUpdateThresholdLux(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono-data">
              <span>50 Lux (Deep darkness)</span>
              <span>800 Lux (Bright shallow)</span>
            </div>
          </div>

          {/* Persistence Duration Slider */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-cyan-900/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono-data">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Timer className="w-3.5 h-3.5 text-cyan-400" /> Persistence Required
              </span>
              <span className="text-cyan-300 font-bold">{decisionState.persistenceDurationMinutes} min</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={decisionState.persistenceDurationMinutes}
              onChange={(e) => onUpdatePersistenceDuration(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono-data">
              <span>0.5 min (Rapid response)</span>
              <span>10.0 min (High dampening)</span>
            </div>
          </div>

          {/* Emergency Manual Override */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-cyan-900/30 flex flex-col justify-between">
            <div className="text-xs font-mono-data text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-rose-400" /> Manual LED Override
              </span>
              <span className="text-[10px] text-slate-400 uppercase">Operator State</span>
            </div>
            <button
              onClick={onToggleManualLed}
              className={`w-full mt-2 py-1.5 px-3 rounded-lg text-xs font-mono-data font-semibold border transition-all ${
                decisionState.lightingState === 'ACTIVE_SUPPLEMENTAL'
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 hover:bg-rose-900'
                  : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900'
              }`}
            >
              {decisionState.lightingState === 'ACTIVE_SUPPLEMENTAL' ? 'FORCE EXTINGUISH LED' : 'FORCE ACTIVATE LED'}
            </button>
          </div>

        </div>

      </div>
    </GlassPanel>
  );
};
