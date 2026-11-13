import React from 'react';
import {
  LayoutDashboard,
  Waves,
  BrainCircuit,
  LineChart,
  ScrollText,
  Zap,
  Settings as SettingsIcon,
  Database,
} from 'lucide-react';
import { SimulationStateMode, DemoPhase } from '../../types/simulation';

export type NavTab = 'dashboard' | 'power' | 'simulation' | 'analytics' | 'ml' | 'big-data' | 'events' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentSimulationState: SimulationStateMode;
  onSetSimulationState: (state: SimulationStateMode) => void;
  simSpeed: number;
  onSetSimSpeed: (spd: number) => void;
  isDemoRunning: boolean;
  demoPhase: DemoPhase;
  onStartDemo: () => void;
  onStopDemo: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'power' as NavTab, label: 'Power & Battery', icon: Zap },
    { id: 'simulation' as NavTab, label: 'Simulation', icon: Waves },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: LineChart },
    { id: 'ml' as NavTab, label: 'ML Model', icon: BrainCircuit },
    { id: 'big-data' as NavTab, label: 'BIG DATA ANALYTICS', icon: Database },
    { id: 'events' as NavTab, label: 'Event Log', icon: ScrollText },
    { id: 'settings' as NavTab, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-56 xl:w-60 flex-shrink-0 flex flex-col justify-between border-r border-slate-800/60 bg-[#030914]/95 backdrop-blur-2xl p-4 select-none z-30">
      
      {/* Brand & Main Nav */}
      <div className="space-y-6">
        
        {/* Brand Logo & Subtitle */}
        <div className="px-2 pt-1">
          <div className="flex items-center gap-2.5 mb-2">
            {/* Minimalist 3-wave brand icon */}
            <div className="flex flex-col gap-[3px] text-cyan-400">
              <svg className="w-6 h-5 stroke-current" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4C5 2 9 2 12 4C15 6 19 6 22 4" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M2 10C5 8 9 8 12 10C15 12 19 12 22 10" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M2 16C5 14 9 14 12 16C15 18 19 18 22 16" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>

            <h1 className="font-display font-extrabold text-base tracking-[0.2em] text-white">
              DARKWAVE
            </h1>
          </div>

          <p className="text-[10.5px] font-sans text-slate-400 leading-tight">
            Autonomous Marine<br />Supplemental Lighting System
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-display font-medium tracking-wide transition-all ${
                  isActive
                    ? 'bg-blue-600/25 border border-blue-500/40 text-white shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

      </div>

      {/* Bottom Badge: Software Prototype / Simulated Environment */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-display font-semibold text-slate-200">
              Software Prototype
            </span>
            <span className="text-[9px] font-mono-data text-slate-400">
              Simulated Environment
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
};
