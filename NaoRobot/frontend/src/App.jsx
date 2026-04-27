import React, { useState, useEffect } from 'react';
import { Activity, Battery, Shield, Info } from 'lucide-react';
import * as api from './services/api';

// Components
import NeuralLink from './components/NeuralLink';
import Hologram from './components/Hologram';
import VocalSynthesis from './components/VocalSynthesis';
import KineticSequences from './components/KineticSequences';
import TelemetryStream from './components/TelemetryStream';
import StatusMonitor from './components/StatusMonitor';

import SensorMatrix from './components/SensorMatrix';
import NeuralChat from './components/NeuralChat';

function App() {
  const [ip, setIp] = useState('169.254.175.171');
  const [status, setStatus] = useState({ connected: false, name: 'Nao', battery: 0, mock_mode: true, dialogue: [], sensors: {} });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(1);

  const addLog = (msg) => {
    setLogs(prev => [ { time: new Date().toLocaleTimeString(), msg }, ...prev.slice(0, 5)]);
  };

  const fetchStatus = async () => {
    try {
      const data = await api.getRobotStatus();
      setStatus(data);
    } catch (err) {
      console.error("Sync Offline");
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async (mock = false) => {
    setLoading(true);
    addLog(mock ? "INIT_SIMULATION" : `LINKING_${ip}`);
    try {
      const data = await api.connectRobot(ip, mock);
      setStatus(data);
      addLog(mock ? "SIM_ACTIVE" : "LINK_ESTABLISHED");
      if (data.connected) {
        setTimeout(() => setCurrentPhase(2), 1500); // Progress to Diagnostics
      }
    } catch (err) {
      addLog("LINK_FAILED");
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    try {
      addLog("TERMINATING_NEURAL_LINK...");
      await api.disconnectRobot();
      setStatus({ connected: false, name: 'Nao', battery: 0, mock_mode: true, dialogue: [] });
      setCurrentPhase(1);
      addLog("LINK_TERMINATED");
    } catch (err) {
      addLog("TERMINATION_FAILED");
    }
  };

  const handleAction = async (action) => {
    try {
      addLog(`ACTION: ${action.toUpperCase()}`);
      await api.executeAction(action);
    } catch (err) {
      addLog("ACTION_FAILED");
    }
  };

  const handleSay = async (text) => {
    try {
      addLog(`VOCAL_TRANS`);
      await api.speakText(text);
    } catch (err) {
      addLog("VOCAL_FAILED");
    }
  };

  const renderPhase = () => {
    switch(currentPhase) {
      case 1:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <NeuralLink 
              ip={ip} setIp={setIp} loading={loading} 
              onConnect={handleConnect} onSimulate={handleConnect} 
            />
            <TelemetryStream logs={logs} />
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-700">
             <div className="glass-card bg-slate-950/40 p-8 flex flex-col items-center justify-center relative">
                <div className="tech-corner top-left"></div>
                <div className="tech-corner top-right"></div>
                <Hologram status={status} />
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary mt-6">Neural Core Sync</h3>
             </div>
             <div className="flex flex-col gap-6">
                <StatusMonitor status={status} />
                <button 
                  className="btn-primary py-6 text-xs font-black tracking-widest mt-auto"
                  onClick={() => setCurrentPhase(3)}
                >
                  PROCEED TO INTERACTION HUB
                </button>
                <button className="text-[10px] text-slate-500 hover:text-white uppercase" onClick={() => setCurrentPhase(1)}>
                  BACK TO UPLINK
                </button>
             </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-700">
             <VocalSynthesis onSay={handleSay} />
             
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Sensor Diagnostics */}
                <div className="lg:col-span-3">
                   <SensorMatrix sensors={status.sensors || {}} />
                </div>

                {/* Center: Dialogue Link */}
                <div className="lg:col-span-5">
                   <NeuralChat dialogue={status.dialogue} />
                </div>

                {/* Right: Kinetic Lab & Status */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                   <KineticSequences onAction={handleAction} />
                   <StatusMonitor status={status} />
                   <button 
                      className="btn-outline py-3 text-[9px] mt-auto"
                      onClick={() => setCurrentPhase(2)}
                   >
                      RETURN TO DIAGNOSTICS
                   </button>
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-6xl mx-auto relative overflow-hidden flex flex-col gap-8">
      <div className="scanline"></div>

      {/* STEPPER HEADER */}
      <header className="flex flex-col gap-8 mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Nao <span className="text-primary italic">OS // V1.0</span>
          </h1>
          <div className="flex gap-4 items-center">
            {status.connected && (
              <button 
                onClick={handleDisconnect}
                className="px-4 py-2 border border-accent text-accent text-[8px] font-black hover:bg-accent/10 transition-all uppercase tracking-widest"
              >
                Terminate Link
              </button>
            )}
            <div className={`status-badge px-4 py-2 text-[8px] ${status.connected ? 'status-online' : 'status-offline'}`}>
              {status.connected ? 'LINKED' : 'OFFLINE'}
            </div>
            <div className="text-[10px] font-mono text-primary/40 uppercase">Phase: 0{currentPhase}</div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="flex gap-2">
          {[1, 2, 3].map((p) => (
            <div 
              key={p}
              className={`h-1.5 flex-1 transition-all duration-700 ${p <= currentPhase ? 'bg-primary shadow-[0_0_10px_rgba(0,242,255,0.5)]' : 'bg-slate-800'}`}
            ></div>
          ))}
        </div>
      </header>

      {/* PHASE CONTENT */}
      <main className="flex-1">
        {renderPhase()}
      </main>
      
      <footer className="mt-auto py-8 border-t border-glass-border flex justify-between items-center text-[9px] font-mono text-slate-600 uppercase tracking-[0.3em]">
        <span>&copy; 2026 NAO_OS // STEP_BY_STEP_MODE</span>
        <span className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${status.connected ? 'bg-primary animate-pulse' : 'bg-red-500'}`}></div>
          Neural_Link: {status.connected ? 'SECURE' : 'WAITING'}
        </span>
      </footer>
    </div>
  );
}

export default App;
