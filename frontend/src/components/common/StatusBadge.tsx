import React from 'react';

export type BadgeStatus = 'active' | 'inactive' | 'pending' | 'warning' | 'error' | 'info' | 'synthetic';

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  pulse = true,
  size = 'md',
  icon,
  className = '',
}) => {
  const getStyles = () => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-400',
          pulseColor: 'bg-emerald-400',
        };
      case 'pending':
        return {
          bg: 'bg-cyan-950/60 border-cyan-400/40 text-cyan-300',
          dot: 'bg-cyan-400',
          pulseColor: 'bg-cyan-400',
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400',
          pulseColor: 'bg-amber-400',
        };
      case 'error':
        return {
          bg: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
          dot: 'bg-rose-400',
          pulseColor: 'bg-rose-400',
        };
      case 'synthetic':
        return {
          bg: 'bg-purple-950/50 border-purple-500/40 text-purple-300',
          dot: 'bg-purple-400',
          pulseColor: 'bg-purple-400',
        };
      case 'info':
        return {
          bg: 'bg-sky-950/50 border-sky-500/40 text-sky-300',
          dot: 'bg-sky-400',
          pulseColor: 'bg-sky-400',
        };
      case 'inactive':
      default:
        return {
          bg: 'bg-slate-900/60 border-slate-700/50 text-slate-400',
          dot: 'bg-slate-500',
          pulseColor: 'bg-transparent',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-[10px] px-2 py-0.5 gap-1.5 font-medium';
      case 'lg':
        return 'text-xs px-3 py-1.5 gap-2.5 font-semibold';
      case 'md':
      default:
        return 'text-[11px] px-2.5 py-1 gap-2 font-medium';
    }
  };

  const current = getStyles();

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md font-mono-data tracking-wide uppercase ${current.bg} ${getSizeStyles()} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && status !== 'inactive' && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.pulseColor}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`} />
      </span>
      {icon && <span className="text-current opacity-80">{icon}</span>}
      {label && <span>{label}</span>}
    </span>
  );
};
