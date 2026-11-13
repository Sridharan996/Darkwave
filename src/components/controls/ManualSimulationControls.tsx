import React from 'react';
import { GlassPanel } from '../common/GlassPanel';
import {
  Sliders,
  Play,
  Square,
  Sun,
  CloudSun,
  CloudRain,
  RotateCcw,
  Clock,
  Droplets,
  Eye,
  Timer,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  EnvironmentalConditions,
  DecisionEngineState,
  SimulationStateMode,
  DemoPhase,
} from '../../types/simulation';

interface ManualSimulationControlsProps {
  environment: EnvironmentalConditions;
  decisionState: DecisionEngineState;
  currentSimulationState: SimulationStateMode;
  onSetSimulationState: (state: SimulationStateMode) => void;
  isDemoRunning: boolean;
  demoPhase: DemoPhase;
  onStartDemo: () => void;
  onStopDemo: () => void;
  onUpdateCloudCover: (val: number) => void;
  onUpdateSolarIrradiance: (val: number) => void;
  onUpdateUnderwaterLight: (val: number) => void;
  onUpdateTurbidity: (val: number) => void;
  onUpdateTimeOfDay: (val: number) => void;
  onUpdatePersistenceThreshold: (val: number) => void;
  onUpdateLuxThreshold: (val: number) => void;
}

export const ManualSimulationControls: React.FC<ManualSimulationControlsProps> = ({
  environment,
  decisionState,
  currentSimulationState,
  onSetSimulationState,
  isDemoRunning,
  demoPhase,
  onStartDemo,
  onStopDemo,
  onUpdateCloudCover,
  onUpdateSolarIrradiance,
  onUpdateUnderwaterLight,
  onUpdateTurbidity,
  onUpdateTimeOfDay,
  onUpdatePersistenceThreshold,
  onUpdateLuxThreshold,
}) => {
  const scenarios: { id: SimulationStateMode; label: string; desc: string; icon: any }[] = [
    {
      id: 'NORMAL_DAY',
      label: 'NORMAL DAY',
      desc: '15% Clouds • 880 W/m² • 720 lx • LED Off',
      icon: Sun,
    },
    {
      id: 'CLOUDY_EVENT',
      label: 'CLOUDY EVENT',
      desc: 'Clouds rise • Lux drops • Timer active • LED standby',
      icon: CloudSun,
    },
    {
      id: 'STORM_CONDITION',
      label: 'STORM CONDITION',
      desc: '94% Clouds • 65 NTU • Max 100% LED output',
      icon: CloudRain,
    },
    {
      id: 'SUNLIGHT_RESTORED',
      label: 'SUNLIGHT RESTORED',
      desc: 'Clouds disperse • 650 lx • LED Off • Timer reset',
      icon: RotateCcw,
    },
  ];

  const getPhaseLabel = (phase: DemoPhase) => {
    switch (phase) {
      case 'SUNNY':
        return '1. SUNNY (Ambient Light Nominal)';
      case 'CLOUDS_ARRIVE':
        return '2. CLOUDS ARRIVE (Solar Attenuation)';
      case 'LOW_LIGHT_DETECTED':
        return '3. LOW LIGHT DETECTED (< 200 Lux)';
      case 'PERSISTENCE_TIMER':
        return '4. PERSISTENCE TIMER (Verifying 30m Duration)';
      case 'ML_PREDICTION':
        return '5. ML PREDICTION (illumination_required = 1)';
      case 'LED_ON':
        return '6. FINAL DECISION: LED ACTIVATED (78%)';
      case 'SUNLIGHT_RETURNS':
        return '7. SUNLIGHT RETURNS (> 200 Lux)';
      case 'LED_OFF_RESET':
        return '8. LED DEACTIVATED & TIMER RESET';
      default:
        return 'IDLE';
    }
  };

  return (
    <GlassPanel
      title="INTERACTIVE SIMULATION & DEMONSTRATION CONTROLS"
      subtitle="Manually manipulate environmental parameters or trigger autonomous demo sequences"
      badge={
        <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
          <Sliders className="w-4 h-4" />
        </div>
      }
      headerAction={
        <div className="flex items-center gap-2">
          {/* RUN FULL DEMO BUTTON */}
          <button
            onClick={isDemoRunning ? onStopDemo : onStartDemo}
            className={`px-4 py-1.5 rounded-xl font-display text-xs font-bold tracking-wider uppercase border transition-all flex items-center gap-2 shadow-lg ${
              isDemoRunning
                ? 'bg-rose-950/90 border-rose-500/60 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
                : 'bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 border-cyan-400 text-slate-900 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:brightness-110 active:scale-95'
            }`}
          >
            {isDemoRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isDemoRunning ? 'ABORT DEMO' : 'RUN FULL DEMO'}</span>
          </button>
        </div>
      }
      className="w-full"
    >
      <div className="space-y-4">
        
        {/* Full Demo Active Phase Banner */}
        {isDemoRunning && (
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.25)] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-mono-data">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold text-cyan-200 uppercase tracking-wide">
                DEMO SEQUENCE ACTIVE:
              </span>
              <span className="text-sm font-black text-amber-300 tracking-wider">
                {getPhaseLabel(demoPhase)}
              </span>
            </div>

            <div className="text-[10px] font-mono-data text-cyan-300/80">
              Auto-Progressing (Sunny → Clouds → Low-Light → Timer → ML → LED ON → Sun → LED OFF)
            </div>
          </div>
        )}

        {/* 1. SCENARIO PRESET BUTTONS ROW */}
        <div>
          <label className="text-[10px] font-mono-data text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Simulation Scenarios (One-Click Autonomous Triggers)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {scenarios.map((sc) => {
              const Icon = sc.icon;
              const isSelected = currentSimulationState === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSetSimulationState(sc.id)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-cyan-950/90 border-cyan-400 text-cyan-100 shadow-[0_0_18px_rgba(0,240,255,0.25)]'
                      : 'bg-slate-950/40 border-cyan-950/50 text-slate-300 hover:bg-slate-900/60 hover:border-cyan-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-display font-bold tracking-wide truncate">
                      {sc.label}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono-data text-slate-400 mt-1 pl-6 leading-tight">
                    {sc.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. MANUAL REAL-TIME SLIDERS MATRIX */}
        <div className="pt-3 border-t border-cyan-900/30">
          <label className="text-[10px] font-mono-data text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5 font-bold">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Manual Environmental Manipulation Sliders
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            
            {/* Cloud Cover Slider */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-cyan-950/50 space-y-1.5">
              <div className="flex justify-between text-xs font-mono-data">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <CloudSun className="w-3.5 h-3.5 text-cyan-400" /> Cloud Cover
                </span>
                <span className="font-bold text-cyan-300">{environment.cloudCoverPercent}%</span>
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
                <span>0% (Clear Sky)</span>
                <span>100% (Dense Overcast)</span>
              </div>
            </div>

            {/* Solar Irradiance Slider */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-cyan-950/50 space-y-1.5">
              <div className="flex justify-between text-xs font-mono-data">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Solar Irradiance
                </span>
                <span className="font-bold text-amber-300">{environment.solarIrradiance} W/m²</span>
              </div>
              <input
                type="range"
                min="0"
                max="1200"
                step="10"
                value={environment.solarIrradiance}
                onChange={(e) => onUpdateSolarIrradiance(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono-data">
                <span>0 W/m² (Night)</span>
                <span>1200 W/m² (Peak Noon)</span>
              </div>
            </div>

            {/* Underwater Light Slider */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-cyan-950/50 space-y-1.5">
              <div className="flex justify-between text-xs font-mono-data">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" /> Underwater Light
                </span>
                <span className={`font-bold ${environment.underwaterLightLevel < decisionState.underwaterThresholdLux ? 'text-amber-400' : 'text-cyan-300'}`}>
                  {environment.underwaterLightLevel} lux
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="1500"
                step="5"
                value={environment.underwaterLightLevel}
                onChange={(e) => onUpdateUnderwaterLight(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono-data">
                <span>2 lux (Deep darkness)</span>
                <span>1500 lux (Bright shallow)</span>
              </div>
            </div>

            {/* Water Turbidity Slider */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-cyan-950/50 space-y-1.5">
              <div className="flex justify-between text-xs font-mono-data">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" /> Turbidity (NTU)
                </span>
                <span className="font-bold text-blue-300">{environment.turbidity} NTU</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={environment.turbidity}
                onChange={(e) => onUpdateTurbidity(Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono-data">
                <span>1 NTU (Crystal Clear)</span>
                <span>100 NTU (Heavy Silt)</span>
              </div>
            </div>

            {/* Time of Day Slider */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-cyan-950/50 space-y-1.5">
              <div className="flex justify-between text-xs font-mono-data">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> Solar Time
                </span>
                <span className="font-bold text-cyan-300">
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

            {/* Low-Light Persistence Threshold Slider */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-cyan-950/50 space-y-1.5">
              <div className="flex justify-between text-xs font-mono-data">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Timer className="w-3.5 h-3.5 text-emerald-400" /> Persistence Threshold
                </span>
                <span className="font-bold text-emerald-300">
                  {decisionState.persistenceDurationMinutes} min
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={decisionState.persistenceDurationMinutes}
                onChange={(e) => onUpdatePersistenceThreshold(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono-data">
                <span>5 min (Fast Response)</span>
                <span>60 min (High Hysteresis)</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </GlassPanel>
  );
};
