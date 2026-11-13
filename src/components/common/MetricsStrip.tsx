import React from 'react';
import {
  Cloud,
  Sun,
  Droplets,
  Waves,
  Thermometer,
  FlaskConical,
} from 'lucide-react';
import { EnvironmentalConditions } from '../../types/simulation';

interface MetricsStripProps {
  environment: EnvironmentalConditions;
}

export const MetricsStrip: React.FC<MetricsStripProps> = ({ environment }) => {
  const isLightInsufficient = environment.underwaterLightLevel < 200;

  const items = [
    {
      id: 'cloud',
      title: 'Cloud Cover',
      value: `${environment.cloudCoverPercent}`,
      unit: '%',
      status: environment.cloudCoverPercent > 60 ? '↑ High' : '✓ Normal',
      statusColor: environment.cloudCoverPercent > 60 ? 'text-rose-400' : 'text-emerald-400',
      icon: Cloud,
    },
    {
      id: 'irradiance',
      title: 'Solar Irradiance',
      value: `${environment.solarIrradiance}`,
      unit: 'W/m²',
      status: environment.solarIrradiance < 300 ? '↓ Low' : '✓ Normal',
      statusColor: environment.solarIrradiance < 300 ? 'text-rose-400' : 'text-emerald-400',
      icon: Sun,
    },
    {
      id: 'underwater_light',
      title: 'Underwater Light',
      value: `${environment.underwaterLightLevel}`,
      unit: 'lux',
      status: isLightInsufficient ? '↓ Insufficient' : '✓ Sufficient',
      statusColor: isLightInsufficient ? 'text-rose-400' : 'text-emerald-400',
      icon: Droplets,
    },
    {
      id: 'turbidity',
      title: 'Turbidity',
      value: `${environment.turbidity}`,
      unit: 'NTU',
      status: environment.turbidity > 30 ? '↑ High' : '✓ Clear',
      statusColor: environment.turbidity > 30 ? 'text-rose-400' : 'text-emerald-400',
      icon: Waves,
    },
    {
      id: 'temp',
      title: 'Temperature',
      value: `${environment.waterTemperature}`,
      unit: '°C',
      status: '✓ Normal',
      statusColor: 'text-emerald-400',
      icon: Thermometer,
    },
    {
      id: 'ph',
      title: 'pH',
      value: `${environment.phLevel}`,
      unit: '',
      status: '✓ Normal',
      statusColor: 'text-emerald-400',
      icon: FlaskConical,
    },
  ];

  return (
    <div className="p-3.5 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl shadow-xl select-none">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/60">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 ${idx !== 0 ? 'sm:pl-3 pt-2 sm:pt-0' : ''}`}
            >
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 flex-shrink-0">
                <Icon className="w-4 h-4 text-cyan-400" />
              </div>

              <div className="min-w-0">
                <div className="text-[10px] font-sans text-slate-400 truncate">
                  {item.title}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-mono-data font-bold text-white">
                    {item.value}
                  </span>
                  {item.unit && (
                    <span className="text-[10px] font-mono-data text-slate-400">
                      {item.unit}
                    </span>
                  )}
                </div>
                <div className={`text-[10px] font-sans font-medium ${item.statusColor}`}>
                  {item.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
