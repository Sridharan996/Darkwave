import React from 'react';
import { Activity, AlertTriangle, ShieldCheck, Hourglass, Waves as WavesIcon, Clock } from 'lucide-react';
import { DecisionEngineState, EnvironmentalConditions } from '../../types/simulation';

interface SystemStatusPanelProps {
  decisionState: DecisionEngineState;
  environment: EnvironmentalConditions;
}

export const SystemStatusPanel: React.FC<SystemStatusPanelProps> = ({
  decisionState,
}) => {
  const isRequired = decisionState.mlIlluminationRequired === 1;
  const isLedOn = decisionState.lightingState === 'ACTIVE_SUPPLEMENTAL';
  const confidencePercent = (decisionState.mlConfidenceScore * 100).toFixed(1);

  // SVG Circular Gauge calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (decisionState.mlConfidenceScore * circumference);

  return (
    <div className="p-4 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl shadow-xl select-none flex flex-col justify-between space-y-3.5">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-display font-bold uppercase tracking-wider text-slate-200">
            System Status
          </h2>
        </div>

        {/* Live Badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[9px] font-mono-data text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      {/* Main Status Block with Circular Confidence Gauge */}
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
          isRequired
            ? 'bg-gradient-to-r from-rose-950/40 to-slate-900/60 border-rose-500/40'
            : 'bg-gradient-to-r from-emerald-950/40 to-slate-900/60 border-emerald-500/40'
        }`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${
              isRequired
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
            }`}
          >
            {isRequired ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0">
            <div
              className={`text-xs font-display font-bold tracking-wider uppercase ${
                isRequired ? 'text-rose-300' : 'text-emerald-300'
              }`}
            >
              {isRequired ? 'ILLUMINATION REQUIRED' : 'ILLUMINATION NOT REQUIRED'}
            </div>
            <div className="text-[10.5px] font-sans text-slate-400 leading-tight mt-0.5">
              {isRequired
                ? 'Persistent low-light condition detected by ML model'
                : 'Natural ambient downwelling light sufficient'}
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
              className={isRequired ? 'stroke-rose-500' : 'stroke-emerald-500'}
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
              {confidencePercent}%
            </span>
            <span className="text-[7.5px] font-sans text-slate-400 uppercase mt-0.5">
              Confidence
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Metrics Row: 3 compact columns */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 font-mono-data text-xs">
        
        {/* Low-light Duration */}
        <div className="flex items-start gap-2">
          <Hourglass className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[9px] text-slate-400 font-sans uppercase">Low-light Duration</div>
            <div className="text-[11px] font-bold text-slate-200">
              {decisionState.currentLowLightDurationSeconds ?? 0} / {decisionState.persistenceDurationSeconds ?? 5} sec
            </div>
          </div>
        </div>

        {/* Threshold */}
        <div className="flex items-start gap-2">
          <WavesIcon className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[9px] text-slate-400 font-sans uppercase">Threshold</div>
            <div className="text-[11px] font-bold text-slate-200">
              {decisionState.underwaterThresholdLux} lux
            </div>
          </div>
        </div>

        {/* ML Prediction */}
        <div className="flex items-start gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[9px] text-slate-400 font-sans uppercase">ML Prediction</div>
            <div className="text-[11px] font-bold text-slate-200 truncate">
              {isRequired ? 'Illumination Required' : 'Standby'}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
