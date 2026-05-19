import React, { useState } from 'react';
import HUDHeader from '../components/HUDHeader';
import SidebarNav from '../components/SidebarNav';
import DigitalTwin from '../components/DigitalTwin';
import VisionFeed from '../components/VisionFeed';
import TelemetryLab from '../components/TelemetryLab';
import ControlConsole from '../components/CommandConsole';
import StatusBar from '../components/StatusBar';
import NeuralChat from '../components/NeuralChat';
import RobotStatusSmall from '../components/RobotStatusSmall';
import QuickBehaviors from '../components/QuickBehaviors';
import RecentLogs from '../components/RecentLogs';
import SystemStatusSummary from '../components/SystemStatusSummary';
import SettingsView from './SettingsView';

export default function MasterDashboard({ status, logs, onAction, onSay, onDisconnect }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="w-screen h-screen bg-bg-darker flex flex-col overflow-hidden">
      {/* 🔝 HUD HEADER */}
      <HUDHeader status={status} onDisconnect={onDisconnect} />

      <div className="flex-1 flex overflow-hidden">
        {/* 📚 LEFT SIDEBAR */}
        <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* 🏢 MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {activeTab === 'settings' ? (
            <SettingsView status={status} />
          ) : (
            <main className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto custom-scrollbar bg-black/10">
              
              {/* TOP ROW: TWIN | VISION | TELEMETRY */}
              <div className="grid grid-cols-12 gap-6 h-[520px] shrink-0">
                <div className="col-span-4 glass-panel">
                  <DigitalTwin status={status} />
                </div>
                <div className="col-span-4 glass-panel">
                  <VisionFeed />
                </div>
                <div className="col-span-4 glass-panel p-6">
                  <TelemetryLab sensors={status.sensors} status={status} />
                </div>
              </div>

              {/* MIDDLE ROW: CONTROL CONSOLE */}
              <div className="grid grid-cols-12 gap-6 h-[240px] shrink-0">
                <div className="col-span-12 glass-panel p-6">
                   <ControlConsole onAction={onAction} onSay={onSay} />
                </div>
              </div>

              {/* BOTTOM ROW: STATUS | CHAT | BEHAVIORS | LOGS | SYSTEM */}
              <div className="grid grid-cols-12 gap-6 h-[320px] shrink-0">
                 <div className="col-span-3 glass-panel p-5">
                    <RobotStatusSmall status={status} />
                 </div>
                 <div className="col-span-3 glass-panel">
                    <NeuralChat dialogue={status.dialogue} />
                 </div>
                 <div className="col-span-2 glass-panel p-5">
                    <QuickBehaviors onAction={onAction} />
                 </div>
                 <div className="col-span-2 glass-panel p-5">
                    <RecentLogs logs={logs} />
                 </div>
                 <div className="col-span-2 glass-panel p-5">
                    <SystemStatusSummary status={status} />
                 </div>
              </div>

              {/* Spacing for scroll */}
              <div className="h-6 shrink-0"></div>
            </main>
          )}
        </div>
      </div>

      {/* 🧾 BOTTOM STATUS STRIP */}
      <StatusBar logs={logs} status={status} />
    </div>
  );
}
