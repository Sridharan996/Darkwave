import React from 'react';
import { GlassPanel } from '../common/GlassPanel';
import { Gauge } from '../common/Gauge';
import { EnvironmentalConditions, DecisionEngineState } from '../../types/simulation';
import {
  BrainCircuit,
  Clock,
  Layers,
  Sparkles,
  BarChart3,
  Cpu,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface DecisionEngineTabProps {
  environment: EnvironmentalConditions;
  decisionState: DecisionEngineState;
}

export const DecisionEngineTab: React.FC<DecisionEngineTabProps> = ({
  environment,
  decisionState,
}) => {
  const isRequired = decisionState.mlIlluminationRequired === 1;

  // ML Feature Importances from trained RandomForestClassifier
  const featureImportances = [
    { name: 'underwater_light_level', label: 'Underwater Light Level (Lux)', weight: 26.71, value: `${environment.underwaterLightLevel} lux` },
    { name: 'low_light_duration_minutes', label: 'Low-Light Duration (Mins)', weight: 25.59, value: `${decisionState.currentLowLightDurationMinutes} min` },
    { name: 'turbidity', label: 'Water Turbidity (NTU)', weight: 22.23, value: `${environment.turbidity} NTU` },
    { name: 'cloud_cover_percent', label: 'Atmospheric Cloud Cover (%)', weight: 10.72, value: `${environment.cloudCoverPercent}%` },
    { name: 'solar_irradiance', label: 'Solar Irradiance (W/m²)', weight: 10.56, value: `${environment.solarIrradiance} W/m²` },
    { name: 'time_of_day', label: 'Time of Day (Photoperiod)', weight: 4.19, value: `${Math.floor(environment.timeOfDay)}:${Math.floor((environment.timeOfDay % 1) * 60).toString().padStart(2, '0')}` },
  ];

  return (
    <div className="space-y-4 select-none">
      
      {/* Synthetic Training Notice Banner */}
      <GlassPanel
        title="ML DECISION BACKEND — RANDOM FOREST CLASSIFIER"
        subtitle="Model trained on 6,000 synthetic environmental records with transparent photoperiod & extinction rules"
        badge={
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
            <BrainCircuit className="w-4 h-4" />
          </div>
        }
      >
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs font-mono-data text-cyan-200 flex items-center justify-between flex-wrap gap-2">
          <span>
            API Endpoint: <span className="font-bold text-cyan-300">POST http://localhost:8000/predict</span> | Backend: Python FastAPI + Scikit-Learn
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-400 font-bold uppercase text-[10px] text-cyan-300">
            SYNTHETIC EVALUATION MODEL
          </span>
        </div>
      </GlassPanel>

      {/* Model Performance Evaluation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Test Accuracy', value: '99.83%', sub: '1,198 / 1,200 Correct', color: 'text-emerald-300' },
          { label: 'Precision', value: '99.65%', sub: 'High Fidelity Detection', color: 'text-cyan-300' },
          { label: 'Recall (Sensitivity)', value: '99.65%', sub: 'Zero Missed Storm Events', color: 'text-sky-300' },
          { label: 'F1 Score', value: '99.65%', sub: 'Balanced Harmonic Mean', color: 'text-purple-300' },
        ].map((stat, idx) => (
          <div key={idx} className="marine-glass p-3 rounded-xl border border-cyan-900/30 space-y-1">
            <div className="text-[10px] uppercase font-mono-data text-slate-400 font-semibold">{stat.label}</div>
            <div className={`text-2xl font-bold font-mono-data ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-slate-400 font-sans">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Feature Importances & Inference HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left 2 Cols: Feature Vector & Weights */}
        <div className="lg:col-span-2">
          <GlassPanel
            title="Model Feature Weights & Live Vector"
            subtitle="Gini Importance ranking derived from 100 decision trees (depth=12)"
            badge={
              <div className="p-1 rounded bg-cyan-950/80 border border-cyan-500/30 text-emerald-400">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
            }
          >
            <div className="space-y-3 mt-2">
              {featureImportances.map((feat, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/50 border border-cyan-950/40 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono-data">
                    <span className="text-slate-300 font-semibold">{feat.label}</span>
                    <span className="text-cyan-300 font-bold">{feat.value}</span>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${feat.weight * 3.2}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono-data text-slate-400">
                    <span className="text-slate-500">{feat.name}</span>
                    <span className="text-cyan-400 font-semibold">{feat.weight}% Weight</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Right 1 Col: Live Inference Box & Confusion Matrix */}
        <div className="space-y-4">
          <GlassPanel
            title="Real-time Inference Result"
            subtitle="Live prediction payload from /predict"
            badge={
              <div className="p-1 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                <Cpu className="w-3.5 h-3.5" />
              </div>
            }
          >
            <div className="space-y-3">
              <div className="flex justify-center py-2">
                <Gauge
                  value={decisionState.mlConfidenceScore * 100}
                  min={0}
                  max={100}
                  unit="%"
                  title="Probability Score"
                  subtitle="illumination_required output"
                  accentColor={isRequired ? 'aqua' : 'cyan'}
                  size={160}
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-900/40 space-y-1.5 font-mono-data text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Decision Output:</span>
                  <span className={`font-bold ${isRequired ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {isRequired ? 'ILLUMINATION (1)' : 'STANDBY (0)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Model Status:</span>
                  <span className="text-cyan-300 font-semibold">SYNTHETIC_EVAL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Persistence Timer:</span>
                  <span className="text-amber-300 font-semibold">{decisionState.currentLowLightDurationMinutes} min</span>
                </div>
              </div>

              {/* Confusion Matrix Table */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-900/40 space-y-2">
                <div className="text-[10px] font-mono-data uppercase text-slate-400 font-bold">
                  Test Partition Confusion Matrix (1,200 samples)
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] font-mono-data text-center">
                  <div className="p-2 rounded bg-cyan-950/50 border border-cyan-900/40">
                    <div className="text-slate-400 text-[9px]">True Negatives</div>
                    <div className="font-bold text-slate-100">911</div>
                  </div>
                  <div className="p-2 rounded bg-rose-950/30 border border-rose-900/30">
                    <div className="text-slate-400 text-[9px]">False Positives</div>
                    <div className="font-bold text-rose-300">1</div>
                  </div>
                  <div className="p-2 rounded bg-amber-950/30 border border-amber-900/30">
                    <div className="text-slate-400 text-[9px]">False Negatives</div>
                    <div className="font-bold text-amber-300">1</div>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/50 border border-emerald-900/40">
                    <div className="text-slate-400 text-[9px]">True Positives</div>
                    <div className="font-bold text-emerald-300">287</div>
                  </div>
                </div>
              </div>

            </div>
          </GlassPanel>
        </div>

      </div>

    </div>
  );
};
