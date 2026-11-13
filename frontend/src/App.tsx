import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/navigation/Sidebar';
import { TopHeader } from './components/navigation/TopHeader';
import { WeatherSimulationControl } from './components/controls/WeatherSimulationControl';
import { OceanCrossSection } from './components/visualization/OceanCrossSection';
import { MetricsStrip } from './components/common/MetricsStrip';
import { SystemStatusPanel } from './components/panels/SystemStatusPanel';
import { UnderwaterLedPanel } from './components/panels/UnderwaterLedPanel';
import { HowDarkwaveWorksPanel } from './components/panels/HowDarkwaveWorksPanel';
import { PowerManagementPanel } from './components/panels/PowerManagementPanel';
import { ManualSimulationControls } from './components/controls/ManualSimulationControls';
import { MlModelPage } from './components/views/MlModelPage';
import { AnalyticsTab } from './components/views/AnalyticsTab';
import { EventsTab } from './components/views/EventsTab';
import { PowerSystemView } from './components/views/PowerSystemView';
import { DebugStatusPanel } from './components/common/DebugStatusPanel';
import { BigDataAnalyticsTab } from './components/views/BigDataAnalyticsTab';
import { useSimulationEngine } from './hooks/useSimulationEngine';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  const {
    environment,
    telemetry,
    decisionState,
    events,
    trendData,
    simSpeed,
    setSimSpeed,
    currentWeather,
    setWeather,
    currentSimulationState,
    setSimulationState,
    isDemoRunning,
    demoPhase,
    startFullDemo,
    stopFullDemo,
    setManualCloudCover,
    setManualSolarIrradiance,
    setManualUnderwaterLight,
    setManualTurbidity,
    setManualTimeOfDay,
    setManualPersistenceThreshold,
    setManualLuxThreshold,
    toggleLedManual,
    powerConfig,
    updatePowerConfig,
    setBatterySoc,
    resetPowerSystem,
  } = useSimulationEngine();

  return (
    <div className="min-h-screen bg-[#020712] text-slate-100 flex antialiased selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      
      {/* LEFT: Minimal DARKWAVE Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        currentSimulationState={currentSimulationState}
        onSetSimulationState={setSimulationState}
        simSpeed={simSpeed}
        onSetSimSpeed={setSimSpeed}
        isDemoRunning={isDemoRunning}
        demoPhase={demoPhase}
        onStartDemo={startFullDemo}
        onStopDemo={stopFullDemo}
      />

      {/* RIGHT MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* TOP HEADER */}
        <TopHeader timeOfDay={environment.timeOfDay} />

        {/* DASHBOARD CONTENT BODY */}
        <main className="flex-1 p-4 md:p-5 max-w-[1920px] w-full mx-auto">
          
          {/* Main Dashboard View (Direct match to reference composition) */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              
              {/* CENTER COLUMN: Weather Simulation + Ocean Cross-Section + Metrics Strip (8 Cols on xl) */}
              <div className="xl:col-span-8 flex flex-col gap-4">
                
                {/* 0. PIPELINE DEBUG HUD */}
                <DebugStatusPanel
                  currentWeather={currentWeather}
                  environment={environment}
                  decisionState={decisionState}
                  telemetry={telemetry}
                />

                {/* 1. WEATHER SIMULATION SELECTOR */}
                <WeatherSimulationControl
                  currentWeather={currentWeather}
                  onSelectWeather={setWeather}
                  environment={environment}
                  decisionState={decisionState}
                  telemetry={telemetry}
                  onStartSimulation={isDemoRunning ? stopFullDemo : startFullDemo}
                  isRunning={isDemoRunning}
                />

                {/* 2. LARGE CINEMATIC MARINE CROSS-SECTION VISUALIZATION */}
                <OceanCrossSection
                  environment={environment}
                  decisionState={decisionState}
                  telemetry={telemetry}
                />

                {/* 3. HORIZONTAL ENVIRONMENTAL METRICS STRIP */}
                <MetricsStrip environment={environment} />

              </div>

              {/* RIGHT COLUMN: 3 Compact Status & Decision Panels (4 Cols on xl) */}
              <div className="xl:col-span-4 flex flex-col gap-4">
                
                {/* Panel 1: System Status */}
                <SystemStatusPanel
                  decisionState={decisionState}
                  environment={environment}
                />

                {/* Panel 2: Underwater LED */}
                <UnderwaterLedPanel
                  telemetry={telemetry}
                  decisionState={decisionState}
                />

                {/* Panel 3: Power & Energy Management */}
                <PowerManagementPanel
                  powerSystem={telemetry.powerSystem}
                  onUpdateConfig={updatePowerConfig}
                  onSetBatterySoc={setBatterySoc}
                  onResetPower={resetPowerSystem}
                />

                {/* Panel 4: How DARKWAVE Works (6-step vertical chain) */}
                <HowDarkwaveWorksPanel
                  currentWeather={currentWeather}
                  decisionState={decisionState}
                  environment={environment}
                  telemetry={telemetry}
                />

              </div>

            </div>
          )}

          {/* Dedicated Power Subsystem View */}
          {activeTab === 'power' && (
            <PowerSystemView
              powerSystem={telemetry.powerSystem}
              environment={environment}
              decisionState={decisionState}
              onUpdateConfig={updatePowerConfig}
              onSetBatterySoc={setBatterySoc}
              onResetPower={resetPowerSystem}
            />
          )}

          {/* Simulation Lab View */}
          {activeTab === 'simulation' && (
            <div className="space-y-4">
              <MetricsStrip environment={environment} />
              <ManualSimulationControls
                environment={environment}
                decisionState={decisionState}
                currentSimulationState={currentSimulationState}
                onSetSimulationState={setSimulationState}
                isDemoRunning={isDemoRunning}
                demoPhase={demoPhase}
                onStartDemo={startFullDemo}
                onStopDemo={stopFullDemo}
                onUpdateCloudCover={setManualCloudCover}
                onUpdateSolarIrradiance={setManualSolarIrradiance}
                onUpdateUnderwaterLight={setManualUnderwaterLight}
                onUpdateTurbidity={setManualTurbidity}
                onUpdateTimeOfDay={setManualTimeOfDay}
                onUpdatePersistenceThreshold={setManualPersistenceThreshold}
                onUpdateLuxThreshold={setManualLuxThreshold}
              />
            </div>
          )}

          {/* Analytics View */}
          {activeTab === 'analytics' && (
            <AnalyticsTab trendData={trendData} environment={environment} />
          )}

          {/* Dedicated ML Model View */}
          {activeTab === 'ml' && (
            <MlModelPage />
          )}

          {activeTab === 'big-data' && (
            <BigDataAnalyticsTab />
          )}

          {/* Event Log View */}
          {activeTab === 'events' && (
            <EventsTab events={events} />
          )}

          {/* Settings Tab View */}
          {activeTab === 'settings' && (
            <div className="p-6 rounded-2xl bg-[#040c1a]/80 border border-slate-800/80 backdrop-blur-xl space-y-4 max-w-3xl">
              <div>
                <h2 className="text-lg font-display font-bold text-white">System Settings & Thresholds</h2>
                <p className="text-xs font-sans text-slate-400">Configure default sensor persistence limits and hardware thresholds</p>
              </div>

              <div className="space-y-3 pt-2 font-mono-data text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Underwater Illuminance Activation Threshold:</span>
                  <span className="font-bold text-cyan-300">{decisionState.underwaterThresholdLux} Lux</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Low-Light Persistence Required Duration:</span>
                  <span className="font-bold text-cyan-300">{decisionState.persistenceDurationMinutes} Minutes</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Submerged Target Depth:</span>
                  <span className="font-bold text-cyan-300">45.0 Meters</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">FastAPI ML Endpoint:</span>
                  <span className="font-bold text-emerald-400">http://127.0.0.1:8000/predict</span>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}

export default App;
