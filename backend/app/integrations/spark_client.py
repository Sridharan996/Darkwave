import os
from typing import Any, Dict, List
import httpx

SPARK_BASE_URL = os.getenv("SPARK_SERVICE_URL", "http://127.0.0.1:18080").rstrip("/")
SPARK_TIMEOUT = float(os.getenv("SPARK_SERVICE_TIMEOUT_SECONDS", "5"))
SPARK_RETRIES = int(os.getenv("SPARK_SERVICE_RETRIES", "2"))


class SparkServiceError(RuntimeError):
    pass


def _request(method: str, path: str, **kwargs: Any) -> Dict[str, Any]:
    last_error: Exception | None = None
    for _ in range(max(1, SPARK_RETRIES + 1)):
        try:
            response = httpx.request(method, f"{SPARK_BASE_URL}{path}", timeout=SPARK_TIMEOUT, **kwargs)
            if response.status_code >= 400:
                raise SparkServiceError(f"Spark service returned HTTP {response.status_code}")
            return response.json()
        except (httpx.HTTPError, ValueError, SparkServiceError) as error:
            last_error = error
    raise SparkServiceError(f"Spark service unavailable: {last_error}") from last_error


def health() -> Dict[str, Any]:
    return _request("GET", "/health")


def submit_batch(readings: List[Dict[str, Any]]) -> Dict[str, Any]:
    return _request("POST", "/batches", json=readings)


def batch_status(batch_id: str) -> Dict[str, Any]:
    return _request("GET", f"/batches/{batch_id}")


def batches() -> Dict[str, Any]:
    return _request("GET", "/batches")


def batch_records(batch_id: str) -> Dict[str, Any]:
    return _request("GET", f"/batches/{batch_id}/records")


def analytics(batch_id: str | None = None) -> Dict[str, Any]:
    path = "/analytics"
    if batch_id:
        path += f"?batch_id={httpx.QueryParams({'batch_id': batch_id})['batch_id']}"
    return _request("GET", path)


def weather_summary() -> Dict[str, Any]:
    return _request("GET", "/weather-summary")


def streaming_status() -> Dict[str, Any]:
    return _request("GET", "/streaming/status")
