const API_BASE_URL = 'http://localhost:8000/api/v1/spark';

export interface SparkHealth { service: string; status: string; spark_version: string; scala_version: string; streaming_status: string; synthetic_notice: string }
export interface SparkAnalytics { total_records: number; valid_records: number; rejected_records?: number; average_underwater_light?: number; minimum_underwater_light?: number; maximum_underwater_light?: number; average_turbidity?: number; average_cloud_cover?: number; average_solar_irradiance?: number; average_low_light_duration_minutes?: number; minimum_low_light_duration_minutes?: number; maximum_low_light_duration_minutes?: number; low_light_duration_distribution?: Record<string, number>; weather_distribution: Record<string, number>; hourly_summaries: Array<{ hour: number; records: number; average_underwater_light: number }>; synthetic_notice: string }
export type WeatherSummary = Record<string, number>;
export interface SparkPrediction { record_id: string; prediction: { illumination_required: 0 | 1; probability: number; model_status: string; notice: string } }
export interface StreamingStatus { status: string; trigger_interval_seconds: number; checkpoint: string }
export interface SparkBatch { batch_id: string; status: string; total_records: number; valid_records: number; rejected_records: number; processing_duration_ms: number; error?: string }

async function request<T>(path: string, init?: RequestInit, timeoutMs = 10000): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const signal = init?.signal;
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { ...init, signal: controller.signal });
    if (!response.ok) throw new Error(`Spark service unavailable (HTTP ${response.status})`);
    return await response.json() as T;
  } catch (reason) {
    if (controller.signal.aborted) {
      throw new Error(signal?.aborted ? 'Spark analytics request was cancelled.' : 'Spark analytics request timed out.');
    }
    throw reason;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

export const fetchSparkHealth = () => request<SparkHealth>('/health');
export const fetchSparkAnalytics = (batchId?: string) => request<SparkAnalytics>(batchId ? `/analytics?batch_id=${encodeURIComponent(batchId)}` : '/analytics', undefined, 30000);
export const fetchWeatherSummary = () => request<WeatherSummary>('/weather-summary');
export const fetchStreamingStatus = () => request<StreamingStatus>('/streaming/status');
export const fetchSparkBatch = (id: string) => request<SparkBatch>(`/batches/${encodeURIComponent(id)}`);
export const fetchSparkBatches = () => request<{ batches: SparkBatch[] }>('/batches');
export const fetchSparkPredictions = (id: string, signal?: AbortSignal) => request<{ batch_id: string; predictions: SparkPrediction[] }>(`/predict/${encodeURIComponent(id)}`, { method: 'POST', signal }, 30000);
