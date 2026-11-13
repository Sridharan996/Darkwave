import React from 'react';
import { GlassPanel } from '../common/GlassPanel';
import { Gauge } from '../common/Gauge';
import { DecisionEngineState, EnvironmentalConditions } from '../../types/simulation';
import {
  BrainCircuit,
  Clock,
  SunMedium,
  Timer,
  CheckCircle2,
  AlertCircle,
  Activity,
  Zap,
  Radio,
} from 'lucide-react';

interface AiDecisionPanelProps {
  decisionState: DecisionEngineState;
  environment: EnvironmentalConditions;
}

export const AiDecisionPanel: React.FC<AiDecisionPanelProps> = ({
  decisionState,
  environment,
}) => {
  const isRequired = decisionState.mlIlluminationRequired === 1;
  const isLedOn = decisionState.lightingState === 'ACTIVE_SUPPLEMENTAL';
  const isPending = decisionState.lightingState === 'PENDING_VERIFICATION';

  const isBelowThreshold = environment.underwaterLightLevel < decisionState.underwaterThresholdLux;
  const isDurationMet = decisionState.currentLowLightDurationMinutes >= decisionState.persistenceDurationMinutes;
  const isMlPositive = decisionState.mlIlluminationRequired === 1;

  return (
    <GlassPanel
      title="AI DECISION STATUS"
      subtitle="Combined Decision: ML Inference + Persistence + Threshold"
      badge={
        <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
          <BrainCircuit className="w-4 h-4" />
        </div>
      }
      headerAction={
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-[9px] font-mono-data">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-cyan-300">FastAPI ML {decisionState.apiLatencyMs ? `(${decisionState.apiLatencyMs}ms)` : 'Live'}</span>
        </div>
      }
      className="h-full flex flex-col justify-between"
    >
      <div className="space-y-3.5">
        
        {/* Main Status Pill & Explanation */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-cyan-500/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono-data font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
                isLedOn
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                  : isPending
                  ? 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              {isLedOn ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  FINAL DECISION: ACTIVATE LED
                </>
              ) : isPending ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  VERIFYING PERSISTENCE
                </>
              ) : (
                'FINAL DECISION: DEACTIVATE LED'
              )}
            </span>

            <span className="text-[9px] font-mono-data text-cyan-400 uppercase">
              ML = {decisionState.mlIlluminationRequired}
            </span>
          </div>

          <p className="text-xs font-sans text-slate-300 leading-relaxed pt-1">
            {decisionState.decisionReason}
          </p>
        </div>

        {/* Circular Confidence Gauge */}
        <div className="flex justify-center py-0.5">
          <Gauge
            value={decisionState.mlConfidenceScore * 100}
            min={0}
            max={100}
            unit="%"
            title="ML Model Confidence"
            subtitle="FastAPI /predict Random Forest Output"
            accentColor={isLedOn ? 'aqua' : isPending ? 'amber' : 'cyan'}
            size={160}
          />
        </div>

        {/* 3 Decision Criteria Matrix */}
        <div className="space-y-1.5 pt-2 border-t border-cyan-900/30 font-mono-data text-xs">
          
          {/* Criterion 1: Underwater Light vs Threshold */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-cyan-950/50">
            <div className="flex items-center gap-2 text-[11px]">
              <SunMedium className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">1. Light &lt; Threshold:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`font-bold ${isBelowThreshold ? 'text-amber-300' : 'text-slate-200'}`}>
                {environment.underwaterLightLevel} / {decisionState.underwaterThresholdLux} lux
              </span>
              <span className={`text-[10px] px-1 rounded ${isBelowThreshold ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                {isBelowThreshold ? 'MET' : 'OK'}
              </span>
            </div>
          </div>

          {/* Criterion 2: Low-light Persistence Duration */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-cyan-950/50">
            <div className="flex items-center gap-2 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">2. Duration &ge; Required:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`font-bold ${isDurationMet ? 'text-emerald-300' : 'text-amber-300'}`}>
                {decisionState.currentLowLightDurationSeconds ?? 0} / {decisionState.persistenceDurationSeconds ?? 5} sec
              </span>
              <span className={`text-[10px] px-1 rounded ${isDurationMet ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                {isDurationMet ? 'MET' : `${decisionState.persistenceProgressPercent}%`}
              </span>
            </div>
          </div>

          {/* Criterion 3: ML Model Prediction */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-cyan-950/50">
            <div className="flex items-center gap-2 text-[11px]">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">3. ML Model Prediction:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`font-bold ${isMlPositive ? 'text-emerald-300' : 'text-slate-400'}`}>
                {isMlPositive ? 'illumination_required = 1' : 'standby = 0'}
              </span>
              <span className={`text-[10px] px-1 rounded ${isMlPositive ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                {(decisionState.mlConfidenceScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>

        </div>

      </div>
    </GlassPanel>
  );
};
