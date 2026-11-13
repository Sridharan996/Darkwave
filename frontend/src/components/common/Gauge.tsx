import React from 'react';

interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  threshold?: number;
  unit?: string;
  title: string;
  subtitle?: string;
  size?: number;
  accentColor?: 'cyan' | 'aqua' | 'amber' | 'coral' | 'blue';
  className?: string;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  min = 0,
  max = 100,
  threshold,
  unit = '',
  title,
  subtitle,
  size = 180,
  accentColor = 'cyan',
  className = '',
}) => {
  const safeVal = typeof value === 'number' && !isNaN(value) ? value : min;
  const normalizedValue = Math.min(Math.max(safeVal, min), max);
  const percentage = max > min ? (normalizedValue - min) / (max - min) : 0;

  // Gauge angles (240 degree sweep from 150 deg to 390 deg)
  const startAngle = 150;
  const endAngle = 390;
  const totalAngle = endAngle - startAngle;
  const currentAngle = startAngle + (isNaN(percentage) ? 0 : percentage) * totalAngle;

  const radius = Math.max(10, (size / 2) - 18);
  const center = size / 2;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, start: number, end: number) => {
    const startPoint = polarToCartesian(x, y, r, end);
    const endPoint = polarToCartesian(x, y, r, start);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return [
      'M', startPoint.x, startPoint.y,
      'A', r, r, 0, largeArcFlag, 0, endPoint.x, endPoint.y
    ].join(' ');
  };

  const backgroundArc = describeArc(center, center, radius, startAngle, endAngle);
  const valueArc = percentage > 0.001 ? describeArc(center, center, radius, startAngle, currentAngle) : '';

  const getColorConfig = () => {
    switch (accentColor) {
      case 'aqua':
        return { stroke: '#00f5b8', glow: 'rgba(0, 245, 184, 0.4)', text: 'text-emerald-300' };
      case 'amber':
        return { stroke: '#ffaa00', glow: 'rgba(255, 170, 0, 0.4)', text: 'text-amber-300' };
      case 'coral':
        return { stroke: '#ff3366', glow: 'rgba(255, 51, 102, 0.4)', text: 'text-rose-300' };
      case 'blue':
        return { stroke: '#0088ff', glow: 'rgba(0, 136, 255, 0.4)', text: 'text-blue-300' };
      case 'cyan':
      default:
        return { stroke: '#00f0ff', glow: 'rgba(0, 240, 255, 0.4)', text: 'text-cyan-300' };
    }
  };

  const colors = getColorConfig();

  // Threshold marker calculation
  let thresholdAngle = 0;
  let thresholdPoint = { x: 0, y: 0 };
  if (threshold !== undefined && threshold >= min && threshold <= max) {
    const threshPct = (threshold - min) / (max - min);
    thresholdAngle = startAngle + threshPct * totalAngle;
    thresholdPoint = polarToCartesian(center, center, radius, thresholdAngle);
  }

  return (
    <div className={`flex flex-col items-center justify-center relative select-none ${className}`}>
      <div className="relative" style={{ width: size, height: size * 0.85 }}>
        <svg width={size} height={size} className="overflow-visible">
          <defs>
            <filter id={`gauge-glow-${accentColor}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={colors.stroke} floodOpacity="0.6" />
            </filter>
            <linearGradient id={`gauge-gradient-${accentColor}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0077FE" />
              <stop offset="100%" stopColor={colors.stroke} />
            </linearGradient>
          </defs>

          {/* Background Arc */}
          <path
            d={backgroundArc}
            fill="none"
            stroke="rgba(15, 35, 60, 0.8)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Decorative tick dots along arc */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((t, idx) => {
            const angle = startAngle + t * totalAngle;
            const pt = polarToCartesian(center, center, radius - 10, angle);
            return (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="1.5"
                fill="rgba(0, 240, 255, 0.3)"
              />
            );
          })}

          {/* Active Value Arc */}
          {percentage > 0 && (
            <path
              d={valueArc}
              fill="none"
              stroke={`url(#gauge-gradient-${accentColor})`}
              strokeWidth="8"
              strokeLinecap="round"
              filter={`url(#gauge-glow-${accentColor})`}
              className="transition-all duration-300 ease-out"
            />
          )}

          {/* Threshold Marker */}
          {threshold !== undefined && (
            <circle
              cx={thresholdPoint.x}
              cy={thresholdPoint.y}
              r="4.5"
              fill="#ff3366"
              stroke="#ffffff"
              strokeWidth="1.5"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Center Digital Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center top-2">
          <span className={`text-2xl font-bold font-mono-data tracking-tight ${colors.text}`}>
            {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
          </span>
          {unit && (
            <span className="text-[10px] uppercase font-mono-data text-slate-400 font-semibold mt-0.5">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Label and Subtitle */}
      <div className="text-center -mt-2">
        <h4 className="text-xs font-display font-semibold text-slate-200 tracking-wider uppercase">
          {title}
        </h4>
        {subtitle && (
          <p className="text-[10px] text-slate-400 font-sans mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
