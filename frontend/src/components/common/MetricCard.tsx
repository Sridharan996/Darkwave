import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  subValue?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  status?: 'normal' | 'active' | 'warning' | 'critical' | 'calibrated';
  accentColor?: 'cyan' | 'aqua' | 'blue' | 'amber' | 'coral' | 'purple';
  synthetic?: boolean;
  progressPercent?: number;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  subValue,
  trend,
  status = 'normal',
  accentColor = 'cyan',
  synthetic = true,
  progressPercent,
  className = '',
}) => {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'aqua':
        return {
          iconBg: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
          glow: 'group-hover:border-emerald-500/40',
          valueColor: 'text-emerald-300',
          barColor: 'bg-emerald-400',
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-950/60 text-blue-400 border-blue-500/30',
          glow: 'group-hover:border-blue-500/40',
          valueColor: 'text-blue-300',
          barColor: 'bg-blue-400',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-950/60 text-amber-400 border-amber-500/30',
          glow: 'group-hover:border-amber-500/40',
          valueColor: 'text-amber-300',
          barColor: 'bg-amber-400',
        };
      case 'coral':
        return {
          iconBg: 'bg-rose-950/60 text-rose-400 border-rose-500/30',
          glow: 'group-hover:border-rose-500/40',
          valueColor: 'text-rose-300',
          barColor: 'bg-rose-400',
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-950/60 text-purple-400 border-purple-500/30',
          glow: 'group-hover:border-purple-500/40',
          valueColor: 'text-purple-300',
          barColor: 'bg-purple-400',
        };
      case 'cyan':
      default:
        return {
          iconBg: 'bg-cyan-950/60 text-cyan-400 border-cyan-500/30',
          glow: 'group-hover:border-cyan-500/40',
          valueColor: 'text-cyan-300',
          barColor: 'bg-cyan-400',
        };
    }
  };

  const current = getAccentStyles();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`group relative marine-glass p-3.5 rounded-xl border border-cyan-900/30 transition-all duration-300 ${current.glow} ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-lg border backdrop-blur-md ${current.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium tracking-wider uppercase text-slate-300 truncate">
            {title}
          </span>
        </div>

        {synthetic && (
          <span className="text-[9px] font-mono-data px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20 text-cyan-400/80 uppercase">
            SIM
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-1.5 my-1">
        <span className={`text-2xl font-bold font-mono-data tracking-tight ${current.valueColor}`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono-data text-slate-400 uppercase">
            {unit}
          </span>
        )}
      </div>

      {/* Progress Bar (if provided) */}
      {typeof progressPercent === 'number' && (
        <div className="w-full bg-slate-900/80 rounded-full h-1.5 my-2 overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${current.barColor}`}
            style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
          />
        </div>
      )}

      {/* Footer Info / Trend */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
        {subValue ? (
          <span className="truncate">{subValue}</span>
        ) : (
          <span className="text-[10px] uppercase font-mono-data text-slate-500">Live Telemetry</span>
        )}

        {trend && (
          <span
            className={`font-mono-data font-medium flex items-center gap-0.5 ${
              trend.direction === 'up'
                ? 'text-emerald-400'
                : trend.direction === 'down'
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {trend.direction === 'up' && '▲'}
            {trend.direction === 'down' && '▼'}
            {trend.direction === 'neutral' && '●'}
            {trend.label}
          </span>
        )}
      </div>
    </motion.div>
  );
};
