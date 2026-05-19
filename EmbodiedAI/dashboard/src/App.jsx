import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Cpu, Sliders, Volume2, VolumeX, Eye, EyeOff, 
  Mic, MicOff, Database, Sparkles, Shield, HardDrive, 
  Bell, Send, UploadCloud, BatteryCharging, Wifi, 
  ChevronsUp, ChevronsDown, Move, Speech, HelpCircle, 
  Volume, AlertCircle
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

  // 4. Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechConfidence, setSpeechConfidence] = useState(0);

  // 5. Kinetic Motions Module States
  const [activeMotion, setActiveMotion] = useState('');
  const [jointAngles, setJointAngles] = useState({
    headYaw: 0.0,
    shoulderPitch: 85.4,
    elbowRoll: -24.6,
    hipPitch: -4.2
  });

  // 6. Live Telemetry State
  const [battery, setBattery] = useState(88);
  const [jointTemp, setJointTemp] = useState(38.4);
  const [latency, setLatency] = useState(12);
  const [inferenceTime, setInferenceTime] = useState(1.42);

  // 7. Chat Console State
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Holographic interface stabilized. I am ready to assist.', gesture: 'explain' },
  ]);
  const [inputText, setInputText] = useState('');

  // 8. Real-time Logs State
  const [logs, setLogs] = useState([
    { id: 1, time: '12:00:04', level: 'info', text: 'ALBroker initialized successfully at 169.254.175.100:5001' },
    { id: 2, time: '12:00:05', level: 'info', text: 'LM Studio server detected on local interfaces' },
    { id: 3, time: '12:00:08', level: 'info', text: 'Speech synthesis module loaded (Volume: 1.0)' },
  ]);

  const chatEndRef = useRef(null);
  const logsEndRef = useRef(null);

  // Fluctuating Telemetry & Joints Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => Math.max(8, Math.min(20, prev + (Math.random() > 0.5 ? 1 : -1))));
      setJointTemp(prev => Math.max(37, Math.min(42, prev + parseFloat((Math.random() * 0.2 - 0.1).toFixed(2)))));
      setInferenceTime(prev => Math.max(1.1, Math.min(1.9, prev + parseFloat((Math.random() * 0.1 - 0.05).toFixed(2)))));

      // Tiny natural fluctuating micro-movements (Autonomous Life!)
      if (lifeState) {
        setJointAngles(prev => ({
          headYaw: parseFloat((prev.headYaw + (Math.random() * 0.8 - 0.4)).toFixed(1)),
          shoulderPitch: parseFloat((prev.shoulderPitch + (Math.random() * 0.6 - 0.3)).toFixed(1)),
          elbowRoll: parseFloat((prev.elbowRoll + (Math.random() * 0.8 - 0.4)).toFixed(1)),
          hipPitch: parseFloat((prev.hipPitch + (Math.random() * 0.4 - 0.2)).toFixed(1))
        }));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [lifeState]);

  // Scroll helpers
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

  // Speech Recognition Mic Click Handler
  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false);
      addLog('warn', 'Voice Recognition: Continuous ingestion capture manually aborted');
      return;
    }

    setIsListening(true);
    setSpeechConfidence(0);
    addLog('info', 'Voice Ingestion: Continuous capture active... Capturing audio stream');

    // Simulate vocal recording and automatic transcription timeout
    setTimeout(() => {
      setIsListening(false);
      setSpeechConfidence(96.4);
      
      const recognizedText = "Wave hand and check health status";
      addLog('info', `Whisper STT: Audio transcribed (confidence: 96.4%)`);
      
      const userMsg = { id: Date.now(), sender: 'user', text: `[Voice Command] "${recognizedText}"` };
      setMessages(prev => [...prev, userMsg]);
      
      // Dispatch motion response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Vocal command recognized! Calibrating kinetic posture and executing high wave sequence.',
          gesture: 'wave'
        }]);
        triggerMotion('wave');
        addLog('info', 'Speech Synthesis: Auditory feedback dispatched through side speakers');
      }, 1000);

    }, 3000);
  };

  // Dispatch text commands
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
      
      if (gesturesEnabled) {
        triggerMotion(mockGesture);
      }
      addLog('info', `Speech synthesis complete. Triggered gesture: ${mockGesture}`);
    }, 1000);
  };

  // Kinetic Motion Trigger
  const triggerMotion = (motionKey) => {
    setActiveMotion(motionKey);
    addLog('info', `Actuator Module: Dispatching motion trigger [${motionKey}] to ALMotion`);

    // Calibrate mock joint angle indicators based on the gesture clicked!
    setTimeout(() => {
      if (motionKey === 'stand') {
        setJointAngles({ headYaw: 0.0, shoulderPitch: -10.5, elbowRoll: -12.4, hipPitch: 0.0 });
        addLog('info', 'MotInfo: Posture [StandUp] execution verified by joint encoders');
      } else if (motionKey === 'sit') {
        setJointAngles({ headYaw: 0.0, shoulderPitch: 82.3, elbowRoll: -22.5, hipPitch: -74.2 });
        addLog('info', 'MotInfo: Posture [SitDown] execution verified by joint encoders');
      } else if (motionKey === 'relax') {
        setJointAngles({ headYaw: 0.0, shoulderPitch: 88.2, elbowRoll: -8.4, hipPitch: -80.6 });
        addLog('info', 'MotInfo: Posture [Relax] execution verified by joint encoders');
      } else if (motionKey === 'wave') {
        setJointAngles(prev => ({ ...prev, shoulderPitch: -65.2, elbowRoll: 42.6 }));
        addLog('info', 'MotInfo: Gesture [WaveHand] execution complete');
      } else if (motionKey === 'thinking') {
        setJointAngles(prev => ({ ...prev, headYaw: -14.2, shoulderPitch: 45.3 }));
        addLog('info', 'MotInfo: Gesture [Thinking] execution complete');
      } else if (motionKey === 'bow') {
        setJointAngles(prev => ({ ...prev, hipPitch: -32.4 }));
        addLog('info', 'MotInfo: Gesture [Bowing] execution complete');
      }
      setActiveMotion('');
    }, 800);
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
        
        {/* ================= LEFT COLUMN: TELEMETRY & MOTIONS ================= */}
        <section className="telemetry-col">
          {/* Telemetry Panel */}
          <div className="glass-panel">
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
          </div>

          {/* NEW: Kinetic Motions Module Panel */}
          <div className="glass-panel kinetic-motion-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Move size={16} style={{ color: 'var(--secondary)' }} />
                <h3>Kinetic Actuators</h3>
              </div>
              <span className="panel-subtitle" style={{ color: 'var(--secondary)' }}>ALMotion</span>
            </div>

            {/* Live Joint Position Indicators */}
            <div className="joint-monitor-grid">
              <div className="joint-card">
                <span className="joint-name">Head Yaw</span>
                <span className="joint-angle-value">{jointAngles.headYaw.toFixed(1)}°</span>
              </div>
              <div className="joint-card">
                <span className="joint-name">L-Shoulder Pitch</span>
                <span className="joint-angle-value">{jointAngles.shoulderPitch.toFixed(1)}°</span>
              </div>
              <div className="joint-card">
                <span className="joint-name">L-Elbow Roll</span>
                <span className="joint-angle-value">{jointAngles.elbowRoll.toFixed(1)}°</span>
              </div>
              <div className="joint-card">
                <span className="joint-name">L-Hip Pitch</span>
                <span className="joint-angle-value">{jointAngles.hipPitch.toFixed(1)}°</span>
              </div>
            </div>

            {/* Posture Controls */}
            <div className="motion-category">
              <span className="category-title">Posture Shifts</span>
              <div className="motion-buttons-grid">
                {[
                  { name: 'Stand Up', key: 'stand' },
                  { name: 'Sit Down', key: 'sit' },
                  { name: 'Relax', key: 'relax' }
                ].map((act) => (
                  <button 
                    key={act.key} 
                    className={`motion-action-btn ${activeMotion === act.key ? 'active' : ''}`}
                    onClick={() => triggerMotion(act.key)}
                  >
                    <ChevronsUp size={14} />
                    {act.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Gestural Controls */}
            <div className="motion-category">
              <span className="category-title">Social Gestures</span>
              <div className="motion-buttons-grid">
                {[
                  { name: 'Wave Hand', key: 'wave' },
                  { name: 'Thinking', key: 'thinking' },
                  { name: 'Bowing', key: 'bow' }
                ].map((act) => (
                  <button 
                    key={act.key} 
                    className={`motion-action-btn ${activeMotion === act.key ? 'active' : ''}`}
                    onClick={() => triggerMotion(act.key)}
                  >
                    <Sparkles size={14} />
                    {act.name}
                  </button>
                ))}
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

            {/* NEW: Speech Recognition panel */}
            <div className={`voice-recognition-panel ${isListening ? 'active' : ''}`}>
              <button 
                type="button" 
                className={`mic-activation-btn ${isListening ? 'active' : ''}`}
                onClick={handleMicClick}
                title={isListening ? 'Mute Speech Capture' : 'Activate Speech Recognition'}
              >
                {isListening ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <div className="voice-wave">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className="wave-bar"
                    style={{ 
                      animationDuration: isListening ? `${0.4 + Math.random() * 0.6}s` : '0s',
                      height: isListening ? undefined : '4px'
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', uppercase: true, letterSpacing: '0.5px' }}>
                  {isListening ? 'Whisper Listening...' : 'Speech Recognition'}
                </span>
                <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
                  {isListening ? 'STREAMING ACTIVE' : speechConfidence > 0 ? `Confidence: ${speechConfidence}%` : 'TAP MIC TO OVERRIDE'}
                </span>
              </div>
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
