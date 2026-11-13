"""
AQUALUME - Model Training Pipeline
Trains a Random Forest Classifier on synthetic marine environmental records.
Evaluates Accuracy, Precision, Recall, F1, and Confusion Matrix.
Saves model using joblib.

DISCLAIMER:
Model is trained exclusively on SYNTHETIC development data for software prototype evaluation.
Not intended for physical deployment without real-world in-situ sensor calibration.
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)
from app.ml.synthetic_generator import generate_synthetic_dataset

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

FEATURE_NAMES = [
    "cloud_cover_percent",
    "solar_irradiance",
    "underwater_light_level",
    "turbidity",
    "time_of_day",
    "low_light_duration_minutes",
]

TARGET_NAME = "illumination_required"

def train_and_evaluate_model(
    n_samples: int = 6000,
    output_dir: str = None
) -> dict:
    if output_dir is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        output_dir = os.path.join(base_dir, "models")
    
    os.makedirs(output_dir, exist_ok=True)
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
    os.makedirs(data_dir, exist_ok=True)

    print(f"[1/5] Generating {n_samples} synthetic marine environmental records...")
    df = generate_synthetic_dataset(n_samples=n_samples, random_seed=42)
    
    dataset_path = os.path.join(data_dir, "synthetic_marine_data.csv")
    df.to_csv(dataset_path, index=False)
    print(f"[DATA] Saved synthetic dataset ({len(df)} rows) to: {dataset_path}")

    X = df[FEATURE_NAMES]
    y = df[TARGET_NAME]

    print(f"[2/5] Class distribution in dataset:")
    print(y.value_counts(normalize=True).round(3).to_dict())

    # Train/Test Split (80/20 stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"[3/5] Training RandomForestClassifier (n_estimators=100, max_depth=12)...")
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )
    clf.fit(X_train, y_train)

    print(f"[4/5] Evaluating model on unseen test partition ({len(X_test)} records)...")
    y_pred = clf.predict(X_test)
    probs = clf.predict_proba(X_test)
    y_prob = probs[:, 1] if probs.shape[1] > 1 else probs[:, 0]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()

    feature_importances = {
        name: float(round(imp, 4)) for name, imp in zip(FEATURE_NAMES, clf.feature_importances_)
    }

    metrics_data = {
        "model_name": "RandomForestClassifier",
        "model_type": "Synthetic Marine Decision Model",
        "notice": "Trained exclusively on synthetic development data for software prototype evaluation. Not calibrated with physical in-situ marine sensors.",
        "dataset_size": n_samples,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "evaluation_metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": {
                "true_negative": cm[0][0],
                "false_positive": cm[0][1],
                "false_negative": cm[1][0],
                "true_positive": cm[1][1],
            },
        },
        "feature_importances": feature_importances,
        "features_used": FEATURE_NAMES,
    }

    # Save model and metrics
    model_path = os.path.join(output_dir, "random_forest_model.joblib")
    metrics_path = os.path.join(output_dir, "metrics.json")

    joblib.dump(clf, model_path)
    with open(metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)

    print(f"[5/5] Model saved to: {model_path}")
    print(f"[METRICS] Metrics saved to: {metrics_path}")
    print("=" * 60)
    print(f"  ACCURACY : {acc * 100:.2f}%")
    print(f"  PRECISION: {prec * 100:.2f}%")
    print(f"  RECALL   : {rec * 100:.2f}%")
    print(f"  F1 SCORE : {f1 * 100:.2f}%")
    print(f"  CONFUSION MATRIX [TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}]")
    print("=" * 60)
    print(classification_report(y_test, y_pred, target_names=["Standby (0)", "Illumination (1)"]))

    return metrics_data

if __name__ == "__main__":
    train_and_evaluate_model()
