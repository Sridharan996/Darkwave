import React from 'react';
import { User } from 'lucide-react';
import { formatSimTime } from '../../hooks/useSimulationEngine';

interface TopHeaderProps {
  timeOfDay: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ timeOfDay }) => {
  return (
    <header className="w-full border-b border-slate-800/60 bg-[#020712]/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between gap-4 select-none z-20">
      
      {/* Title & Subtitle */}
      <div>
        <h1 className="font-display font-bold text-lg text-white tracking-wide">
          Live Simulation
        </h1>
        <p className="text-xs font-sans text-slate-400">
          Real-time simulation of marine environment and intelligent lighting system
        </p>
      </div>

      {/* Right side: Date, Time & Profile Avatar */}
      <div className="flex items-center gap-4">
        
        {/* Date & Simulated Time */}
        <div className="text-right">
          <div className="text-[11px] font-sans text-slate-400">
            Tue, 14 Jan 2025
          </div>
          <div className="text-base font-mono-data font-bold text-white tracking-wider">
            {formatSimTime(timeOfDay)}
          </div>
        </div>

        {/* Ocean Wave Icon */}
        <div className="flex flex-col gap-[2px] text-cyan-400 px-1">
          <svg className="w-5 h-4 stroke-current" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 5C5 3 9 3 12 5C15 7 19 7 22 5" strokeWidth="2" strokeLinecap="round" />
            <path d="M2 11C5 9 9 9 12 11C15 13 19 13 22 11" strokeWidth="2" strokeLinecap="round" />
            <path d="M2 17C5 15 9 15 12 17C15 19 19 19 22 17" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* User Profile Avatar Bubble */}
        <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 shadow-inner">
          <User className="w-4 h-4" />
        </div>

      </div>

    </header>
  );
};
