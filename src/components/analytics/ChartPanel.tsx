import React from 'react';
import { GlassPanel } from '../common/GlassPanel';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { HistoricalDataPoint } from '../../types/simulation';
import { Activity, BarChart3, Waves } from 'lucide-react';

interface ChartPanelProps {
  history: HistoricalDataPoint[];
  thresholdLux: number;
  className?: string;
}

export const ChartPanel: React.FC<ChartPanelProps> = ({
  history,
  thresholdLux,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      
      {/* Chart 1: Underwater Lux vs Surface Irradiance */}
      <GlassPanel
        title="Photometric Penetration & Threshold Tracking"
        subtitle="Underwater Lux (3.5m depth) vs Surface Solar Irradiance vs Trigger Level"
        badge={
          <div className="p-1 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
          </div>
        }
      >
        <div className="h-60 w-full mt-2">
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="luxGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="irradianceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffaa00" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ffaa00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 240, 255, 0.08)" />
                <XAxis
                  dataKey="timeLabel"
                  stroke="rgba(148, 163, 184, 0.6)"
                  tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  stroke="rgba(148, 163, 184, 0.6)"
                  tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(3, 14, 30, 0.92)',
                    borderColor: 'rgba(0, 240, 255, 0.3)',
                    borderRadius: '10px',
                    backdropFilter: 'blur(12px)',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <ReferenceLine
                  y={thresholdLux}
                  stroke="#ff3366"
                  strokeDasharray="4 4"
                  label={{
                    value: `Threshold (${thresholdLux} Lux)`,
                    fill: '#ff3366',
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono',
                    position: 'insideTopRight',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="underwaterLux"
                  name="Underwater Lux"
                  stroke="#00f0ff"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#luxGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="solarIrradiance"
                  name="Solar Irradiance (W/m²)"
                  stroke="#ffaa00"
                  strokeWidth={1.5}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono-data text-slate-500">
              Gathering synthetic telemetry stream...
            </div>
          )}
        </div>
      </GlassPanel>

      {/* Chart 2: LED Activation & Low-Light Persistence Accumulation */}
      <GlassPanel
        title="Low-Light Persistence & LED Power Response"
        subtitle="Accumulated minutes in low-light state vs Virtual LED power consumption (Watts)"
        badge={
          <div className="p-1 rounded bg-cyan-950/80 border border-cyan-500/30 text-emerald-400">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
        }
      >
        <div className="h-60 w-full mt-2">
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ledGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5b8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f5b8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 240, 255, 0.08)" />
                <XAxis
                  dataKey="timeLabel"
                  stroke="rgba(148, 163, 184, 0.6)"
                  tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  stroke="rgba(148, 163, 184, 0.6)"
                  tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(3, 14, 30, 0.92)',
                    borderColor: 'rgba(0, 245, 184, 0.3)',
                    borderRadius: '10px',
                    backdropFilter: 'blur(12px)',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Line
                  type="stepAfter"
                  dataKey="ledPowerWatts"
                  name="LED Power (Watts)"
                  stroke="#00f5b8"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="persistenceMinutes"
                  name="Low-Light Duration (Mins)"
                  stroke="#a855f7"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono-data text-slate-500">
              Gathering synthetic telemetry stream...
            </div>
          )}
        </div>
      </GlassPanel>

    </div>
  );
};
