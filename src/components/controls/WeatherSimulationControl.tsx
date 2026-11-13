import React from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  Play,
  Sparkles,
} from 'lucide-react';
import {
  WeatherMode,
  EnvironmentalConditions,
  DecisionEngineState,
  BuoyHardwareTelemetry,
} from '../../types/simulation';

interface WeatherSimulationControlProps {
  currentWeather: WeatherMode;
  onSelectWeather: (mode: WeatherMode) => void;
  environment: EnvironmentalConditions;
  decisionState: DecisionEngineState;
  telemetry: BuoyHardwareTelemetry;
  onStartSimulation?: () => void;
  isRunning?: boolean;
}

export const WeatherSimulationControl: React.FC<WeatherSimulationControlProps> = ({
  currentWeather,
  onSelectWeather,
  onStartSimulation,
  isRunning,
}) => {
  const weatherOptions: {
    id: WeatherMode;
    label: string;
    sublabel: string;
    icon: any;
    accent: string;
  }[] = [
    {
      id: 'SUNLIGHT',
      label: 'SUNLIGHT',
      sublabel: 'Normal natural illumination',
      icon: Sun,
      accent: 'amber',
    },
    {
      id: 'CLOUDY',
      label: 'CLOUDY',
      sublabel: 'Reduced sunlight',
      icon: Cloud,
      accent: 'cyan',
    },
    {
      id: 'RAINY',
      label: 'RAINY',
      sublabel: 'Severe low-light condition',
      icon: CloudRain,
      accent: 'blue',
    },
  ];

  return (
    <div className="p-4 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl shadow-xl select-none">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <div>
          <h2 className="text-xs font-display font-bold uppercase tracking-widest text-slate-200">
            WEATHER SIMULATION
          </h2>
          <p className="text-[11px] font-sans text-slate-400">
            Select an environmental condition to simulate. Sensor values will be generated automatically.
          </p>
        </div>
      </div>

      {/* Grid of Weather Cards + Start Simulation Button */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {weatherOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = currentWeather === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => onSelectWeather(opt.id)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-300 flex items-center gap-3.5 ${
                isSelected
                  ? 'bg-blue-600/25 border-blue-400/80 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] ring-1 ring-blue-400/50'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl border backdrop-blur-md flex-shrink-0 ${
                  isSelected
                    ? 'bg-blue-500/20 border-blue-400/60 text-cyan-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <div
                  className={`text-xs font-display font-bold tracking-wider uppercase ${
                    isSelected ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {opt.label}
                </div>
                <div className="text-[10.5px] font-sans text-slate-400 truncate">
                  {opt.sublabel}
                </div>
              </div>
            </button>
          );
        })}

        {/* Start / Run Simulation Action Button */}
        <button
          onClick={onStartSimulation}
          className="p-3.5 rounded-xl border border-blue-500/40 bg-blue-950/30 hover:bg-blue-900/40 text-left transition-all duration-300 flex items-center gap-3.5 group shadow-lg"
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 border border-blue-400/60 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.6)] flex-shrink-0 group-hover:scale-105 transition-transform">
            <Play className="w-4 h-4 fill-white ml-0.5" />
          </div>

          <div className="min-w-0">
            <div className="text-xs font-display font-bold tracking-wider text-white">
              {isRunning ? 'Running Simulation' : 'Start Simulation'}
            </div>
            <div className="text-[10.5px] font-sans text-slate-400 truncate">
              Simulate selected condition
            </div>
          </div>
        </button>
      </div>

    </div>
  );
};
