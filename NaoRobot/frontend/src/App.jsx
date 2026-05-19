import React, { useState, useEffect } from 'react';
import * as api from './services/api';

// VIEWS
import LoginView from './views/LoginView';
import ConnectionView from './views/ConnectionView';
import MasterDashboard from './views/MasterDashboard';

function App() {
  const [stage, setStage] = useState(0); // 0: Login, 1: Connect, 2: Dashboard
  const [ip, setIp] = useState('169.254.175.171');
  const [status, setStatus] = useState({ 
    connected: false, 
    name: 'NAO-01', 
    battery: 85, 
    mock_mode: true, 
    dialogue: [], 
    sensors: { cpu_load: 0, memory_usage: 0, head_touch: 0, sonar_left: 0, sonar_right: 0 },
    life_state: 'disabled'
  });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg }, ...prev.slice(0, 10)]);
  };

  const fetchStatus = async () => {
    if (stage < 2) return;
    try {
      const data = await api.getRobotStatus();
      setStatus(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error("Link sync interrupted");
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [stage]);

  const handleLogin = (credentials) => {
    setLoading(true);
    // Simulate auth
    setTimeout(() => {
      setLoading(false);
      setStage(1);
    }, 1000);
  };

  const handleConnect = async (mock = false) => {
    setLoading(true);
    addLog(mock ? "INIT_SIMULATION" : `LINKING_${ip}`);
    try {
      const data = await api.connectRobot(ip, mock);
      setStatus(prev => ({ ...prev, ...data }));
      if (data.connected || mock) {
        setStage(2);
      }
    } catch (err) {
      addLog("LINK_FAILED");
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    await api.disconnectRobot();
    setStage(1);
    setStatus(prev => ({ ...prev, connected: false }));
  };

  const handleAction = async (action) => {
    addLog(`CMD_EXEC: ${action.toUpperCase()}`);
    await api.executeAction(action);
  };

  const handleSay = async (text) => {
    addLog(`VOCAL_TRANS`);
    await api.speakText(text);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="scanline"></div>
      
      {stage === 0 && <LoginView onLogin={handleLogin} loading={loading} />}
      
      {stage === 1 && (
        <ConnectionView 
          ip={ip} 
          setIp={setIp} 
          onConnect={() => handleConnect(false)} 
          onSimulate={() => handleConnect(true)}
          loading={loading}
        />
      )}
      
      {stage === 2 && (
        <MasterDashboard 
          status={status} 
          logs={logs}
          onAction={handleAction}
          onSay={handleSay}
          onDisconnect={handleDisconnect}
        />
      )}
    </div>
  );
}

export default App;
