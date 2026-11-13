import React from 'react';
import { GlassPanel } from '../common/GlassPanel';
import { MetricCard } from '../common/MetricCard';
import { EnvironmentalConditions, BuoyHardwareTelemetry } from '../../types/simulation';
import {
  Sun,
  Eye,
  Droplets,
  Thermometer,
  Compass,
  Radio,
  BatteryCharging,
  Cpu,
  Zap,
  Activity,
} from 'lucide-react';

interface SensorMatrixTabProps {
  environment: EnvironmentalConditions;
  telemetry: BuoyHardwareTelemetry;
}

export const SensorMatrixTab: React.FC<SensorMatrixTabProps> = ({ environment, telemetry }) => {
  return (
    <div className="space-y-4">
      
      {/* Synthetic Sensor Disclaimer Banner */}
      <GlassPanel
        title="Simulated Sensor Array Matrix"
        subtitle="All physical sensor streams are generated via mathematical environmental models for software evaluation"
        badge={
          <div className="p-1 rounded bg-cyan-950/80 border border-cyan-500/30 text-purple-400">
            <Activity className="w-3.5 h-3.5" />
          </div>
        }
      >
        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs font-mono-data text-purple-300 flex items-center justify-between">
          <span>
            NOTICE: No physical hardware sensors attached. Synthetic sensor simulator running Beer-Lambert optical extinction calculations.
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-900/50 border border-purple-400 font-bold uppercase text-[10px]">
            SYNTHETIC TELEMETRY
          </span>
        </div>
      </GlassPanel>

      {/* Environmental Sensors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <MetricCard
          title="Underwater Lux (3.5m)"
          value={environment.underwaterLightLevel}
          unit="Lux"
          icon={Eye}
          accentColor="cyan"
          subValue="Submerged Photodiode Sensor"
          progressPercent={(environment.underwaterLightLevel / 1000) * 100}
        />
        <MetricCard
          title="Surface Solar Irradiance"
          value={environment.solarIrradiance}
          unit="W/m²"
          icon={Sun}
          accentColor="amber"
          subValue="Pyranometer Sensor"
          progressPercent={(environment.solarIrradiance / 1200) * 100}
        />
        <MetricCard
          title="Water Column Turbidity"
          value={environment.turbidity}
          unit="NTU"
          icon={Droplets}
          accentColor="blue"
          subValue="Optical Backscatter Meter"
          progressPercent={environment.turbidity}
        />
        <MetricCard
          title="Water Temperature"
          value={environment.waterTemperature}
          unit="°C"
          icon={Thermometer}
          accentColor="aqua"
          subValue="Sub-surface PT100 Probe"
          progressPercent={((environment.waterTemperature - 10) / 25) * 100}
        />
      </div>

      {/* Buoy Hardware Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <MetricCard
          title="Solar Panel Output"
          value={telemetry.solarPanelOutputWatts}
          unit="Watts"
          icon={Sun}
          accentColor="amber"
          subValue="Monocrystalline 150W Deck"
          progressPercent={(telemetry.solarPanelOutputWatts / 150) * 100}
        />
        <MetricCard
          title="Battery Pack SOC"
          value={telemetry.batteryChargePercent}
          unit="%"
          icon={BatteryCharging}
          accentColor="aqua"
          subValue={`LiFePO4 12V (${telemetry.batteryVoltage}V)`}
          progressPercent={telemetry.batteryChargePercent}
        />
        <MetricCard
          title="ESP32 Core Temp"
          value={telemetry.esp32CoreTemp}
          unit="°C"
          icon={Cpu}
          accentColor="cyan"
          subValue="Internal Thermal Sensor"
          progressPercent={(telemetry.esp32CoreTemp / 80) * 100}
        />
        <MetricCard
          title="LoRa Link RSSI"
          value={telemetry.loraRssi}
          unit="dBm"
          icon={Radio}
          accentColor="blue"
          subValue={`SNR: +${telemetry.loraSnr} dB (Good)`}
          progressPercent={((telemetry.loraRssi + 120) / 80) * 100}
        />
      </div>

    </div>
  );
};
