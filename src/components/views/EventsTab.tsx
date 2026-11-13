import React from 'react';
import { EventTimelinePanel } from '../panels/EventTimelinePanel';
import { TimelineEvent } from '../../types/simulation';
import { ScrollText } from 'lucide-react';

interface EventsTabProps {
  events: TimelineEvent[];
}

export const EventsTab: React.FC<EventsTabProps> = ({ events }) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-cyan-400" />
          System Event & Audit Logs
        </h2>
        <p className="text-xs font-sans text-slate-400">
          Chronological autonomous lighting transitions and ML inference history
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl shadow-xl">
        <EventTimelinePanel events={events} />
      </div>
    </div>
  );
};
