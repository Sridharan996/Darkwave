import React, { useRef, useEffect, useState } from 'react';
import {
  EnvironmentalConditions,
  DecisionEngineState,
  BuoyHardwareTelemetry,
} from '../../types/simulation';

interface OceanCrossSectionProps {
  environment: EnvironmentalConditions;
  decisionState: DecisionEngineState;
  telemetry: BuoyHardwareTelemetry;
}

export const OceanCrossSection: React.FC<OceanCrossSectionProps> = ({
  environment,
  decisionState,
  telemetry,
}) => {
  const [viewMode, setViewMode] = useState<'underwater' | 'above'>('underwater');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isLedOn = decisionState.lightingState === 'ACTIVE_SUPPLEMENTAL';
  const intensity = telemetry.ledIntensityPercent / 100.0; // 0.0 to 1.0

  // Keep latest values in refs for the 60fps canvas render loop
  const stateRef = useRef({
    environment,
    isLedOn,
    intensity,
    viewMode,
  });

  useEffect(() => {
    stateRef.current = {
      environment,
      isLedOn,
      intensity,
      viewMode,
    };
  }, [environment, isLedOn, intensity, viewMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const newWidth = rect.width || 960;
      const newHeight = rect.height || 480;

      if (canvas.width !== Math.floor(newWidth * dpr) || canvas.height !== Math.floor(newHeight * dpr)) {
        canvas.width = Math.floor(newWidth * dpr);
        canvas.height = Math.floor(newHeight * dpr);
      }
    };
    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', resize);

    // Marine suspended snow / particles (Spanning full width)
    const particleCount = 110;
    const particles = Array.from({ length: particleCount }, () => ({
      xRatio: Math.random(),
      yRatio: 0.15 + Math.random() * 0.78,
      size: Math.random() * 2.2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.25 + 0.08,
      speedY: (Math.random() - 0.5) * 0.1,
      opacity: Math.random() * 0.45 + 0.2,
    }));

    // Swimming fish silhouettes across full ocean
    const fishes = [
      { x: 0.12, y: 0.28, speed: 0.0006, length: 24, bodyH: 7 },
      { x: 0.48, y: 0.42, speed: 0.0009, length: 28, bodyH: 8.5 },
      { x: 0.78, y: 0.62, speed: 0.0005, length: 20, bodyH: 6.5 },
      { x: 0.25, y: 0.72, speed: 0.00075, length: 26, bodyH: 8 },
      { x: 0.65, y: 0.22, speed: 0.00065, length: 22, bodyH: 7 },
    ];

    // Seagrass blades spanning the entire seabed floor
    const bladeCount = 85;
    const seagrassBlades = Array.from({ length: bladeCount }, (_, i) => ({
      xRatio: (i + 0.5) / bladeCount,
      height: 48 + (Math.sin(i * 1.8) * 16 + 12),
      phaseOffset: i * 0.22,
      stiffness: 0.82 + (i % 3) * 0.18,
    }));

    const render = () => {
      time += 0.025;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const current = stateRef.current;
      const curEnv = current.environment;
      const curIsLedOn = current.isLedOn;
      const curIntensity = current.intensity;
      const cloudFactor = curEnv.cloudCoverPercent / 100.0;

      // Vertical key boundaries
      const surfaceY = height * 0.14; // Surface water boundary at ~14%
      const ledModuleY = height * 0.74; // LED module depth at ~74% (aligned to 45m)
      const seabedY = height * 0.91; // Seabed floor at ~91%
      const centerBuoyX = width * 0.5;

      // -------------------------------------------------------------
      // 1. SKY & ATMOSPHERE (Above Water Surface: 0 to surfaceY)
      // -------------------------------------------------------------
      const skyGrad = ctx.createLinearGradient(0, 0, 0, surfaceY);
      if (cloudFactor < 0.3) {
        skyGrad.addColorStop(0, '#061a30');
        skyGrad.addColorStop(0.6, '#0c2e52');
        skyGrad.addColorStop(1, '#1b4d79');
      } else if (cloudFactor < 0.75) {
        skyGrad.addColorStop(0, '#05111d');
        skyGrad.addColorStop(0.6, '#0b1d30');
        skyGrad.addColorStop(1, '#132b42');
      } else {
        skyGrad.addColorStop(0, '#03080e');
        skyGrad.addColorStop(0.6, '#07101a');
        skyGrad.addColorStop(1, '#0b1926');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, surfaceY);

      // Distant mountain ridge silhouette
      ctx.fillStyle = 'rgba(4, 14, 26, 0.75)';
      ctx.beginPath();
      ctx.moveTo(0, surfaceY);
      ctx.lineTo(0, surfaceY - 14);
      ctx.quadraticCurveTo(width * 0.22, surfaceY - 38, width * 0.46, surfaceY - 18);
      ctx.quadraticCurveTo(width * 0.76, surfaceY - 42, width, surfaceY - 12);
      ctx.lineTo(width, surfaceY);
      ctx.closePath();
      ctx.fill();

      // Atmospheric cloud layers
      if (cloudFactor > 0.2) {
        ctx.fillStyle = `rgba(160, 190, 220, ${0.12 + cloudFactor * 0.18})`;
        ctx.beginPath();
        ctx.ellipse(width * 0.28, surfaceY * 0.42, 130, 22, 0, 0, Math.PI * 2);
        ctx.ellipse(width * 0.75, surfaceY * 0.34, 160, 26, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // -------------------------------------------------------------
      // 2. FULL-FRAME OCEAN WATER COLUMN (surfaceY to height)
      // Spans entire width and height with deep oceanic gradient
      // -------------------------------------------------------------
      const oceanGrad = ctx.createLinearGradient(0, surfaceY, 0, height);
      if (cloudFactor < 0.3) {
        oceanGrad.addColorStop(0, 'rgba(6, 48, 92, 0.96)');
        oceanGrad.addColorStop(0.28, 'rgba(3, 28, 62, 0.98)');
        oceanGrad.addColorStop(0.68, 'rgba(2, 14, 38, 0.99)');
        oceanGrad.addColorStop(1, '#010612');
      } else if (cloudFactor < 0.75) {
        oceanGrad.addColorStop(0, 'rgba(4, 32, 64, 0.96)');
        oceanGrad.addColorStop(0.3, 'rgba(2, 18, 42, 0.98)');
        oceanGrad.addColorStop(0.7, 'rgba(1, 10, 26, 0.99)');
        oceanGrad.addColorStop(1, '#01040d');
      } else {
        oceanGrad.addColorStop(0, 'rgba(2, 18, 38, 0.97)');
        oceanGrad.addColorStop(0.3, 'rgba(1, 10, 24, 0.98)');
        oceanGrad.addColorStop(0.7, 'rgba(1, 6, 16, 0.99)');
        oceanGrad.addColorStop(1, '#000206');
      }
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, surfaceY, width, height - surfaceY);

      // Dynamic full-width water surface wave line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 8) {
        const y = surfaceY + Math.sin(time * 2.2 + x * 0.025) * 2.5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Subtle surface foam/caustic highlights
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.25)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 12) {
        const y = surfaceY + 2.5 + Math.sin(time * 1.8 + x * 0.035 + 1.2) * 1.8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // -------------------------------------------------------------
      // 3. NATURAL AMBIENT DOWNWELLING SUNLIGHT BEAMS
      // -------------------------------------------------------------
      if (cloudFactor < 0.7) {
        ctx.save();
        const beamCount = 6;
        for (let b = 0; b < beamCount; b++) {
          const bx = (width / (beamCount + 1)) * (b + 1) + Math.sin(time * 0.35 + b * 1.2) * 22;
          const bg = ctx.createLinearGradient(bx, surfaceY, bx + 65, ledModuleY);
          const alpha = (0.1 - b * 0.012) * (1.0 - cloudFactor);
          bg.addColorStop(0, `rgba(56, 189, 248, ${alpha})`);
          bg.addColorStop(0.5, `rgba(14, 165, 233, ${alpha * 0.4})`);
          bg.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.beginPath();
          ctx.moveTo(bx - 32, surfaceY);
          ctx.lineTo(bx + 32, surfaceY);
          ctx.lineTo(bx + 90, ledModuleY);
          ctx.lineTo(bx + 15, ledModuleY);
          ctx.closePath();
          ctx.fillStyle = bg;
          ctx.fill();
        }
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 4. VOLUMETRIC SUPPLEMENTAL PAR ILLUMINATION CONE (When LED is ON)
      // -------------------------------------------------------------
      if (curIsLedOn && curIntensity > 0.02) {
        const ledX = centerBuoyX;
        const ledY = ledModuleY + 6;
        const coneSpread = Math.min(width * 0.42, 280) * curIntensity;

        ctx.save();

        // Multi-wavelength PAR cone gradient (450nm Blue + 660nm Red + 525nm Cyan)
        const parGrad = ctx.createRadialGradient(
          ledX,
          ledY,
          4,
          ledX,
          seabedY,
          (seabedY - ledY) * 1.15
        );
        parGrad.addColorStop(0, `rgba(0, 245, 215, ${0.85 * curIntensity})`);
        parGrad.addColorStop(0.2, `rgba(37, 99, 235, ${0.48 * curIntensity})`);
        parGrad.addColorStop(0.52, `rgba(225, 29, 72, ${0.32 * curIntensity})`);
        parGrad.addColorStop(0.85, `rgba(0, 245, 184, ${0.12 * curIntensity})`);
        parGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.moveTo(ledX - 16, ledY);
        ctx.lineTo(ledX + 16, ledY);
        ctx.lineTo(ledX + coneSpread, seabedY);
        ctx.lineTo(ledX - coneSpread, seabedY);
        ctx.closePath();
        ctx.fillStyle = parGrad;
        ctx.fill();

        // Secondary ambient water back-scatter glow
        const scatterGrad = ctx.createRadialGradient(ledX, ledY, 10, ledX, ledY + 40, coneSpread * 0.9);
        scatterGrad.addColorStop(0, `rgba(0, 245, 215, ${0.35 * curIntensity})`);
        scatterGrad.addColorStop(0.5, `rgba(59, 130, 246, ${0.15 * curIntensity})`);
        scatterGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = scatterGrad;
        ctx.fillRect(ledX - coneSpread, ledY - 20, coneSpread * 2, seabedY - ledY + 30);

        // Seabed PAR floor pool glow
        const floorGrad = ctx.createRadialGradient(ledX, seabedY - 4, 10, ledX, seabedY, coneSpread * 0.9);
        floorGrad.addColorStop(0, `rgba(0, 245, 184, ${0.7 * curIntensity})`);
        floorGrad.addColorStop(0.4, `rgba(217, 70, 239, ${0.28 * curIntensity})`);
        floorGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(ledX - coneSpread, seabedY - 22, coneSpread * 2, 40);

        ctx.restore();
      }

      // -------------------------------------------------------------
      // 5. SUSPENDED MARINE SNOW PARTICLES (Full Frame)
      // -------------------------------------------------------------
      particles.forEach((p) => {
        p.xRatio += p.speedX * 0.001;
        p.yRatio += p.speedY * 0.0005;
        if (p.xRatio > 1.0) p.xRatio = 0.0;
        if (p.xRatio < 0.0) p.xRatio = 1.0;
        if (p.yRatio > 0.89) p.yRatio = 0.16;
        if (p.yRatio < 0.15) p.yRatio = 0.88;

        const px = p.xRatio * width;
        const py = p.yRatio * height;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);

        const distFromCenter = Math.abs(px - centerBuoyX);
        const inBeam = curIsLedOn && py >= ledModuleY && distFromCenter < 240 * curIntensity;

        ctx.fillStyle = inBeam
          ? `rgba(0, 255, 220, ${Math.min(1.0, p.opacity + 0.45 * curIntensity)})`
          : `rgba(56, 189, 248, ${p.opacity * 0.4})`;
        ctx.fill();
      });

      // -------------------------------------------------------------
      // 6. SWIMMING FISH SILHOUETTES
      // -------------------------------------------------------------
      fishes.forEach((f) => {
        f.x += f.speed;
        if (f.x > 1.08) f.x = -0.08;

        const fx = f.x * width;
        const fy = f.y * height;
        const tailOsc = Math.sin(time * 5 + f.x * 20) * 0.35;

        ctx.save();
        ctx.translate(fx, fy);
        ctx.fillStyle = 'rgba(6, 22, 38, 0.72)';

        ctx.beginPath();
        ctx.ellipse(0, 0, f.length * 0.5, f.bodyH * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-f.length * 0.45, 0);
        ctx.lineTo(-f.length * 0.85, -f.bodyH * 0.6 + tailOsc * 5);
        ctx.lineTo(-f.length * 0.85, f.bodyH * 0.6 + tailOsc * 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // -------------------------------------------------------------
      // 7. SEAGRASS MEADOW (Full-Width Seabed Floor)
      // -------------------------------------------------------------
      seagrassBlades.forEach((b) => {
        const baseX = b.xRatio * width;
        const baseY = seabedY + 2;
        const wiggle = Math.sin(time * 1.5 + b.phaseOffset) * 14 * b.stiffness;
        const tipX = baseX + wiggle;
        const tipY = baseY - b.height;

        const distCenter = Math.abs(baseX - centerBuoyX);
        const isIlluminated = curIsLedOn && distCenter < 240 * curIntensity;

        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.quadraticCurveTo(baseX + wiggle * 0.5, baseY - b.height * 0.5, tipX, tipY);
        ctx.lineWidth = 3.0;
        ctx.lineCap = 'round';
        ctx.strokeStyle = isIlluminated
          ? `rgba(0, 245, 184, ${0.85 * curIntensity})`
          : 'rgba(10, 50, 42, 0.65)';
        ctx.stroke();
      });

      // Seabed Floor Base
      ctx.fillStyle = '#01040a';
      ctx.fillRect(0, seabedY, width, height - seabedY);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, seabedY);
      ctx.lineTo(width, seabedY);
      ctx.stroke();

      // -------------------------------------------------------------
      // 8. HEAVY-DUTY WATERPROOF TETHER CABLE (Buoy to LED)
      // -------------------------------------------------------------
      const buoyBob = Math.sin(time * 1.5) * 2.5;
      const buoyCenterY = surfaceY + buoyBob;
      const cableTopY = buoyCenterY + 12;
      const cableBottomY = ledModuleY - 14;

      ctx.save();
      // Cable glow when LED is active
      if (curIsLedOn) {
        ctx.strokeStyle = 'rgba(0, 245, 215, 0.3)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(centerBuoyX, cableTopY);
        ctx.quadraticCurveTo(centerBuoyX + Math.sin(time * 0.8) * 3, (cableTopY + cableBottomY) * 0.5, centerBuoyX, cableBottomY);
        ctx.stroke();
      }

      // Cable Core
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(centerBuoyX, cableTopY);
      ctx.quadraticCurveTo(centerBuoyX + Math.sin(time * 0.8) * 3, (cableTopY + cableBottomY) * 0.5, centerBuoyX, cableBottomY);
      ctx.stroke();

      // Cable Clamps & Depth Rings
      const ringCount = 5;
      for (let r = 1; r <= ringCount; r++) {
        const ringY = cableTopY + ((cableBottomY - cableTopY) / (ringCount + 1)) * r;
        ctx.fillStyle = '#64748b';
        ctx.fillRect(centerBuoyX - 3.5, ringY - 1.5, 7, 3);
      }
      ctx.restore();

      // -------------------------------------------------------------
      // 9. SURFACE BUOY (Floating at Water Surface)
      // -------------------------------------------------------------
      ctx.save();
      ctx.translate(centerBuoyX, buoyCenterY);

      // Antenna mast
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(0, -22);
      ctx.stroke();

      // Antenna flashing LoRa beacon
      ctx.fillStyle = '#00f5ff';
      ctx.beginPath();
      ctx.arc(0, -23, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 245, 255, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, -23, 5 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
      ctx.stroke();

      // Yellow Buoy Hull
      const hullGrad = ctx.createLinearGradient(-34, -2, 34, 14);
      hullGrad.addColorStop(0, '#f59e0b');
      hullGrad.addColorStop(0.5, '#d97706');
      hullGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = hullGrad;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.roundRect(-34, -2, 68, 16, [2, 2, 10, 10]);
      ctx.fill();
      ctx.stroke();

      // Twin Solar PV Panels on Buoy Deck
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 0.8;
      ctx.fillRect(-30, 1, 22, 9);
      ctx.strokeRect(-30, 1, 22, 9);
      ctx.fillRect(8, 1, 22, 9);
      ctx.strokeRect(8, 1, 22, 9);

      // Center Status LED on Buoy
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(0, 5.5, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Glassmorphic Surface Buoy Callout Badge
      const buoyBadgeX = 46;
      const buoyBadgeY = -18;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(buoyBadgeX, buoyBadgeY, 150, 32, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10.5px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText('SURFACE BUOY', buoyBadgeX + 8, buoyBadgeY + 13);

      ctx.font = '8.5px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Power • Control • LoRa', buoyBadgeX + 8, buoyBadgeY + 25);

      ctx.restore();

      // -------------------------------------------------------------
      // 10. UNDERWATER DUAL-SPECTRUM LED MODULE (At 45m Depth)
      // -------------------------------------------------------------
      ctx.save();
      ctx.translate(centerBuoyX, ledModuleY);

      // LED Canister Housing
      const ledHousingGrad = ctx.createLinearGradient(-30, -10, 30, 14);
      ledHousingGrad.addColorStop(0, '#1e293b');
      ledHousingGrad.addColorStop(0.5, '#0f172a');
      ledHousingGrad.addColorStop(1, '#020617');
      ctx.fillStyle = ledHousingGrad;
      ctx.strokeStyle = curIsLedOn ? '#38bdf8' : '#475569';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(-28, -10, 56, 20, 6);
      ctx.fill();
      ctx.stroke();

      // Dual Optic Emitters
      if (curIsLedOn) {
        // Active illuminated emitters
        ctx.fillStyle = '#00f5d4';
        ctx.beginPath();
        ctx.arc(-11, 0, 4.5, 0, Math.PI * 2);
        ctx.arc(11, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Emitter bloom glow
        ctx.fillStyle = 'rgba(0, 245, 212, 0.4)';
        ctx.beginPath();
        ctx.arc(-11, 0, 8, 0, Math.PI * 2);
        ctx.arc(11, 0, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Inactive standby emitters
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(-11, 0, 4, 0, Math.PI * 2);
        ctx.arc(11, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // LED Module Callout Badge
      const ledBadgeX = 40;
      const ledBadgeY = -16;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      ctx.strokeStyle = curIsLedOn ? 'rgba(56, 189, 248, 0.6)' : 'rgba(51, 65, 85, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(ledBadgeX, ledBadgeY, 175, 34, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10.5px Inter, system-ui, sans-serif';
      ctx.fillStyle = curIsLedOn ? '#38bdf8' : '#f8fafc';
      ctx.fillText(curIsLedOn ? 'UNDERWATER LED (ACTIVE)' : 'UNDERWATER LED (STANDBY)', ledBadgeX + 8, ledBadgeY + 13);

      ctx.font = '8.5px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(
        curIsLedOn ? `Dual-PAR Active @ ${(curIntensity * 100).toFixed(0)}% (Depth: 45 m)` : 'Standby - Light Sufficient (45 m)',
        ledBadgeX + 8,
        ledBadgeY + 26
      );

      ctx.restore();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      resizeObserver.disconnect();
      cancelAnimationFrame(animId);
    };
  }, []);

  const getEnvHeadline = () => {
    if (environment.cloudCoverPercent < 30) return 'SUNLIGHT';
    if (environment.cloudCoverPercent < 80) return 'CLOUDY';
    return 'RAINY';
  };

  const getEnvSubheadline = () => {
    if (environment.cloudCoverPercent < 30) return 'Normal natural illumination reaching underwater';
    if (environment.cloudCoverPercent < 80) return 'Reduced sunlight reaching underwater';
    return 'Severe low-light storm condition with elevated turbidity';
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800/80 bg-[#020712] shadow-2xl flex flex-col select-none">
      {/* Top Header Row inside Visualization Card */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-800/60 bg-[#030914]/80 backdrop-blur-md z-20">
        <div>
          <div className="text-[10px] font-sans uppercase tracking-widest text-slate-400">
            Current Environment
          </div>
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-lg font-display font-extrabold tracking-wide text-white">
              {getEnvHeadline()}
            </h2>
            <span className="text-xs font-sans text-slate-400 hidden sm:inline">
              {getEnvSubheadline()}
            </span>
          </div>
        </div>

        {/* View Toggle Pill */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-display">
          <button
            onClick={() => setViewMode('above')}
            className={`px-3 py-1 rounded-md transition-all ${
              viewMode === 'above'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Above Water
          </button>
          <button
            onClick={() => setViewMode('underwater')}
            className={`px-3 py-1 rounded-md transition-all ${
              viewMode === 'underwater'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Underwater
          </button>
        </div>
      </div>

      {/* Main Full-Frame Cross Section Visual Stage (Filling available dimensions) */}
      <div
        ref={containerRef}
        className="relative w-full h-[460px] md:h-[500px] overflow-hidden flex"
      >
        {/* Full-Height Left Depth Scale Ruler (0m to 45m aligned) */}
        <div className="w-14 h-full py-2.5 flex flex-col justify-between font-mono-data text-[10px] text-slate-400 pl-3 z-30 pointer-events-none select-none border-r border-slate-800/40 bg-gradient-to-r from-slate-950/70 to-transparent">
          <div className="flex items-center gap-1 text-slate-200 pt-10">
            <span className="w-2.5 h-px bg-slate-400" /> 0 m
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-px bg-slate-600" /> 10 m
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-px bg-slate-600" /> 20 m
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-px bg-slate-600" /> 30 m
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-px bg-slate-600" /> 40 m
          </div>
          <div className="flex items-center gap-1 text-cyan-300 font-bold">
            <span className="w-3 h-0.5 bg-cyan-400" /> 45 m
          </div>
          <div className="flex items-center gap-1 text-slate-500 pb-2">
            <span className="w-2 h-px bg-slate-700" /> 50 m
          </div>
        </div>

        {/* 100% Full-Frame Canvas Layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />
      </div>
    </div>
  );
};
