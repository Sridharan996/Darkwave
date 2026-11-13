/**
 * DARKWAVE - FastAPI ML Backend API Client
 * Connects frontend dashboard to python FastAPI service on port 8000
 */

export interface PredictPayload {
  cloud_cover_percent: number;
  solar_irradiance: number;
  underwater_light_level: number;
  turbidity: number;
  time_of_day: number;
  low_light_duration_minutes: number;
}

export interface PredictResponse {
  illumination_required: 0 | 1;
  probability: number;
  model_status: string;
  model_type: string;
  notice: string;
}

const API_BASE_URL = 'http://localhost:8000';

export async function fetchMlPrediction(payload: PredictPayload): Promise<PredictResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`FastAPI responded with HTTP ${response.status}`);
    }

    const data: PredictResponse = await response.json();
    return data;
  } catch (error) {
    throw new Error(`ML backend unavailable: ${error instanceof Error ? error.message : 'request failed'}`);
  }
}

export interface ModelMetricsResponse {
  model_name: string;
  model_type: string;
  notice: string;
  dataset_size: number;
  train_samples: number;
  test_samples: number;
  evaluation_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    confusion_matrix: {
      true_negative: number;
      false_positive: number;
      false_negative: number;
      true_positive: number;
    };
  };
  feature_importances: {
    cloud_cover_percent: number;
    solar_irradiance: number;
    underwater_light_level: number;
    turbidity: number;
    time_of_day: number;
    low_light_duration_minutes: number;
  };
  features_used: string[];
}

export async function fetchModelMetrics(): Promise<ModelMetricsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/metrics`, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Model metrics unavailable: ${error instanceof Error ? error.message : 'request failed'}`);
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}
