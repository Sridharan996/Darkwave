import React from 'react';
import { Lightbulb } from 'lucide-react';
import { BuoyHardwareTelemetry, DecisionEngineState } from '../../types/simulation';

interface UnderwaterLedPanelProps {
  telemetry: BuoyHardwareTelemetry;
  decisionState: DecisionEngineState;
}

export const UnderwaterLedPanel: React.FC<UnderwaterLedPanelProps> = ({
  telemetry,
  decisionState,
}) => {
  const isLedOn = decisionState.lightingState === 'ACTIVE_SUPPLEMENTAL';
  const intensity = telemetry.ledIntensityPercent;

  // SVG Circular Gauge calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((intensity / 100) * circumference);

  return (
    <div className="p-4 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl shadow-xl select-none flex flex-col justify-between space-y-3.5">
      
      {/* Panel Header */}
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-cyan-400" />
        <h2 className="text-xs font-display font-bold uppercase tracking-wider text-slate-200">
          Underwater LED
        </h2>
      </div>

      {/* Main LED Status Card with Intensity Circular Gauge */}
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
          isLedOn
            ? 'bg-gradient-to-r from-rose-950/40 to-slate-900/60 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
            : 'bg-slate-900/40 border-slate-800'
        }`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${
              isLedOn
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                : 'bg-slate-800/60 border-slate-700 text-slate-500'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div
              className={`text-base font-display font-extrabold tracking-wider ${
                isLedOn ? 'text-rose-200' : 'text-slate-400'
              }`}
            >
              {isLedOn ? 'LED ON' : 'LED OFF'}
            </div>
            <div className="text-[10.5px] font-sans text-slate-400 leading-tight mt-0.5">
              {isLedOn
                ? 'Supplementary illumination active'
                : 'Standby - Natural light sufficient'}
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
              className={isLedOn ? 'stroke-blue-400' : 'stroke-slate-700'}
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
              {intensity}%
            </span>
            <span className="text-[7.5px] font-sans text-slate-400 uppercase mt-0.5">
              Intensity
            </span>
          </div>
        </div>
      </div>

      {/* 0% to 100% Gradient Intensity Track */}
      <div className="space-y-1 pt-1 font-mono-data">
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500">0%</span>
          <div className="flex-1 bg-slate-800/80 h-1.5 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isLedOn
                  ? 'bg-gradient-to-r from-rose-500 via-purple-500 to-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                  : 'bg-slate-700'
              }`}
              style={{ width: `${intensity}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-500">100%</span>
        </div>
      </div>

    </div>
  );
};
