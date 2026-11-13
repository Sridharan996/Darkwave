import React from 'react';
import {
  Waves,
  Radio,
  BatteryCharging,
  Cpu,
  ShieldCheck,
  Sliders,
  Play,
  Pause,
  FastForward,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { SystemMode, LightingState } from '../../types/simulation';

interface TopNavigationProps {
  systemMode: SystemMode;
  lightingState: LightingState;
  batteryPercent: number;
  loraRssi: number;
  simSpeedMultiplier: number;
  isPaused: boolean;
  timeOfDay: number;
  onTogglePause: () => void;
  onSetSpeed: (speed: number) => void;
  onSetSystemMode: (mode: SystemMode) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  systemMode,
  lightingState,
  batteryPercent,
  loraRssi,
  simSpeedMultiplier,
  isPaused,
  timeOfDay,
  onTogglePause,
  onSetSpeed,
  onSetSystemMode,
}) => {
  const formatTime = (hourFloat: number) => {
    const hours = Math.floor(hourFloat);
    const mins = Math.floor((hourFloat % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-900/40 bg-slate-950/80 backdrop-blur-xl px-4 py-2.5">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <Waves className="w-5 h-5 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-lg tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400">
                DARKWAVE
              </h1>
              <span className="text-[9px] font-mono-data px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 tracking-wider font-semibold uppercase">
                v1.0-RC
              </span>
            </div>
            <p className="text-[11px] font-sans text-cyan-300/70 font-medium tracking-wide">
              Autonomous Marine Supplemental Lighting System
            </p>
          </div>

          {/* Prototype simulated disclaimer badge */}
          <div className="hidden lg:flex items-center ml-2 pl-3 border-l border-cyan-900/50">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono-data uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                SOFTWARE PROTOTYPE
              </span>
              <span className="text-[10px] text-slate-400 font-mono-data">
                Simulated Environment & Synthetic Sensors
              </span>
            </div>
          </div>
        </div>

        {/* Center: Simulation Controls & Telemetry Time */}
        <div className="hidden md:flex items-center gap-3 bg-slate-900/70 border border-cyan-900/40 rounded-xl px-3 py-1.5 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs font-mono-data text-cyan-300 border-r border-cyan-900/40 pr-3">
            <span className="text-slate-400 text-[10px] uppercase">Solar Time:</span>
            <span className="font-bold text-cyan-200 text-sm">{formatTime(timeOfDay)}</span>
          </div>

          {/* Play/Pause */}
          <button
            onClick={onTogglePause}
            className={`p-1.5 rounded-lg border transition-all ${
              isPaused
                ? 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/70'
                : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/70'
            }`}
            title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Sim Speed Selector */}
          <div className="flex items-center gap-1">
            {[1, 5, 15, 60].map((spd) => (
              <button
                key={spd}
                onClick={() => onSetSpeed(spd)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-semibold transition-all ${
                  simSpeedMultiplier === spd
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Right Telemetry Health & Mode Badges */}
        <div className="flex items-center gap-2.5">
          {/* LoRa Telemetry */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-cyan-900/30 text-slate-300 text-xs font-mono-data">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">{loraRssi} dBm</span>
          </div>

          {/* Solar/Battery Telemetry */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-cyan-900/30 text-slate-300 text-xs font-mono-data">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold text-emerald-300">{batteryPercent}%</span>
          </div>

          {/* System Mode Pill */}
          <div className="flex items-center">
            <select
              value={systemMode}
              onChange={(e) => onSetSystemMode(e.target.value as SystemMode)}
              className="bg-slate-900/90 text-cyan-200 font-mono-data text-xs border border-cyan-500/30 rounded-lg px-2.5 py-1 outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="AUTONOMOUS">MODE: AUTONOMOUS</option>
              <option value="MANUAL_OVERRIDE">MODE: MANUAL OVERRIDE</option>
              <option value="DIAGNOSTIC">MODE: DIAGNOSTIC</option>
              <option value="STANDBY">MODE: STANDBY</option>
            </select>
          </div>

          {/* LED State Indicator */}
          <StatusBadge
            status={
              lightingState === 'ACTIVE_SUPPLEMENTAL'
                ? 'active'
                : lightingState === 'PENDING_VERIFICATION'
                ? 'pending'
                : 'inactive'
            }
            label={
              lightingState === 'ACTIVE_SUPPLEMENTAL'
                ? 'LED ACTIVE'
                : lightingState === 'PENDING_VERIFICATION'
                ? 'VERIFYING'
                : 'LED STANDBY'
            }
          />
        </div>

      </div>
    </header>
  );
};
