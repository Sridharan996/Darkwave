import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassPanelProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'interactive' | 'active' | 'warning' | 'subtle';
  glow?: 'none' | 'cyan' | 'aqua' | 'amber' | 'coral';
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  badge?: React.ReactNode;
  noPadding?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  variant = 'default',
  glow = 'none',
  title,
  subtitle,
  headerAction,
  badge,
  noPadding = false,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'interactive':
        return 'marine-glass-interactive cursor-pointer';
      case 'active':
        return 'marine-glass-active';
      case 'warning':
        return 'bg-gradient-to-br from-rose-950/40 to-slate-950/80 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]';
      case 'subtle':
        return 'bg-slate-950/40 backdrop-blur-md border border-slate-800/50';
      case 'default':
      default:
        return 'marine-glass';
    }
  };

  const getGlowStyles = () => {
    switch (glow) {
      case 'cyan':
        return 'shadow-[0_0_25px_rgba(0,240,255,0.18)] border-cyan-500/30';
      case 'aqua':
        return 'shadow-[0_0_25px_rgba(0,245,184,0.18)] border-emerald-400/30';
      case 'amber':
        return 'shadow-[0_0_25px_rgba(245,158,11,0.2)] border-amber-500/30';
      case 'coral':
        return 'shadow-[0_0_25px_rgba(244,63,94,0.25)] border-rose-500/40';
      default:
        return '';
    }
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden backdrop-blur-xl transition-all duration-300 ${getVariantStyles()} ${getGlowStyles()} ${className}`}
    >
      {/* Subtle corner decorative telemetry brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/40 rounded-tl pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/40 rounded-tr pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/20 rounded-bl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/20 rounded-br pointer-events-none" />

      {(title || subtitle || headerAction || badge) && (
        <div className="px-4 py-3 border-b border-cyan-900/30 bg-slate-950/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {badge && <div>{badge}</div>}
            <div>
              {title && (
                <h3 className="font-display font-semibold text-xs tracking-wider uppercase text-cyan-200 truncate flex items-center gap-2">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[11px] font-sans text-slate-400 tracking-normal truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
      )}

      <div className={noPadding ? '' : 'p-4'}>
        {children}
      </div>
    </div>
  );
};
