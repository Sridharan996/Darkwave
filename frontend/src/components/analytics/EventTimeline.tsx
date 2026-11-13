import React, { useState } from 'react';
import { GlassPanel } from '../common/GlassPanel';
import { TelemetryLogEntry } from '../../types/simulation';
import { ScrollText, Filter, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface EventTimelineProps {
  logs: TelemetryLogEntry[];
  className?: string;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ logs, className = '' }) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredLogs = filterCategory === 'ALL'
    ? logs
    : logs.filter((l) => l.category === filterCategory);

  const getLevelIcon = (level: TelemetryLogEntry['level']) => {
    switch (level) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'ALERT':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'INFO':
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const getLevelBadgeClass = (level: TelemetryLogEntry['level']) => {
    switch (level) {
      case 'SUCCESS':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';
      case 'ALERT':
        return 'text-rose-400 bg-rose-950/60 border-rose-500/30';
      case 'WARNING':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/30';
      case 'INFO':
      default:
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30';
    }
  };

  return (
    <GlassPanel
      title="Event Stream & Decision Timeline"
      subtitle="Real-time audit log of ML inferences, threshold transitions, and ESP32 hardware telemetry"
      badge={
        <div className="p-1 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
          <ScrollText className="w-3.5 h-3.5" />
        </div>
      }
      headerAction={
        <div className="flex items-center gap-1">
          {['ALL', 'DECISION', 'SENSOR', 'HARDWARE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-[9px] font-mono-data px-2 py-0.5 rounded transition-all ${
                filterCategory === cat
                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      }
      className={className}
    >
      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/40 border border-cyan-950/40 hover:border-cyan-500/20 transition-all text-xs font-mono-data"
          >
            <div className="mt-0.5 flex-shrink-0">{getLevelIcon(log.level)}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${getLevelBadgeClass(
                      log.level
                    )}`}
                  >
                    {log.category}
                  </span>
                  <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                </div>
              </div>

              <p className="text-slate-200 text-[11px] leading-relaxed break-words">
                {log.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
};
