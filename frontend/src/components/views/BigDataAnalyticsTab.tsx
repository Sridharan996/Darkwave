import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { fetchSparkAnalytics, fetchSparkBatches, fetchSparkHealth, fetchSparkPredictions, fetchStreamingStatus, SparkAnalytics, SparkBatch, SparkHealth, SparkPrediction, StreamingStatus } from '../../api/sparkClient';

export const BigDataAnalyticsTab: React.FC = () => {
  const [health, setHealth] = useState<SparkHealth | null>(null);
  const [analytics, setAnalytics] = useState<SparkAnalytics | null>(null);
  const [streaming, setStreaming] = useState<StreamingStatus | null>(null);
  const [batches, setBatches] = useState<SparkBatch[]>([]);
  const [predictions, setPredictions] = useState<Record<string, SparkPrediction[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const requestController = useRef<AbortController | null>(null);
  const predictionController = useRef<AbortController | null>(null);

  const retryButton = (
    <button
      type="button"
      onClick={() => void refresh()}
      disabled={refreshing}
      className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
      {refreshing ? 'Retrying…' : 'Retry'}
    </button>
  );

  const refresh = useCallback(async () => {
    requestController.current?.abort();
    predictionController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setError(null);
    setPredictionError(null);
    setRefreshing(true);
    try {
      const [nextHealth, nextAnalytics, nextStreaming, nextBatches] = await Promise.all([fetchSparkHealth(), fetchSparkAnalytics('DARKWAVE-1000-ROW-001'), fetchStreamingStatus(), fetchSparkBatches()]);
      if (controller.signal.aborted) return;
      setHealth(nextHealth); setAnalytics(nextAnalytics); setStreaming(nextStreaming); setBatches(nextBatches.batches);
      setLastUpdated(new Date());
      setLoading(false);
      setRefreshing(false);

      const targetBatch = nextBatches.batches.find(batch => batch.batch_id === 'DARKWAVE-1000-ROW-001' && batch.status === 'COMPLETED');
      if (targetBatch) {
        const predictionRequest = new AbortController();
        predictionController.current = predictionRequest;
        try {
          const result = await fetchSparkPredictions(targetBatch.batch_id, predictionRequest.signal);
          if (!controller.signal.aborted && !predictionRequest.signal.aborted) {
            setPredictions({ [targetBatch.batch_id]: result.predictions });
          }
        } catch (reason) {
          if (!controller.signal.aborted && !predictionRequest.signal.aborted) {
            setPredictionError(reason instanceof Error ? reason.message : 'Predictions could not be loaded.');
          }
        }
      }
    } catch (reason) {
      if (controller.signal.aborted) return;
      setError(reason instanceof Error ? reason.message : 'Unable to reach Spark service');
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    return () => {
      requestController.current?.abort();
      predictionController.current?.abort();
    };
  }, [refresh]);

  if (loading && !analytics) {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-[#040c1a]/80 p-6 text-cyan-300">
        <p>Loading Spark analytics…</p>
        {error ? (
          <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-900/60 bg-red-950/20 p-4 text-red-200 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Spark analytics could not be loaded</p>
                <p className="mt-1 text-sm text-red-300">{error}</p>
              </div>
            </div>
            {retryButton}
          </div>
        ) : null}
      </div>
    );
  }
  if (error && !analytics) {
    return (
      <div role="alert" className="flex flex-col gap-4 rounded-2xl border border-red-900/60 bg-[#040c1a]/80 p-6 text-red-200 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Spark analytics could not be loaded</p>
            <p className="mt-1 text-sm text-red-300">{error}</p>
            <p className="mt-2 text-xs text-slate-400">Check that the Spark service is running, then try again.</p>
          </div>
        </div>
        {retryButton}
      </div>
    );
  }
  if (!health || !analytics || !streaming) return <div className="p-6 rounded-2xl bg-[#040c1a]/80 border border-slate-800 text-slate-300">No Spark analytics available yet.</div>;
  const number = (value: number | undefined, suffix = '') => value === undefined ? '—' : `${value.toFixed(1)}${suffix}`;
  return <section className="space-y-4">
    <div className="flex items-center justify-between"><div><h2 className="text-xl font-display font-bold text-white">Big Data Analytics</h2><p className="text-xs text-slate-400">{health.synthetic_notice}</p>{lastUpdated ? <p className="text-[10px] text-slate-500">Last updated {lastUpdated.toLocaleTimeString()}</p> : null}{error ? <p className="text-xs text-amber-300">{error} Showing the last successful data.</p> : null}</div><button onClick={() => void refresh()} disabled={refreshing} className="p-2 rounded-lg border border-slate-700 text-cyan-300 disabled:opacity-50" aria-label="Refresh">{refreshing ? <span className="text-xs">Refreshing…</span> : <RefreshCw className="w-4 h-4" />}</button></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[[`Spark ${health.spark_version}`, 'Spark'], [`Scala ${health.scala_version}`, 'Scala'], [streaming.status, 'Streaming'], [analytics.total_records, 'Processed records']].map(([value, label]) => <div key={label} className="p-4 rounded-xl bg-[#040c1a]/80 border border-slate-800"><div className="text-lg font-bold text-cyan-300">{value}</div><div className="text-xs text-slate-400">{label}</div></div>)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="p-5 rounded-2xl bg-[#040c1a]/80 border border-slate-800"><h3 className="font-bold text-white mb-3">Environmental metrics</h3><div className="grid grid-cols-2 gap-3 text-sm text-slate-300"><span>Valid <b className="text-emerald-300">{analytics.valid_records}</b></span><span>Rejected <b className="text-amber-300">{analytics.rejected_records ?? 0}</b></span><span>Avg light <b className="text-cyan-300">{number(analytics.average_underwater_light, ' lux')}</b></span><span>Avg turbidity <b className="text-cyan-300">{number(analytics.average_turbidity, ' NTU')}</b></span><span>Avg cloud cover <b className="text-cyan-300">{number(analytics.average_cloud_cover, '%')}</b></span><span>Avg irradiance <b className="text-cyan-300">{number(analytics.average_solar_irradiance, ' W/m²')}</b></span><span>Avg low-light duration <b className="text-cyan-300">{number(analytics.average_low_light_duration_minutes, ' min')}</b></span></div></div>
      <div className="p-5 rounded-2xl bg-[#040c1a]/80 border border-slate-800"><h3 className="font-bold text-white mb-3">Weather distribution</h3>{Object.keys(analytics.weather_distribution).length ? Object.entries(analytics.weather_distribution).map(([weather, count]) => <div key={weather} className="flex justify-between py-1 text-sm text-slate-300"><span>{weather}</span><b className="text-cyan-300">{count}</b></div>) : <p className="text-sm text-slate-500">No processed readings yet.</p>}</div>
    </div>
    <div className="p-5 rounded-2xl bg-[#040c1a]/80 border border-slate-800"><h3 className="font-bold text-white mb-3">Batch history and predictions</h3>{predictionError ? <p className="mb-2 text-xs text-amber-300">{predictionError}</p> : null}{batches.length ? <div className="space-y-2">{batches.map(batch => <div key={batch.batch_id} className="rounded-lg border border-slate-800 p-3 text-xs text-slate-300"><div className="flex justify-between"><span className="font-mono text-cyan-300">{batch.batch_id}</span><span>{batch.status}</span></div><div>{batch.valid_records} valid · {batch.rejected_records} rejected · {predictions[batch.batch_id]?.length ?? 0} predictions</div>{batch.batch_id === 'DARKWAVE-1000-ROW-001' && predictions[batch.batch_id]?.length ? <div className="mt-2 max-h-40 overflow-auto border-t border-slate-800 pt-2">{predictions[batch.batch_id].slice(0, 20).map(item => <div key={item.record_id} className="flex justify-between"><span>{item.record_id}</span><span className="text-cyan-300">{item.prediction.illumination_required} ({item.prediction.probability.toFixed(4)})</span></div>)}<div className="mt-1 text-slate-500">Showing first 20 of {predictions[batch.batch_id].length} predictions.</div></div> : null}</div>)}</div> : <p className="text-sm text-slate-500">No submitted batches yet.</p>}</div>
    <div className="p-5 rounded-2xl bg-[#040c1a]/80 border border-slate-800"><h3 className="font-bold text-white mb-3">Hourly trends</h3>{analytics.hourly_summaries.length ? <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{analytics.hourly_summaries.map(item => <div key={item.hour} className="text-xs text-slate-400">Hour {item.hour}: <span className="text-cyan-300">{item.average_underwater_light.toFixed(1)} lux</span></div>)}</div> : <p className="text-sm text-slate-500">No hourly data yet.</p>}</div>
  </section>;
};
