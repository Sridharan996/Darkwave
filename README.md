# AQUALUME // Intelligent Marine Lighting System
**Autonomous Marine Supplemental Lighting System — Software Prototype & Simulation Suite**

> [!IMPORTANT]
> **SOFTWARE-ONLY PROTOTYPE NOTICE:**  
> This system currently operates with clearly labeled **SYNTHETIC / SIMULATED** environmental and sensor telemetry. Physical hardware is simulated to validate the ML decision engine, persistence verification logic, and photometric responses.

---

## 🌊 System Architecture Overview

```
[ Atmospheric & Solar Model ] ──► [ Beer-Lambert Underwater Extinction ]
                                             │
                                             ▼
[ Synthetic Sensor Stream ] ─────► [ Low-Light Persistence Engine ]
(Lux, Irradiance, Turbidity)                │
                                             ▼
                                   [ ML Decision Model ]
                                   (Random Forest Feature Vector)
                                             │
                                             ▼
                                   [ LED Actuation & HUD Visualization ]
```

### Core Autonomous Flow:
1. **Monitor Environmental Conditions**: Continuously track solar irradiance, cloud cover, turbidity, and diurnal solar elevation.
2. **Detect Low Underwater Light**: Compare sub-surface Lux (3.5m depth) against configured threshold (e.g., 250 Lux).
3. **Low-Light Persistence Timer**: Initiate anti-chatter duration timer (e.g., 3.0 minutes).
4. **Feature Vector Ingestion**: Ingest `cloud_cover_percent`, `solar_irradiance`, `underwater_light_level`, `turbidity`, `time_of_day`, and `low_light_duration_minutes`.
5. **ML Prediction**: Determine if supplemental illumination is required (`illumination_required` = 0 or 1).
6. **Virtual LED Actuation**: If ML predicts required AND persistence threshold is satisfied, illuminate underwater LED array (65W volumetric cone).
7. **Natural Light Restoration**: When sunlight returns above threshold, extinguish LED and reset persistence timer.

---

## 📁 Repository Structure

```
├── frontend/                     # React + Vite + TypeScript + Tailwind CSS UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # GlassPanel, MetricCard, StatusBadge, Gauge
│   │   │   ├── navigation/       # TopNavigation, Sidebar
│   │   │   ├── visualization/    # MarineVisualization (2.5D Buoy + LED cone)
│   │   │   ├── controls/         # SimulationControl (Weather sliders & presets)
│   │   │   ├── analytics/        # ChartPanel (Recharts), EventTimeline
│   │   │   └── views/            # DecisionEngineTab, SensorMatrixTab
│   │   ├── hooks/                # useSimulationEngine.ts (Simulation state & math)
│   │   ├── types/                # simulation.ts (Telemetry interfaces)
│   │   ├── index.css             # Marine glassmorphism, glow tokens, typography
│   │   └── App.tsx               # Main application layout
│   ├── package.json
│   └── vite.config.ts
│
└── backend/                      # Python + FastAPI Service (Ready for ML Model)
    ├── app/
    │   ├── core/                 # Configuration & default parameters
    │   ├── simulation/           # Environment, synthetic sensors, LED controller
    │   └── main.py               # FastAPI telemetry stream
    └── requirements.txt
```

---

## 🚀 Quickstart

## Apache Spark and Scala analytics

The `spark-scala-service` uses Spark 4.0.1 in local mode with Scala 2.13.16 and sbt 2.0.1. It processes synthetic readings with RDD, DataFrame, Spark SQL, Structured Streaming, and Parquet persistence. No physical hardware or real marine sensors are connected.

```powershell
cd 'C:\Users\mansu\Downloads\AM Project\AM Project'
$env:HADOOP_HOME = 'C:\Users\mansu\Downloads\hadoop-3.4.1-native\hadoop-3.4.1'
.\start-aqualume.ps1
```

The startup script verifies Java and the Hadoop 3.4.1 native files, starts Spark and FastAPI, and checks both health endpoints. For separate terminals:

```powershell
cd 'C:\Users\mansu\Downloads\AM Project\AM Project\spark-scala-service'
$env:HADOOP_HOME = 'C:\Users\mansu\Downloads\hadoop-3.4.1-native\hadoop-3.4.1'
sbt run

cd 'C:\Users\mansu\Downloads\AM Project\AM Project\backend'
uvicorn app.main:app --reload --port 8000
```

Spark health is available at `http://localhost:8000/api/v1/spark/health`; the frontend Big Data Analytics tab uses the same FastAPI gateway.

### Windows Hadoop native runtime

Spark 4.0.1 resolves Hadoop 3.4.1. Set `HADOOP_HOME` to the verified native package containing `bin\winutils.exe`, `bin\hadoop.dll`, and `bin\hdfs.dll`. The package archive SHA-256 is `AA8098A433E6D63B865074468AA2DA1AA9329EF33C9E9AF799037F382CE50B82`; the binaries are unsigned and their authenticity is not independently established. Do not substitute another Hadoop version, disable Defender, use WSL2, or run Docker.

### Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Dashboard will be available at `http://localhost:5173/`.

### Backend API
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API docs available at `http://localhost:8000/docs`.
