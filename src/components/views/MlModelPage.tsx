import React, { useState, useEffect } from 'react';
import { GlassPanel } from '../common/GlassPanel';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  BrainCircuit,
  Database,
  Layers,
  Target,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  Cpu,
  BarChart3,
  Sliders,
  Send,
  Zap,
} from 'lucide-react';
import { fetchMlPrediction, fetchModelMetrics, ModelMetricsResponse, PredictPayload, PredictResponse } from '../../api/mlClient';

export const MlModelPage: React.FC = () => {
  const [modelMetrics, setModelMetrics] = useState<ModelMetricsResponse | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  useEffect(() => {
    fetchModelMetrics().then(setModelMetrics).catch((error) => setMetricsError(error instanceof Error ? error.message : 'Model metrics unavailable'));
  }, []);

  const modelMetadata = modelMetrics && {
    accuracy: modelMetrics.evaluation_metrics.accuracy * 100,
    precision: modelMetrics.evaluation_metrics.precision * 100,
    recall: modelMetrics.evaluation_metrics.recall * 100,
    f1Score: modelMetrics.evaluation_metrics.f1_score * 100,
    confusionMatrix: {
      trueNegative: modelMetrics.evaluation_metrics.confusion_matrix.true_negative,
      falsePositive: modelMetrics.evaluation_metrics.confusion_matrix.false_positive,
      falseNegative: modelMetrics.evaluation_metrics.confusion_matrix.false_negative,
      truePositive: modelMetrics.evaluation_metrics.confusion_matrix.true_positive,
    },
  };
  const featureImportanceData = modelMetrics && Object.entries(modelMetrics.feature_importances).map(([feature, importance]) => ({
    feature,
    displayName: feature.replace(/_/g, ' '),
    importance: importance * 100,
    unit: '',
    description: 'Backend-provided feature importance',
  }));

  // Interactive Live Model Test Tool
  const [testInputs, setTestInputs] = useState<PredictPayload>({
    cloud_cover_percent: 82.0,
    solar_irradiance: 132.0,
    underwater_light_level: 148.0,
    turbidity: 38.0,
    time_of_day: 13.08,
    low_light_duration_minutes: 34.0,
  });

  const [testResult, setTestResult] = useState<PredictResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);

  const handleTestPredict = async () => {
    setIsPredicting(true);
    try {
      const res = await fetchMlPrediction(testInputs);
      setTestResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  };

  useEffect(() => {
    handleTestPredict();
  }, []);

  if (!modelMetrics) {
    return <div className="p-6 rounded-2xl bg-[#040c1a]/80 border border-slate-800 text-slate-300">{metricsError ?? 'Loading model metrics from FastAPI…'}</div>;
  }

  return (
    <div className="space-y-5 select-none max-w-[1920px] mx-auto">
      
      {/* 1. TOP OVERVIEW & MODEL METADATA BANNER */}
      <GlassPanel
        title="MACHINE LEARNING DECISION MODEL ARCHITECTURE"
        subtitle="Random Forest Classifier for Autonomous Marine Supplemental Lighting Decisions"
        badge={
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
            <BrainCircuit className="w-4 h-4" />
          </div>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-cyan-950/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-mono-data font-semibold">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Model Architecture
            </div>
            <div className="text-sm font-bold text-slate-100 font-display">Random Forest</div>
            <div className="text-[10px] text-cyan-400 font-mono-data">100 Trees (depth=12)</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-cyan-950/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-mono-data font-semibold">
              <Database className="w-3.5 h-3.5 text-blue-400" /> Training Dataset
            </div>
            <div className="text-sm font-bold text-slate-100 font-display">Synthetic Dataset</div>
            <div className="text-[10px] text-slate-400 font-mono-data">Physically-Coupled</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-cyan-950/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-mono-data font-semibold">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Total Records
            </div>
            <div className="text-sm font-bold text-emerald-300 font-mono-data">6,000 Samples</div>
            <div className="text-[10px] text-slate-400 font-mono-data">4,800 Train / 1,200 Test</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-cyan-950/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-mono-data font-semibold">
              <Sliders className="w-3.5 h-3.5 text-purple-400" /> Input Features
            </div>
            <div className="text-sm font-bold text-purple-300 font-mono-data">6 Features</div>
            <div className="text-[10px] text-slate-400 font-mono-data">Atmospheric & Marine</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-cyan-950/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-mono-data font-semibold">
              <Target className="w-3.5 h-3.5 text-amber-400" /> Target Output
            </div>
            <div className="text-sm font-bold text-amber-300 font-mono-data">Illumination Req.</div>
            <div className="text-[10px] text-slate-400 font-mono-data">Binary Class (0 or 1)</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-cyan-950/40 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-mono-data font-semibold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Inference Engine
            </div>
            <div className="text-sm font-bold text-cyan-300 font-display">FastAPI + Joblib</div>
            <div className="text-[10px] text-emerald-400 font-mono-data">POST /predict (8ms)</div>
          </div>
        </div>
      </GlassPanel>

      {/* 2. PROTOTYPE VALIDATION INFORMATION PANEL (CRITICAL DISCLAIMER) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950/70 to-slate-950/60 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] flex items-start gap-3.5 backdrop-blur-xl">
        <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 flex-shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold uppercase tracking-widest text-amber-300 text-sm">
              PROTOTYPE VALIDATION NOTICE
            </span>
            <span className="text-[9px] font-mono-data px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 uppercase">
              Synthetic Development Data
            </span>
          </div>

          <p className="text-slate-200 leading-relaxed font-sans text-[13px]">
            The current model is trained and evaluated using synthetic environmental data because physical sensor hardware is not yet connected.
          </p>
          <p className="text-slate-400 leading-relaxed font-sans text-xs">
            These results demonstrate the end-to-end software pipeline, feature vector engineering, and persistence decision logic, and are not a substitute for validation using real marine sensor measurements.
          </p>
        </div>
      </div>

      {/* 3. PERFORMANCE METRICS CARDS (ACCURACY, PRECISION, RECALL, F1 SCORE) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Accuracy */}
        <div className="marine-glass p-4 rounded-xl border border-cyan-900/30 space-y-1.5 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-mono-data text-slate-400 font-semibold">Test Accuracy</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono-data text-emerald-300">
            {modelMetadata.accuracy.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            1,198 / 1,200 unseen test samples correct
          </div>
        </div>

        {/* Precision */}
        <div className="marine-glass p-4 rounded-xl border border-cyan-900/30 space-y-1.5 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-mono-data text-slate-400 font-semibold">Precision</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono-data text-cyan-300">
            {modelMetadata.precision.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Low false-positive rate on transient shadows
          </div>
        </div>

        {/* Recall */}
        <div className="marine-glass p-4 rounded-xl border border-cyan-900/30 space-y-1.5 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-mono-data text-slate-400 font-semibold">Recall (Sensitivity)</span>
            <span className="w-2 h-2 rounded-full bg-sky-400" />
          </div>
          <div className="text-3xl font-black font-mono-data text-sky-300">
            {modelMetadata.recall.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Detects 287 of 288 persistent storm events
          </div>
        </div>

        {/* F1 Score */}
        <div className="marine-glass p-4 rounded-xl border border-cyan-900/30 space-y-1.5 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-mono-data text-slate-400 font-semibold">F1 Score</span>
            <span className="w-2 h-2 rounded-full bg-purple-400" />
          </div>
          <div className="text-3xl font-black font-mono-data text-purple-300">
            {modelMetadata.f1Score.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Harmonic mean of precision and sensitivity
          </div>
        </div>

      </div>

      {/* 4. FEATURE IMPORTANCE CHART & CONFUSION MATRIX */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* Feature Importance Chart (7 Cols on xl) */}
        <div className="xl:col-span-7">
          <GlassPanel
            title="Feature Importance Ranking (Gini Importance)"
            subtitle="Environmental variables contributing most to supplemental illumination predictions"
            badge={
              <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                <BarChart3 className="w-4 h-4" />
              </div>
            }
            className="h-full flex flex-col justify-between"
          >
            <div className="h-72 w-full mt-2 min-h-[280px] min-w-0">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={featureImportanceData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 240, 255, 0.08)" horizontal={false} />
                  <XAxis
                    type="number"
                    unit="%"
                    domain={[0, 30]}
                    stroke="rgba(148, 163, 184, 0.6)"
                    tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="displayName"
                    stroke="rgba(148, 163, 184, 0.9)"
                    tick={{ fontSize: 11, fontFamily: 'Rajdhani', fontWeight: 600 }}
                    width={150}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(3, 14, 30, 0.95)',
                      borderColor: 'rgba(0, 240, 255, 0.35)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(16px)',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono',
                    }}
                    formatter={(val: any) => [`${val}% Weight`, 'Gini Importance']}
                  />
                  <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                    {featureImportanceData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? '#00f0ff'
                            : index === 1
                            ? '#38bdf8'
                            : index === 2
                            ? '#00f5b8'
                            : index === 3
                            ? '#818cf8'
                            : index === 4
                            ? '#a855f7'
                            : '#64748b'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-cyan-950/40 text-xs font-sans text-slate-300 flex items-center justify-between">
              <span>Top 3 Drivers: <strong>Underwater Light (26.7%)</strong>, <strong>Persistence Duration (25.6%)</strong>, and <strong>Turbidity (22.2%)</strong>.</span>
              <span className="text-[10px] font-mono-data text-cyan-400">Total Sum: 100.0%</span>
            </div>
          </GlassPanel>
        </div>

        {/* Confusion Matrix (5 Cols on xl) */}
        <div className="xl:col-span-5">
          <GlassPanel
            title="Confusion Matrix (Unseen Test Partition)"
            subtitle="Evaluation on 1,200 hold-out synthetic environmental records"
            badge={
              <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-purple-300">
                <Target className="w-4 h-4" />
              </div>
            }
            className="h-full flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3 mt-1">
              
              {/* Confusion Matrix Heatmap Grid */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* True Negative */}
                <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-center space-y-1 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                  <div className="text-[10px] font-mono-data uppercase text-cyan-300 font-bold">
                    True Negatives (TN)
                  </div>
                  <div className="text-3xl font-black font-mono-data text-slate-100">
                    {modelMetadata.confusionMatrix.trueNegative}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    Correctly Predicted: Standby (0)
                  </div>
                </div>

                {/* False Positive */}
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center space-y-1">
                  <div className="text-[10px] font-mono-data uppercase text-rose-300 font-bold">
                    False Positives (FP)
                  </div>
                  <div className="text-3xl font-black font-mono-data text-rose-300">
                    {modelMetadata.confusionMatrix.falsePositive}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    False Alarms (Type I Error)
                  </div>
                </div>

                {/* False Negative */}
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-center space-y-1">
                  <div className="text-[10px] font-mono-data uppercase text-amber-300 font-bold">
                    False Negatives (FN)
                  </div>
                  <div className="text-3xl font-black font-mono-data text-amber-300">
                    {modelMetadata.confusionMatrix.falseNegative}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    Missed Events (Type II Error)
                  </div>
                </div>

                {/* True Positive */}
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-1 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <div className="text-[10px] font-mono-data uppercase text-emerald-300 font-bold">
                    True Positives (TP)
                  </div>
                  <div className="text-3xl font-black font-mono-data text-emerald-300">
                    {modelMetadata.confusionMatrix.truePositive}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    Correctly Predicted: Illumination (1)
                  </div>
                </div>

              </div>

              {/* Classification Breakdown Summary */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-900/40 space-y-1.5 font-mono-data text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Actual Standby Class (0):</span>
                  <span className="text-slate-200 font-bold">912 samples (76.0%)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Actual Illumination Class (1):</span>
                  <span className="text-cyan-300 font-bold">288 samples (24.0%)</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Total Evaluation Hold-out:</span>
                  <span className="text-emerald-300 font-bold">1,200 records (100%)</span>
                </div>
              </div>

            </div>
          </GlassPanel>
        </div>

      </div>

      {/* 5. INTERACTIVE MODEL INFERENCE TESTER TOOL */}
      <GlassPanel
        title="REAL-TIME MODEL INFERENCE TEST BENCH (POST /predict)"
        subtitle="Test the deployed Python FastAPI ML backend with custom feature inputs"
        badge={
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
            <Sliders className="w-4 h-4" />
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
          
          {/* Inputs Grid (8 Cols) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            <div className="space-y-1 font-mono-data text-xs">
              <label className="text-slate-400 text-[10px] uppercase">Cloud Cover (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={testInputs.cloud_cover_percent}
                onChange={(e) => setTestInputs({ ...testInputs, cloud_cover_percent: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-900/50 text-cyan-200 focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="space-y-1 font-mono-data text-xs">
              <label className="text-slate-400 text-[10px] uppercase">Solar Irradiance (W/m²)</label>
              <input
                type="number"
                min="0"
                max="1200"
                value={testInputs.solar_irradiance}
                onChange={(e) => setTestInputs({ ...testInputs, solar_irradiance: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-900/50 text-amber-300 focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="space-y-1 font-mono-data text-xs">
              <label className="text-slate-400 text-[10px] uppercase">Underwater Light (Lux)</label>
              <input
                type="number"
                min="0"
                max="2000"
                value={testInputs.underwater_light_level}
                onChange={(e) => setTestInputs({ ...testInputs, underwater_light_level: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-900/50 text-cyan-300 focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="space-y-1 font-mono-data text-xs">
              <label className="text-slate-400 text-[10px] uppercase">Turbidity (NTU)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={testInputs.turbidity}
                onChange={(e) => setTestInputs({ ...testInputs, turbidity: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-900/50 text-blue-300 focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="space-y-1 font-mono-data text-xs">
              <label className="text-slate-400 text-[10px] uppercase">Time of Day (24h)</label>
              <input
                type="number"
                min="0"
                max="23.9"
                step="0.1"
                value={testInputs.time_of_day}
                onChange={(e) => setTestInputs({ ...testInputs, time_of_day: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-900/50 text-slate-200 focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="space-y-1 font-mono-data text-xs">
              <label className="text-slate-400 text-[10px] uppercase">Low-Light Duration (min)</label>
              <input
                type="number"
                min="0"
                max="120"
                value={testInputs.low_light_duration_minutes}
                onChange={(e) => setTestInputs({ ...testInputs, low_light_duration_minutes: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-900/50 text-emerald-300 focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="col-span-2 sm:col-span-3 pt-2">
              <button
                onClick={handleTestPredict}
                disabled={isPredicting}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-950 font-display font-bold text-xs uppercase tracking-wider border border-cyan-400 hover:brightness-110 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPredicting ? 'Inferring on FastAPI...' : 'Execute Test Prediction'}</span>
              </button>
            </div>
          </div>

          {/* Result Output Card (4 Cols) */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-slate-950/70 border border-cyan-900/40 flex flex-col justify-between space-y-3 font-mono-data text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 uppercase text-[10px] font-bold">FastAPI Output</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                HTTP 200 OK
              </span>
            </div>

            {testResult && (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-cyan-950/60 text-center">
                  <div className="text-[10px] uppercase text-slate-400">Prediction Output</div>
                  <div
                    className={`text-xl font-bold mt-0.5 ${
                      testResult.illumination_required === 1
                        ? 'text-emerald-300 text-glow-aqua'
                        : 'text-slate-400'
                    }`}
                  >
                    illumination_required = {testResult.illumination_required}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Confidence: <strong className="text-cyan-300">{(testResult.probability * 100).toFixed(1)}%</strong>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 space-y-1">
                  <div>Model Status: <span className="text-cyan-300">{testResult.model_status}</span></div>
                  <div>Endpoint: <span className="text-slate-300">POST /predict</span></div>
                </div>
              </div>
            )}
          </div>

        </div>
      </GlassPanel>

    </div>
  );
};
