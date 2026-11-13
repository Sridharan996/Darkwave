import React from 'react';
import { GlassPanel } from '../common/GlassPanel';
import { TimelineEvent } from '../../types/simulation';
import { ScrollText, Activity } from 'lucide-react';

interface EventTimelinePanelProps {
  events: TimelineEvent[];
}

export const EventTimelinePanel: React.FC<EventTimelinePanelProps> = ({ events }) => {
  const getDotStyle = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'action':
        return 'bg-cyan-400 shadow-[0_0_8px_#00f0ff] ring-2 ring-cyan-500/40';
      case 'success':
        return 'bg-emerald-400 shadow-[0_0_8px_#10b981] ring-2 ring-emerald-500/40';
      case 'alert':
        return 'bg-rose-400 shadow-[0_0_8px_#f43f5e] ring-2 ring-rose-500/40';
      case 'warning':
        return 'bg-amber-400 shadow-[0_0_8px_#f59e0b] ring-2 ring-amber-500/40';
      case 'info':
      default:
        return 'bg-sky-400 shadow-[0_0_6px_#38bdf8]';
    }
  };

  return (
    <GlassPanel
      title="Event Timeline"
      subtitle="Autonomous Decision & State Transition Stream"
      badge={
        <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
          <ScrollText className="w-4 h-4" />
        </div>
      }
      className="h-full"
    >
      <div className="max-h-64 overflow-y-auto space-y-3 pr-2 select-none">
        {events.map((ev, idx) => (
          <div
            key={ev.id || idx}
            className={`flex items-start gap-3 p-2 rounded-xl border transition-all text-xs font-mono-data ${
              ev.highlight
                ? 'bg-gradient-to-r from-cyan-950/70 via-slate-950/80 to-slate-950/60 border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                : 'bg-slate-950/40 border-cyan-950/40 hover:border-cyan-500/20'
            }`}
          >
            {/* Timestamp Column */}
            <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${getDotStyle(ev.type)}`} />
              <span className="text-[11px] font-bold text-cyan-300 w-12">
                {ev.time}
              </span>
            </div>

            {/* Message Column */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-[11px] leading-relaxed break-words ${
                  ev.highlight
                    ? 'font-bold text-slate-100'
                    : 'text-slate-300'
                }`}
              >
                {ev.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
};
