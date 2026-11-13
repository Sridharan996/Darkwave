import React from 'react';
import { EnvironmentalTrendsChart } from '../panels/EnvironmentalTrendsChart';
import { MetricsStrip } from '../common/MetricsStrip';
import { TrendDataPoint, EnvironmentalConditions } from '../../types/simulation';
import { LineChart, Sparkles } from 'lucide-react';

interface AnalyticsTabProps {
  trendData: TrendDataPoint[];
  environment: EnvironmentalConditions;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ trendData, environment }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-cyan-400" />
            Environmental Trends & Optical Analytics
          </h2>
          <p className="text-xs font-sans text-slate-400">
            Continuous optical irradiance and telemetry time-series tracking
          </p>
        </div>
      </div>

      <MetricsStrip environment={environment} />

      <div className="p-4 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl shadow-xl">
        <EnvironmentalTrendsChart data={trendData} />
      </div>
    </div>
  );
};
