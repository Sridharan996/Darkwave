import React from 'react';
import { GlassPanel } from '../common/GlassPanel';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import { TrendDataPoint } from '../../types/simulation';
import { LineChart as ChartIcon, Zap, Sparkles } from 'lucide-react';

interface EnvironmentalTrendsChartProps {
  data: TrendDataPoint[];
}

export const EnvironmentalTrendsChart: React.FC<EnvironmentalTrendsChartProps> = ({ data }) => {
  return (
    <GlassPanel
      title="Environmental Trends & LED Actuation Timeline"
      subtitle="Underwater Photopic Lux vs Atmospheric Cloud Cover (%) with Discrete LED Activation Transition"
      badge={
        <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
          <ChartIcon className="w-4 h-4" />
        </div>
      }
      headerAction={
        <div className="flex items-center gap-2 font-mono-data text-[10px]">
          <span className="flex items-center gap-1 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Lux
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Clouds %
          </span>
          <span className="flex items-center gap-1 text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> LED Active
          </span>
        </div>
      }
      className="h-full"
    >
      <div className="h-64 w-full mt-2 min-h-[250px] min-w-0">
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={data || []} margin={{ top: 15, right: 20, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="luxChartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="ledActiveRegion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5b8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00f5b8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 240, 255, 0.08)" />

            <XAxis
              dataKey="timeLabel"
              stroke="rgba(148, 163, 184, 0.6)"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
            />

            {/* Left Axis: Underwater Light (Lux) */}
            <YAxis
              yAxisId="lux"
              stroke="#00f0ff"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
              domain={[0, 800]}
            />

            {/* Right Axis: Cloud Cover (%) & LED status */}
            <YAxis
              yAxisId="percent"
              orientation="right"
              stroke="rgba(148, 163, 184, 0.6)"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
              domain={[0, 100]}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(3, 14, 30, 0.94)',
                borderColor: 'rgba(0, 240, 255, 0.35)',
                borderRadius: '12px',
                backdropFilter: 'blur(16px)',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono',
              }}
            />

            {/* Threshold line 200 Lux */}
            <ReferenceLine
              yAxisId="lux"
              y={200}
              stroke="#ff3366"
              strokeDasharray="4 4"
              label={{
                value: '200 Lux Threshold',
                fill: '#ff3366',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
                position: 'insideTopLeft',
              }}
            />

            {/* Event Markers */}
            <ReferenceLine
              yAxisId="lux"
              x="12:30"
              stroke="#ffaa00"
              strokeDasharray="3 3"
              label={{
                value: 'Clouds Increase',
                fill: '#ffaa00',
                fontSize: 9,
                fontFamily: 'JetBrains Mono',
                position: 'top',
              }}
            />

            <ReferenceLine
              yAxisId="lux"
              x="13:00"
              stroke="#a855f7"
              strokeDasharray="3 3"
              label={{
                value: 'Low-light Persists',
                fill: '#a855f7',
                fontSize: 9,
                fontFamily: 'JetBrains Mono',
                position: 'top',
              }}
            />

            {/* LED ON Activation Point Reference */}
            <ReferenceLine
              yAxisId="lux"
              x="13:05"
              stroke="#00f5b8"
              strokeWidth={2}
              label={{
                value: '▲ LED ON',
                fill: '#00f5b8',
                fontSize: 11,
                fontFamily: 'JetBrains Mono',
                fontWeight: 'bold',
                position: 'insideTopRight',
              }}
            />

            {/* Underwater Light Area */}
            <Area
              yAxisId="lux"
              type="monotone"
              dataKey="underwaterLight"
              name="Underwater Light (Lux)"
              stroke="#00f0ff"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#luxChartGradient)"
            />

            {/* Cloud Cover Line */}
            <Line
              yAxisId="percent"
              type="monotone"
              dataKey="cloudCover"
              name="Cloud Cover (%)"
              stroke="#94a3b8"
              strokeWidth={1.5}
              dot={false}
            />

            {/* LED Status Step Line */}
            <Line
              yAxisId="percent"
              type="stepAfter"
              dataKey={(d) => (d.ledStatus === 1 ? 78 : 0)}
              name="LED Output Intensity (%)"
              stroke="#00f5b8"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  );
};
