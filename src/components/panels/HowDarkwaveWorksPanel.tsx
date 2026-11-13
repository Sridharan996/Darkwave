import React from 'react';
import { ScrollText } from 'lucide-react';
import {
  WeatherMode,
  DecisionEngineState,
  EnvironmentalConditions,
  BuoyHardwareTelemetry,
} from '../../types/simulation';

interface HowDarkwaveWorksPanelProps {
  currentWeather: WeatherMode;
  decisionState: DecisionEngineState;
  environment: EnvironmentalConditions;
  telemetry: BuoyHardwareTelemetry;
}

export const HowDarkwaveWorksPanel: React.FC<HowDarkwaveWorksPanelProps> = ({
  currentWeather,
  decisionState,
  environment,
  telemetry,
}) => {
  const isLedOn = decisionState.lightingState === 'ACTIVE_SUPPLEMENTAL';
  const isRequired = decisionState.mlIlluminationRequired === 1;
  const isLightBelow = environment.underwaterLightLevel < decisionState.underwaterThresholdLux;
  const currentSec = decisionState.currentLowLightDurationSeconds ?? 0;
  const targetSec = decisionState.persistenceDurationSeconds ?? 5;
  const remainingSeconds = Math.max(0, targetSec - currentSec);

  const steps = [
    {
      num: 1,
      title: 'Weather Selection',
      desc:
        currentWeather === 'SUNLIGHT'
          ? 'Sunlight condition selected'
          : currentWeather === 'CLOUDY'
          ? 'Cloudy condition selected'
          : 'Rainy storm selected',
      active: true,
    },
    {
      num: 2,
      title: 'Environment Simulation',
      desc: 'Generates sensor readings',
      active: true,
    },
    {
      num: 3,
      title: 'Low-Light Detection',
      desc: isLightBelow
        ? `Underwater light below threshold (${environment.underwaterLightLevel} lux)`
        : 'Underwater light sufficient (>200 lux)',
      active: true,
    },
    {
      num: 4,
      title: 'Persistence Timer',
      desc:
        currentSec > 0 || isLightBelow
          ? `Monitoring duration (${currentSec} / ${targetSec} sec)`
          : 'Timer reset (0 sec)',
      active: currentSec > 0 || isLedOn,
    },
    {
      num: 5,
      title: 'ML Model Prediction',
      desc: isRequired
        ? `Illumination required (${(decisionState.mlConfidenceScore * 100).toFixed(1)}%)`
        : 'Illumination not required (0.0%)',
      active: true,
    },
    {
      num: 6,
      title: 'LED Activation',
      desc: isLedOn
        ? `Active @ ${telemetry.ledIntensityPercent}% intensity`
        : remainingSeconds > 0 && isLightBelow
        ? `Will activate after ${remainingSeconds} more seconds`
        : 'LED Standby (0.0 W)',
      active: isLedOn,
    },
  ];

  return (
    <div className="p-4 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl shadow-xl select-none flex flex-col justify-between space-y-3">
      
      {/* Panel Header */}
      <div className="flex items-center gap-2">
        <ScrollText className="w-4 h-4 text-cyan-400" />
        <h2 className="text-xs font-display font-bold uppercase tracking-wider text-slate-200">
          How DARKWAVE Works
        </h2>
      </div>

      {/* 6-step Vertical Stepper */}
      <div className="relative space-y-2.5 pl-1 font-sans">
        {/* Continuous vertical connecting line */}
        <div className="absolute left-3.5 top-2.5 bottom-2.5 w-px bg-slate-800" />

        {steps.map((step) => {
          return (
            <div key={step.num} className="relative flex items-start gap-3">
              {/* Step Number Circle */}
              <div
                className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono-data font-bold flex-shrink-0 transition-colors ${
                  step.active
                    ? 'bg-blue-600 text-white shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {step.num}
              </div>

              {/* Step Text */}
              <div className="min-w-0">
                <div className="text-[11px] font-display font-semibold text-slate-200 leading-tight">
                  {step.title}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight truncate">
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
