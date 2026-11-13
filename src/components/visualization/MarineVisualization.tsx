import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  EnvironmentalConditions,
  BuoyHardwareTelemetry,
  DecisionEngineState,
} from '../../types/simulation';
import {
  Sun,
  Cloud,
  Waves,
  Lightbulb,
  Radio,
  Zap,
  Gauge as GaugeIcon,
  ShieldAlert,
} from 'lucide-react';

interface MarineVisualizationProps {
  environment: EnvironmentalConditions;
  telemetry: BuoyHardwareTelemetry;
  decisionState: DecisionEngineState;
  className?: string;
}

export const MarineVisualization: React.FC<MarineVisualizationProps> = ({
  environment,
  telemetry,
  decisionState,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isLedActive = decisionState.lightingState === 'ACTIVE_SUPPLEMENTAL';
  const isPending = decisionState.lightingState === 'PENDING_VERIFICATION';

  // Floating marine particles animation via Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    resize();
    window.addEventListener('resize', resize);

    // Seed particles
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: (canvas.height * 0.35) + Math.random() * (canvas.height * 0.65),
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4 + 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const waterTopY = canvas.height * 0.32;

      // Draw underwater volumetric cone if LED is on
      if (isLedActive) {
        const buoyX = canvas.width * 0.5;
        const ledY = canvas.height * 0.68;

        const coneGradient = ctx.createRadialGradient(
          buoyX,
          ledY,
          5,
          buoyX,
          ledY + 80,
          canvas.height * 0.55
        );
        coneGradient.addColorStop(0, 'rgba(0, 245, 184, 0.45)');
        coneGradient.addColorStop(0.3, 'rgba(0, 240, 255, 0.25)');
        coneGradient.addColorStop(0.7, 'rgba(0, 150, 255, 0.08)');
        coneGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(buoyX - 18, ledY);
        ctx.lineTo(buoyX + 18, ledY);
        ctx.lineTo(buoyX + 220, canvas.height);
        ctx.lineTo(buoyX - 220, canvas.height);
        ctx.closePath();
        ctx.fillStyle = coneGradient;
        ctx.fill();
        ctx.restore();
      }

      // Render drifting particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.y < waterTopY) p.y = canvas.height;
        if (p.y > canvas.height) p.y = waterTopY;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        // If particle is illuminated by LED cone
        const distFromCenter = Math.abs(p.x - canvas.width * 0.5);
        const inLightCone = isLedActive && distFromCenter < (p.y - canvas.height * 0.6) * 1.5;

        if (inLightCone) {
          ctx.fillStyle = `rgba(0, 255, 220, ${Math.min(1, p.opacity + 0.4)})`;
        } else {
          ctx.fillStyle = `rgba(0, 200, 255, ${p.opacity * 0.4})`;
        }
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLedActive]);

  // Compute sky and water gradient according to timeOfDay and turbidity
  const getSkyGradient = () => {
    const hour = environment.timeOfDay;
    if (hour >= 6 && hour < 10) {
      return 'from-amber-950/40 via-sky-950/70 to-slate-950'; // Morning sunrise
    } else if (hour >= 10 && hour < 17) {
      return 'from-sky-900/40 via-cyan-950/60 to-slate-950'; // Noon daylight
    } else if (hour >= 17 && hour < 20) {
      return 'from-rose-950/50 via-purple-950/70 to-slate-950'; // Sunset
    } else {
      return 'from-indigo-950/60 via-slate-950 to-[#02050e]'; // Night
    }
  };

  const waterTurbidityOpacity = Math.min(0.85, 0.2 + (environment.turbidity / 100) * 0.65);

  return (
    <div
      className={`relative w-full h-[460px] rounded-2xl overflow-hidden border border-cyan-900/40 bg-gradient-to-b ${getSkyGradient()} shadow-2xl flex flex-col justify-between ${className}`}
    >
      {/* Background Ocean Grid & Atmosphere Noise */}
      <div className="absolute inset-0 ocean-grid pointer-events-none opacity-40" />

      {/* Particle & Lighting Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Top Atmosphere / Sky Layer */}
      <div className="relative z-20 h-[32%] w-full flex items-start justify-between p-4">
        {/* Sun & Cloud Representation */}
        <div className="flex items-center gap-4">
          <motion.div
            animate={{
              y: [0, -4, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex items-center justify-center"
          >
            <div
              className={`p-3 rounded-full border backdrop-blur-md ${
                environment.timeOfDay >= 6 && environment.timeOfDay <= 18
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.35)]'
                  : 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
              }`}
            >
              <Sun className="w-6 h-6" />
            </div>

            {/* Cloud Overlay */}
            {environment.cloudCoverPercent > 20 && (
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-1 -right-4 p-2 rounded-xl bg-slate-900/80 border border-slate-700/50 text-slate-300 backdrop-blur-md shadow-lg"
              >
                <Cloud className="w-5 h-5 text-slate-300" />
              </motion.div>
            )}
          </motion.div>

          <div className="font-mono-data">
            <div className="text-[11px] text-cyan-300 font-semibold tracking-wider uppercase">
              Solar Irradiance
            </div>
            <div className="text-xl font-bold text-slate-100 flex items-baseline gap-1">
              {environment.solarIrradiance}
              <span className="text-xs text-slate-400 font-normal">W/m²</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Cloud Cover: <span className="text-amber-400 font-semibold">{environment.cloudCoverPercent}%</span>
            </div>
          </div>
        </div>

        {/* Top Right: Status HUD */}
        <div className="flex flex-col items-end gap-1 font-mono-data">
          <div className="flex items-center gap-2 bg-slate-950/70 border border-cyan-900/50 rounded-lg px-2.5 py-1 text-[11px] text-slate-300">
            <span className="text-slate-500">SYSTEM STATE:</span>
            <span
              className={`font-bold ${
                isLedActive
                  ? 'text-emerald-400 text-glow-aqua'
                  : isPending
                  ? 'text-cyan-400 text-glow-cyan'
                  : 'text-slate-400'
              }`}
            >
              {decisionState.lightingState}
            </span>
          </div>

          <div className="text-[10px] text-slate-400 bg-slate-950/50 px-2 py-0.5 rounded border border-slate-800">
            Depth Target: <span className="text-cyan-300 font-semibold">3.5m</span> | Turbidity:{' '}
            <span className="text-cyan-300 font-semibold">{environment.turbidity} NTU</span>
          </div>
        </div>
      </div>

      {/* Water Surface Line & Animated Waves */}
      <div className="relative z-20 w-full h-8 flex items-center justify-center">
        {/* Surface Wave SVG Ribbon */}
        <div className="absolute inset-x-0 -top-3 h-6 overflow-hidden pointer-events-none opacity-80">
          <svg className="w-full h-full text-cyan-400/30" preserveAspectRatio="none" viewBox="0 0 1200 120">
            <path
              d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z"
              fill="rgba(0, 240, 255, 0.15)"
            />
          </svg>
        </div>

        {/* Buoy Surface Unit */}
        <motion.div
          animate={{
            y: [0, -5, 2, 0],
            rotate: [-1.2, 1.5, -0.8, -1.2],
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-30 flex flex-col items-center"
        >
          {/* Antenna & LoRa Flash */}
          <div className="relative w-1 h-7 bg-cyan-400/80 shadow-[0_0_8px_rgba(0,240,255,0.8)]">
            <span className="absolute -top-1.5 -left-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping opacity-75" />
            <span className="absolute -top-1 -left-0.5 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#00f0ff]" />
          </div>

          {/* Buoy Hull & Solar Deck */}
          <div className="relative w-24 h-7 rounded-b-xl bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-around px-2">
            {/* Solar Mini Panels */}
            <div className="w-8 h-2.5 bg-blue-900/80 border border-cyan-500/50 rounded-sm" title="Solar Array" />
            {/* ESP32 Core Indicator */}
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" title="ESP32 Operational" />
            <div className="w-8 h-2.5 bg-blue-900/80 border border-cyan-500/50 rounded-sm" title="Solar Array" />
          </div>

          {/* Tether Cable Descending */}
          <div className="w-1 h-36 bg-gradient-to-b from-cyan-400/50 via-slate-600 to-cyan-500/60 shadow-[0_0_4px_rgba(0,240,255,0.2)]" />
        </motion.div>
      </div>

      {/* Underwater Ocean Water Body */}
      <div
        className="relative z-15 h-[62%] w-full flex flex-col justify-between p-4 overflow-hidden"
        style={{
          background: `linear-gradient(180deg, rgba(6, 26, 52, 0.75) 0%, rgba(3, 14, 30, ${waterTurbidityOpacity}) 100%)`,
        }}
      >
        {/* Depth Markers Overlay on left */}
        <div className="absolute left-3 top-4 bottom-4 flex flex-col justify-between text-[9px] font-mono-data text-cyan-400/50 pointer-events-none select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-px bg-cyan-400/40" /> 0.0m (Surface)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-px bg-cyan-400/40" /> 1.5m
          </div>
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <span className="w-3 h-0.5 bg-cyan-400" /> 3.5m (LED Module Depth)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-px bg-cyan-400/40" /> 5.0m (Benthic Floor)
          </div>
        </div>

        {/* Submerged Underwater LED Module & Sensor Cluster */}
        <div className="relative flex flex-col items-center justify-center my-auto">
          <motion.div
            animate={{
              y: [0, -2, 1, 0],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-30 flex flex-col items-center"
          >
            {/* LED Housing Pod */}
            <div
              className={`relative px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-500 flex items-center gap-3 ${
                isLedActive
                  ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_35px_rgba(0,245,184,0.6)]'
                  : isPending
                  ? 'bg-amber-950/80 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-950/80 border-slate-700/60'
              }`}
            >
              <Lightbulb
                className={`w-6 h-6 transition-all ${
                  isLedActive
                    ? 'text-emerald-300 animate-pulse'
                    : isPending
                    ? 'text-amber-400'
                    : 'text-slate-500'
                }`}
              />

              <div className="font-mono-data">
                <div className="text-[10px] text-slate-400 uppercase">Underwater LED Array</div>
                <div
                  className={`text-xs font-bold ${
                    isLedActive
                      ? 'text-emerald-300'
                      : isPending
                      ? 'text-amber-300'
                      : 'text-slate-400'
                  }`}
                >
                  {isLedActive
                    ? `ACTIVE (65.0W / ${telemetry.ledOperatingCurrentAmps}A)`
                    : isPending
                    ? `VERIFYING PERSISTENCE (${decisionState.persistenceProgressPercent}%)`
                    : 'STANDBY (0.0W)'}
                </div>
              </div>
            </div>

            {/* Sensor Pod Bracket */}
            <div className="flex items-center gap-2 mt-2 bg-slate-950/80 px-3 py-1 rounded-lg border border-cyan-900/50 text-[10px] font-mono-data text-slate-300">
              <span className="text-slate-500">LUX SENSOR:</span>
              <span
                className={`font-bold ${
                  decisionState.isLowLightDetected ? 'text-amber-400' : 'text-cyan-300'
                }`}
              >
                {environment.underwaterLightLevel} Lux
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">THRESH:</span>
              <span className="text-slate-300">{decisionState.underwaterThresholdLux} Lux</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Sub-surface Status Bar */}
        <div className="relative z-20 flex items-center justify-between bg-slate-950/80 border border-cyan-900/40 rounded-xl px-3 py-2 text-xs font-mono-data backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-500 text-[11px]">DECISION STATUS:</span>
            <span className="text-cyan-200 truncate max-w-md">{decisionState.decisionReason}</span>
          </div>

          {/* Persistence countdown badge */}
          {decisionState.persistenceTimerActive && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-amber-400 uppercase font-semibold">Persistence:</span>
              <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden border border-amber-500/30">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${decisionState.persistenceProgressPercent}%` }}
                />
              </div>
              <span className="text-amber-300 font-bold text-[11px]">
                {decisionState.currentLowLightDurationMinutes.toFixed(1)}m /{' '}
                {decisionState.persistenceDurationMinutes}m
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
