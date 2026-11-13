import React from 'react';
import { GlassPanel } from '../common/GlassPanel';
import { Gauge } from '../common/Gauge';
import { BuoyHardwareTelemetry, DecisionEngineState } from '../../types/simulation';
import { Lightbulb, Zap, Power, ShieldAlert, Cpu } from 'lucide-react';

interface LedControlPanelProps {
  telemetry: BuoyHardwareTelemetry;
  decisionState: DecisionEngineState;
  onToggleManualLed: () => void;
}

export const LedControlPanel: React.FC<LedControlPanelProps> = ({
  telemetry,
  decisionState,
  onToggleManualLed,
}) => {
  const isLedOn = decisionState.lightingState === 'ACTIVE_SUPPLEMENTAL';

  return (
    <GlassPanel
      title="Underwater LED Control"
      subtitle="PWM Photobiological Array Controller"
      badge={
        <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-emerald-400">
          <Lightbulb className="w-4 h-4" />
        </div>
      }
      className="h-full flex flex-col justify-between"
    >
      <div className="space-y-4">
        
        {/* Large Status Display */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-cyan-900/30 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`text-lg font-display font-black tracking-widest ${
                  isLedOn ? 'text-emerald-300 text-glow-aqua' : 'text-slate-400'
                }`}
              >
                {isLedOn ? 'LED ON' : 'LED OFF'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isLedOn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
            </div>
            <p className="text-xs font-sans text-slate-300">
              {isLedOn ? 'Supplementary illumination active' : 'Natural light sufficient (Standby)'}
            </p>
          </div>

          <button
            onClick={onToggleManualLed}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-mono-data font-semibold ${
              isLedOn
                ? 'bg-rose-950/70 border-rose-500/40 text-rose-300 hover:bg-rose-900/80 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80'
            }`}
            title="Manual Operator Override"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Override</span>
          </button>
        </div>

        {/* Circular Intensity Gauge */}
        <div className="flex justify-center py-1">
          <Gauge
            value={telemetry.ledIntensityPercent}
            min={0}
            max={100}
            unit="%"
            title="Illumination Intensity"
            subtitle="Dual Photosynthetic Spectrum"
            accentColor={isLedOn ? 'aqua' : 'cyan'}
            size={170}
          />
        </div>

        {/* 0% to 100% Intensity Spectrum Bar */}
        <div className="space-y-1.5 pt-2 border-t border-cyan-900/30 font-mono-data">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Spectrum Level</span>
            <span className="text-cyan-300 font-bold">{telemetry.ledIntensityPercent}%</span>
          </div>

          <div className="w-full bg-slate-900/90 h-2.5 rounded-full overflow-hidden border border-cyan-950/60 relative">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isLedOn
                  ? 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-fuchsia-400 shadow-[0_0_12px_rgba(0,245,184,0.6)]'
                  : 'bg-slate-700'
              }`}
              style={{ width: `${telemetry.ledIntensityPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] text-slate-500">
            <span>0%</span>
            <span className="text-slate-600">────────────────</span>
            <span>100%</span>
          </div>
        </div>

      </div>
    </GlassPanel>
  );
};
