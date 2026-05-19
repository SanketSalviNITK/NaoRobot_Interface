import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Cpu, Sliders, Volume2, VolumeX, Eye, EyeOff, 
  Mic, MicOff, Database, Sparkles, Shield, HardDrive, 
  Bell, Send, UploadCloud, BatteryCharging, Wifi 
} from 'lucide-react';

export default function App() {
  // 1. Behavior & Motor Toggles
  const [lifeState, setLifeState] = useState(true);
  const [awareness, setAwareness] = useState(true);
  const [fallManager, setFallManager] = useState(true);

  // 2. AI & Cognitive Toggles
  const [micLoop, setMicLoop] = useState(true);
  const [gesturesEnabled, setGesturesEnabled] = useState(true);
  const [ragMode, setRagMode] = useState(false);

  // 3. Sensory & Feedback Toggles
  const [ledFeedback, setLedFeedback] = useState(true);
  const [audioVolume, setAudioVolume] = useState(true);

  // 4. Live Telemetry State
  const [battery, setBattery] = useState(88);
  const [jointTemp, setJointTemp] = useState(38.4);
  const [latency, setLatency] = useState(12);
  const [inferenceTime, setInferenceTime] = useState(1.42);

  // 5. Chat Console State
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Holographic interface stabilized. I am ready to assist.', gesture: 'explain' },
  ]);
  const [inputText, setInputText] = useState('');

  // 6. Real-time Logs State
  const [logs, setLogs] = useState([
    { id: 1, time: '12:00:04', level: 'info', text: 'ALBroker initialized successfully at 169.254.175.100:5001' },
    { id: 2, time: '12:00:05', level: 'info', text: 'LM Studio server detected on local interfaces' },
    { id: 3, time: '12:00:08', level: 'info', text: 'Speech synthesis module loaded (Volume: 1.0)' },
  ]);

  const chatEndRef = useRef(null);
  const logsEndRef = useRef(null);

  // Fluctuating Telemetry Effect to make it feel alive!
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => Math.max(8, Math.min(20, prev + (Math.random() > 0.5 ? 1 : -1))));
      setJointTemp(prev => Math.max(37, Math.min(42, prev + parseFloat((Math.random() * 0.2 - 0.1).toFixed(2)))));
      setInferenceTime(prev => Math.max(1.1, Math.min(1.9, prev + parseFloat((Math.random() * 0.1 - 0.05).toFixed(2)))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom helper
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Log builder helper
  const addLog = (level, text) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs(prev => [...prev, { id: Date.now(), time: timeStr, level, text }]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    addLog('info', `Dispatched speech command: "${inputText}"`);
    setInputText('');

    // Mock AI reply loop
    setTimeout(() => {
      let botResponse = 'Command processed. System links are functioning optimally.';
      let mockGesture = 'explain';

      if (inputText.toLowerCase().includes('hello') || inputText.toLowerCase().includes('hi')) {
        botResponse = 'Hello! I am NAO, your embodied intelligence platform. My motors are fully calibrated.';
        mockGesture = 'wave';
      } else if (inputText.toLowerCase().includes('help') || inputText.toLowerCase().includes('documentation')) {
        botResponse = 'Accessing knowledge libraries... Local RAG database indicates fallbacks are set to off.';
        mockGesture = 'thinking';
      } else if (inputText.toLowerCase().includes('status') || inputText.toLowerCase().includes('health')) {
        botResponse = `Diagnostics report: Battery is at ${battery}%, joint temperatures are stable at ${jointTemp.toFixed(1)}°C.`;
        mockGesture = 'check';
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        gesture: gesturesEnabled ? mockGesture : null
      }]);
      addLog('info', `Speech synthesis complete. Triggered gesture: ${mockGesture}`);
    }, 1000);
  };

  const handleToggle = (name, setter, val) => {
    setter(!val);
    addLog('warn', `System configured: Changed "${name}" parameter to ${!val ? 'ON' : 'OFF'}`);
  };

  const handleFileUpload = () => {
    addLog('info', 'Cognitive Engine: Parsing drag-and-drop document upload...');
    setTimeout(() => {
      addLog('info', 'Cognitive Engine: Document segmented into 24 chunks');
      addLog('info', 'Cognitive Engine: ChromaDB vector embeddings created successfully!');
      setRagMode(true);
    }, 1200);
  };

  return (
    <div className="dashboard-container">
      {/* 🚀 HUD TOP HEADER */}
      <header className="hud-header">
        <div className="hud-title-group">
          <span className="hud-tag">EMBODIED AI COGNITION GRID</span>
          <h1 className="hud-title">NAO Autonomous Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="hud-status-badge">
            <span className="status-dot"></span>
            SYS LINK: ONLINE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <BatteryCharging size={16} className="cyan" style={{ animation: 'pulse-green 1.5s infinite' }} />
            {battery}% CHARGED
          </div>
        </div>
      </header>

      {/* 📊 MAIN DASHBOARD GRID */}
      <main className="dashboard-grid">
        
        {/* ================= LEFT COLUMN: TELEMETRY ================= */}
        <section className="telemetry-col">
          <div className="glass-panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <div className="panel-title">
                <Activity size={16} className="cyan" />
                <h3>Telemetry Monitor</h3>
              </div>
              <span className="panel-subtitle">Diagnostics</span>
            </div>

            {/* Battery Stat */}
            <div className="telemetry-card">
              <span className="telemetry-label">Main Power Reserve</span>
              <div className="telemetry-value-row">
                <span className="telemetry-value cyan">{battery}%</span>
                <span className="telemetry-unit">LIPO</span>
              </div>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: `${battery}%` }}></div>
              </div>
            </div>

            {/* Joint Temperature */}
            <div className="telemetry-card">
              <span className="telemetry-label">Joint Thermals</span>
              <div className="telemetry-value-row">
                <span className="telemetry-value" style={{ color: jointTemp > 40 ? 'var(--accent-red)' : '#fff' }}>
                  {jointTemp.toFixed(1)}°C
                </span>
                <span className="telemetry-unit">AVG</span>
              </div>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: `${(jointTemp / 60) * 100}%`, background: 'var(--accent-red)' }}></div>
              </div>
            </div>

            {/* Interface Latency */}
            <div className="telemetry-card">
              <span className="telemetry-label">Bridge Ping</span>
              <div className="telemetry-value-row">
                <span className="telemetry-value cyan">{latency}ms</span>
                <span className="telemetry-unit">WiFi</span>
              </div>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: `${(latency / 50) * 100}%` }}></div>
              </div>
            </div>

            {/* Inference Latency */}
            <div className="telemetry-card">
              <span className="telemetry-label">Local Inference</span>
              <div className="telemetry-value-row">
                <span className="telemetry-value cyan">{inferenceTime.toFixed(2)}s</span>
                <span className="telemetry-unit">Gemma</span>
              </div>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: `${(inferenceTime / 3) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MIDDLE COLUMN: INTERACTIVE CONSOLE ================= */}
        <section className="console-col">
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="panel-header">
              <div className="panel-title">
                <Sliders size={16} className="cyan" />
                <h3>Dialogue & RAG Controller</h3>
              </div>
              <span className="panel-subtitle">Neural Interface</span>
            </div>

            {/* Scrolling Chat Box */}
            <div className="chat-box">
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                  <span className="bubble-sender">{msg.sender === 'bot' ? '🤖 NAO qi' : '👤 Operator'}</span>
                  <p className="bubble-content">{msg.text}</p>
                  {msg.gesture && (
                    <span className="bubble-gesture">
                      <Sparkles size={8} style={{ color: 'var(--primary)' }} />
                      Actuator: {msg.gesture}
                    </span>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Interactive Chat Form */}
            <form onSubmit={handleSendMessage} className="chat-input-bar">
              <input 
                type="text" 
                className="chat-input"
                placeholder="Disptach neural text command (e.g. 'Hello', 'Status')..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" className="send-btn">
                <Send size={12} style={{ marginRight: '6px' }} />
                Send
              </button>
            </form>

            {/* RAG Drop Zone */}
            <div className="rag-upload-zone" onClick={handleFileUpload}>
              <UploadCloud size={24} className="rag-icon" />
              <div className="rag-title">Drag & Drop Knowledge Base</div>
              <div className="rag-desc">Upload PDF / TXT manuals to enhance local RAG search index</div>
            </div>
          </div>
        </section>

        {/* ================= RIGHT COLUMN: BEHAVIOR MATRIX ================= */}
        <section className="toggles-col">
          <div className="glass-panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <div className="panel-title">
                <Cpu size={16} className="cyan" />
                <h3>System Matrix</h3>
              </div>
              <span className="panel-subtitle">Actuators</span>
            </div>

            <div className="toggle-group">
              
              {/* Autonomous Life */}
              <div className="toggle-card">
                <div className="toggle-row">
                  <div className="toggle-label-group">
                    <span className="toggle-name">Autonomous Life</span>
                    <span className="toggle-desc">Enable breathing posture shifts.</span>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={lifeState} 
                      onChange={() => handleToggle('Autonomous Life', setLifeState, lifeState)} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* Basic Awareness */}
              <div className="toggle-card">
                <div className="toggle-row">
                  <div className="toggle-label-group">
                    <span className="toggle-name">Basic Awareness</span>
                    <span className="toggle-desc">Track human faces and sounds.</span>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={awareness} 
                      onChange={() => handleToggle('Basic Awareness', setAwareness, awareness)} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* Fall Protection */}
              <div className="toggle-card">
                <div className="toggle-row">
                  <div className="toggle-label-group">
                    <span className="toggle-name">Fall Protection</span>
                    <span className="toggle-desc">Auto-joint safety shutdown.</span>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={fallManager} 
                      onChange={() => handleToggle('Fall Protection', setFallManager, fallManager)} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* RAG Context Boost */}
              <div className="toggle-card">
                <div className="toggle-row">
                  <div className="toggle-label-group">
                    <span className="toggle-name">RAG Knowledge DB</span>
                    <span className="toggle-desc">Search custom manuals for context.</span>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={ragMode} 
                      onChange={() => handleToggle('RAG Knowledge DB', setRagMode, ragMode)} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* Eye LED feedback */}
              <div className="toggle-card">
                <div className="toggle-row">
                  <div className="toggle-label-group">
                    <span className="toggle-name">LED Status cues</span>
                    <span className="toggle-desc">Green/white eye tracking blinks.</span>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={ledFeedback} 
                      onChange={() => handleToggle('LED Status cues', setLedFeedback, ledFeedback)} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* Audio Volume */}
              <div className="toggle-card">
                <div className="toggle-row">
                  <div className="toggle-label-group">
                    <span className="toggle-name">Speech Speakers</span>
                    <span className="toggle-desc">Mutes/activates head speakers.</span>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={audioVolume} 
                      onChange={() => handleToggle('Speech Speakers', setAudioVolume, audioVolume)} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* 🪵 SYSTEM LOG PANELS */}
      <footer className="glass-panel log-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Shield size={16} className="cyan" />
            <h3>Holographic Logs Terminal</h3>
          </div>
          <span className="panel-subtitle">Bridge Stream</span>
        </div>
        <div className="log-stream">
          {logs.map((log) => (
            <div key={log.id} className="log-line">
              <span className="log-time">[{log.time}]</span>
              <span className={`log-level ${log.level}`}>{log.level}</span>
              <span className="log-msg">{log.text}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </footer>
    </div>
  );
}
