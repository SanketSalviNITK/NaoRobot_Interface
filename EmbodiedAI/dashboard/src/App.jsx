import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import NaoModel from './NaoModel';
import PresentationSandbox from './components/PresentationSandbox';
import { 
  Activity, Cpu, Sliders, Volume2, VolumeX, Eye, EyeOff, 
  Mic, MicOff, Database, Sparkles, Shield, HardDrive, 
  Bell, Send, UploadCloud, BatteryCharging, Wifi, 
  ChevronsUp, ChevronsDown, Move, Speech, HelpCircle, 
  Volume, AlertCircle, Trash2
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
  const [robotVolume, setRobotVolume] = useState(50);

  // 4. Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechConfidence, setSpeechConfidence] = useState(0);

  // 5. Kinetic Motions Module States
  const [activeMotion, setActiveMotion] = useState('');
  const [joints, setJoints] = useState({});
  const [showJoints, setShowJoints] = useState(false);

  // 6. Live Telemetry State
  const [battery, setBattery] = useState(88);
  const [jointTemp, setJointTemp] = useState(38.4);
  const [latency, setLatency] = useState(12);
  const [inferenceTime, setInferenceTime] = useState(1.42);

  // 6.5. Telemetry Connection Mode
  const [telemetryMode, setTelemetryMode] = useState('offline');

  // Sandbox Mode State
  const [sandboxMode, setSandboxMode] = useState(false);

  // Twin Connection State
  const [twinConnected, setTwinConnected] = useState(true);
  const twinConnectedRef = useRef(twinConnected);
  useEffect(() => {
    twinConnectedRef.current = twinConnected;
  }, [twinConnected]);

  // RAG Files State
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // 7. Chat Console State
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Holographic interface stabilized. I am ready to assist.', gesture: 'explain' },
  ]);
  const [inputText, setInputText] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState(null);

  // 8. Real-time Logs State
  const [logs, setLogs] = useState([
    { id: 1, time: '12:00:04', level: 'info', text: 'ALBroker initialized successfully at 169.254.175.100:5001' },
    { id: 2, time: '12:00:05', level: 'info', text: 'LM Studio server detected on local interfaces' },
    { id: 3, time: '12:00:08', level: 'info', text: 'Speech synthesis module loaded (Volume: 1.0)' },
  ]);

  const chatEndRef = useRef(null);
  const logsEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fluctuating Telemetry Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => Math.max(8, Math.min(20, prev + (Math.random() > 0.5 ? 1 : -1))));
      setJointTemp(prev => Math.max(37, Math.min(42, prev + parseFloat((Math.random() * 0.2 - 0.1).toFixed(2)))));
      setInferenceTime(prev => Math.max(1.1, Math.min(1.9, prev + parseFloat((Math.random() * 0.1 - 0.05).toFixed(2)))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

  // Fast Telemetry Polling (10Hz)
  useEffect(() => {
    const fetchTelemetry = () => {
      fetch('http://localhost:5002/telemetry')
        .then(res => res.json())
        .then(data => {
          setTelemetryMode(data.mode); // 'live' or 'mock'
          if (data.joints && twinConnectedRef.current) {
            setJoints(data.joints);
          }
          if (data.battery !== undefined && data.battery !== 0) {
            setBattery(data.battery);
          }
          if (data.temperature !== undefined && data.temperature !== 0) {
            setJointTemp(data.temperature);
          }
        })
        .catch(() => {
          setTelemetryMode('offline');
        });
    };
    
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 100); // 10Hz
    return () => clearInterval(interval);
  }, []);

  // Fetch initial ingested docs
  useEffect(() => {
    fetch('http://localhost:5002/docs')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.documents) {
          const loadedDocs = data.documents.map(d => ({ ...d, active: true }));
          setUploadedFiles(loadedDocs);
          if (loadedDocs.length > 0) setRagMode(true);
        }
      })
      .catch(err => addLog('error', `Failed to fetch existing documents: ${err.message}`));
  }, []);

  // Speech Recognition Mic Click Handler
  const handleMicClick = () => {
    if (isListening) {
      addLog('warn', 'Voice Recognition: Already listening for input...');
      return;
    }

    setIsListening(true);
    setSpeechConfidence(0);
    addLog('info', 'Voice Ingestion: Activating Laptop Microphone... Please speak now.');
    
    const activeDocs = uploadedFiles.filter(f => f.active).map(f => f.name);

    fetch('http://localhost:5002/voice/listen', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active_docs: activeDocs })
    })
      .then(res => res.json())
      .then(data => {
        setIsListening(false);
        if (data.status === 'success') {
          setSpeechConfidence(98.5); // Visual confidence score
          const recognizedText = data.recognized_text;
          addLog('info', `Google STT (en-IN): Audio transcribed: "${recognizedText}"`);
          
          const userMsg = { id: Date.now(), sender: 'user', text: `[Voice] "${recognizedText}"` };
          setMessages(prev => [...prev, userMsg]);
          
          // The backend already dispatches the physical motion to the bridge, we just update the chat UI
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: 'bot',
            text: data.speech,
            gesture: data.gesture !== 'none' ? data.gesture : null,
            source_images: data.source_images || []
          }]);
          
          if (data.gesture !== 'none') {
             addLog('info', `Actuator Module: AI decided on motion [${data.gesture}]`);
             setActiveMotion(data.gesture);
             setTimeout(() => setActiveMotion(''), 800);
          }
        } else {
          addLog('error', `Voice processing error: ${data.message || 'Unknown error'}`);
        }
      })
      .catch(err => {
        setIsListening(false);
        addLog('error', `Voice fetch error: ${err.message}`);
      });
  };

  // Dispatch text commands
  const handleSendMessage = (e, customText = null) => {
    if (e && e.preventDefault) e.preventDefault();
    
    const textToSend = typeof customText === 'string' ? customText : inputText;
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    addLog('info', `Dispatched speech command: "${textToSend}"`);
    
    if (typeof customText !== 'string') {
      setInputText('');
    }

    const activeDocs = uploadedFiles.filter(f => f.active).map(f => f.name);

    fetch('http://localhost:5002/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToSend, rag_mode: ragMode, active_docs: activeDocs })
    })
    .then(res => res.json())
    .then(data => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.speech || "No response received.",
        gesture: data.gesture !== 'none' ? data.gesture : null,
        source_images: data.source_images || []
      }]);
      addLog('info', `Speech synthesis complete. Triggered gesture: ${data.gesture}`);
    })
    .catch(err => {
      addLog('error', `Chat relay error: ${err.message}`);
    });
  };

  // Kinetic Motion Trigger
  const triggerMotion = (motionKey) => {
    setActiveMotion(motionKey);
    addLog('info', `Actuator Module: Dispatching motion trigger [${motionKey}] to ALMotion`);

    fetch('http://localhost:5002/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: motionKey })
    })
    .then(() => {
      setTimeout(() => {
        addLog('info', `MotInfo: Actuator sequence [${motionKey}] dispatched to stream.`);
        setActiveMotion('');
      }, 800);
    })
    .catch(err => {
      // In sandbox mode, it's expected to fail if minimal_ai isn't running
      if (!sandboxMode) {
        addLog('error', `Command relay error: ${err.message}`);
      } else {
        setTimeout(() => setActiveMotion(''), 800);
      }
    });
  };

  const handleVolumeChange = (e) => {
    const vol = parseInt(e.target.value, 10);
    setRobotVolume(vol);
    fetch('http://localhost:5002/volume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volume: vol })
    })
    .then(res => res.json())
    .then(data => {
       if (data.status === 'success') {
         addLog('info', `Volume adjusted to ${vol}%`);
       }
    })
    .catch(err => {
       addLog('error', `Failed to set volume: ${err.message}`);
    });
  };

  const handleToggle = (name, setter, val) => {
    const newState = !val;
    setter(newState);
    
    let featureKey = "";
    if (name === "Autonomous Life") featureKey = "autonomous_life";
    else if (name === "Basic Awareness") featureKey = "basic_awareness";
    // We can add fall protection and led cues here later when implemented
    
    if (featureKey) {
      fetch('http://localhost:5002/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: featureKey, state: newState })
      })
      .then(res => res.json())
      .then(data => {
        if(data.status === 'success' || data.status === 'ok') {
           addLog('warn', `System configured: "${name}" changed to ${newState ? 'ON' : 'OFF'} [HARDWARE SYNCED]`);
        } else {
           addLog('error', `Hardware sync failed for ${name}: ${data.reason || data.message}`);
           setter(val); // Revert state on failure
        }
      })
      .catch(err => {
        addLog('error', `Network error syncing ${name}: ${err.message}`);
        setter(val); // Revert state on failure
      });
    } else {
      addLog('warn', `System configured: Changed "${name}" parameter to ${newState ? 'ON' : 'OFF'}`);
    }
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    addLog('info', `Cognitive Engine: Uploading document ${file.name}...`);
    
    const formData = new FormData();
    formData.append('file', file);

    fetch('http://localhost:5002/upload_doc', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        addLog('info', `Cognitive Engine: Document segmented and embedded successfully (${data.chunks} chunks)!`);
        setRagMode(true);
        setUploadedFiles(prev => [...prev, { name: data.filename, size: data.size || 'Unknown', chunks: data.chunks, active: true }]);
      } else {
        addLog('error', `Cognitive Engine: Upload failed: ${data.message}`);
      }
    })
    .catch(err => {
      addLog('error', `Cognitive Engine: Network error during upload: ${err.message}`);
    });
    
    // Reset input
    e.target.value = null;
  };

  const toggleDocActive = (idx) => {
    const docName = uploadedFiles[idx].name;
    const newState = !uploadedFiles[idx].active;
    addLog('info', `Cognitive Engine: Context visibility for ${docName} set to ${newState ? 'ACTIVE' : 'INACTIVE'}`);
    
    setUploadedFiles(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], active: newState };
      return updated;
    });
  };

  const handleDeleteDoc = (idx) => {
    const docToDelete = uploadedFiles[idx];
    addLog('warn', `Cognitive Engine: Initiating memory purge for ${docToDelete.name}...`);
    
    fetch('http://localhost:5002/delete_doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: docToDelete.name })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        addLog('info', `Cognitive Engine: Purge successful. Vector DB chunks for ${docToDelete.name} destroyed.`);
        setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
      } else {
        addLog('error', `Cognitive Engine: Purge failed: ${data.message}`);
      }
    })
    .catch(err => addLog('error', `Cognitive Engine: Network error during purge: ${err.message}`));
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
          <button 
            className={`motion-action-btn ${sandboxMode ? 'active' : ''}`}
            onClick={() => setSandboxMode(!sandboxMode)}
            style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid var(--primary)', borderRadius: '4px', background: sandboxMode ? 'var(--primary)' : 'transparent', color: sandboxMode ? '#000' : 'var(--primary)', cursor: 'pointer' }}
          >
            {sandboxMode ? 'Exit Presentation Mode' : 'Presentation Mode'}
          </button>
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
      <main className="dashboard-grid" style={{ gridTemplateColumns: sandboxMode ? '1fr 1fr' : '300px 1fr 300px' }}>
        
        {/* ================= LEFT COLUMN: TELEMETRY & MOTIONS ================= */}
        {!sandboxMode && (
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

          {/* Telemetry Stream Integration Panel */}
          <div className="glass-panel" style={{ border: telemetryMode === 'live' ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)', transition: 'border 0.3s ease' }}>
            <div className="panel-header">
              <div className="panel-title">
                <Database size={16} className={telemetryMode === 'live' ? "cyan" : "gray"} style={{ animation: telemetryMode === 'live' ? 'pulse-cyan 2s infinite' : 'none' }} />
                <h3>Joint Telemetry Stream</h3>
              </div>
              <span className="panel-subtitle" style={{ color: telemetryMode === 'live' ? 'var(--primary)' : '#888' }}>
                {telemetryMode.toUpperCase()}
              </span>
            </div>

            <div className="telemetry-card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="telemetry-label" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bridge Polling</span>
                <span style={{ 
                  fontSize: '9px', 
                  fontFamily: 'var(--font-mono)', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  background: telemetryMode === 'live' ? 'rgba(0, 255, 170, 0.1)' : 'rgba(255, 170, 0, 0.1)',
                  color: telemetryMode === 'live' ? '#00ffa6' : '#ffaa00',
                  border: telemetryMode === 'live' ? '1px solid rgba(0, 255, 170, 0.2)' : '1px solid rgba(255, 170, 0, 0.2)'
                }}>
                  {telemetryMode === 'live' ? "ACTIVE (10Hz)" : telemetryMode === 'mock' ? "MOCK (10Hz)" : "OFFLINE"}
                </span>
              </div>
            </div>
          </div>

          {/* Kinetic Motions Module Panel */}
          <div className="glass-panel kinetic-motion-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Move size={16} style={{ color: 'var(--secondary)' }} />
                <h3>Kinetic Actuators</h3>
              </div>
              <span className="panel-subtitle" style={{ color: 'var(--secondary)' }}>ALMotion</span>
            </div>

            {/* Note: Manual sliders removed. UI is now fully data-driven by the backend telemetry stream. */}

            {/* Posture Controls */}
            <div className="motion-category">
              <span className="category-title">Posture Shifts</span>
              <div className="motion-buttons-grid">
                {[
                  { name: 'Stand Up', key: 'stand' },
                  { name: 'Sit Down', key: 'sit' },
                  { name: 'Crouch', key: 'crouch' },
                  { name: 'Bow', key: 'bow' }
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
              <div className="motion-buttons-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {[
                  { name: 'Wave', key: 'wave_right_hand' },
                  { name: 'Cheer', key: 'cheer' },
                  { name: 'Shrug', key: 'shrug' },
                  { name: 'Facepalm', key: 'facepalm' },
                  { name: 'Deny', key: 'deny' },
                  { name: 'Present', key: 'present' },
                  { name: 'Beckon', key: 'beckon' },
                  { name: 'Point L', key: 'point_left' },
                  { name: 'Point R', key: 'point_right' },
                  { name: 'Thinking', key: 'thinking' }
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
        )}

        {/* ================= MIDDLE COLUMN: INTERACTIVE CONSOLE ================= */}
        <section className="console-col" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* 3D Model Viewer Canvas */}
          <div className="glass-panel" style={{ flex: '1 1 55%', minHeight: '400px', display: 'flex', flexDirection: 'column', position: 'relative', padding: 0, overflow: 'hidden' }}>
            <div className="panel-header" style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 10, background: 'rgba(10,15,20,0.6)', padding: '5px 10px', borderRadius: '8px', border: '1px solid rgba(0, 200, 255, 0.2)' }}>
              <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Eye size={16} className="cyan" />
                  <h3 style={{ margin: 0, fontSize: '12px' }}>Interactive Digital Twin</h3>
                </div>
                <button 
                  onClick={() => setTwinConnected(!twinConnected)}
                  style={{
                    background: twinConnected ? 'rgba(0, 255, 166, 0.2)' : 'rgba(255, 50, 50, 0.2)',
                    border: `1px solid ${twinConnected ? '#00ffa6' : '#ff3232'}`,
                    color: twinConnected ? '#00ffa6' : '#ff3232',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginLeft: '8px'
                  }}
                >
                  {twinConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </button>
              </div>
            </div>
            
            <Canvas camera={{ position: [0, 0.3, 1.2], fov: 45 }} style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,20,30,0.5), rgba(0,10,15,0.8))' }}>
              <Suspense fallback={null}>
                <NaoModel joints={joints} />
              </Suspense>
            </Canvas>

            {/* Collapsible Motor Encoders Overlay */}
            <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10, background: 'rgba(10,15,20,0.8)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0, 200, 255, 0.2)', maxWidth: '200px', minWidth: '160px', backdropFilter: 'blur(4px)' }}>
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: showJoints ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingBottom: showJoints ? '8px' : '0', marginBottom: showJoints ? '8px' : '0' }} 
                onClick={() => setShowJoints(!showJoints)}
              >
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '1px' }}>MOTOR ENCODERS</span>
                {showJoints ? <ChevronsUp size={14} className="cyan" /> : <ChevronsDown size={14} className="cyan" />}
              </div>
              {showJoints && (
                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '4px' }} className="custom-scrollbar">
                  {Object.keys(joints).length > 0 ? (
                    Object.keys(joints).map(joint => (
                      <div key={joint} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: '#ccc' }}>{joint}</span>
                        <span style={{ color: '#00ffa6', fontWeight: 'bold' }}>{(joints[joint] * (180 / Math.PI)).toFixed(1)}°</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '10px', color: '#888' }}>No data stream</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {!sandboxMode && (
          <div className="glass-panel" style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header">
              <div className="panel-title">
                <Sliders size={16} className="cyan" />
                <h3>Dialogue Controller</h3>
              </div>
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
            <div className="chat-box" style={{ flex: 1, minHeight: '120px' }}>
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
          </div>
          )}
        </section>

        {/* ================= RIGHT COLUMN: BEHAVIOR MATRIX OR SANDBOX ================= */}
        {!sandboxMode ? (
        <section className="toggles-col">
          <div className="glass-panel" style={{ flex: '0 0 auto' }}>
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
                <div className="toggle-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <div className="toggle-label-group">
                    <span className="toggle-name">Speaker Volume</span>
                    <span className="toggle-desc">Adjust robot master volume.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
                    <Volume2 size={16} className="cyan" />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={robotVolume} 
                      onChange={handleVolumeChange} 
                      style={{ flex: 1, accentColor: 'var(--cyan)' }}
                    />
                    <span style={{ color: 'var(--cyan)', fontSize: '0.8rem', minWidth: '30px' }}>{robotVolume}%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RAG Knowledge Base Panel */}
          <div className="glass-panel" style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: '300px' }}>
            <div className="panel-header">
              <div className="panel-title">
                <Database size={16} className="cyan" />
                <h3>RAG Knowledge Base</h3>
              </div>
              <span className="panel-subtitle">Vector DB</span>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
              accept=".pdf,.txt"
            />
            <div 
              className="rag-upload-container" 
              onClick={handleFileUploadClick}
              style={{
                border: '1px dashed rgba(0, 200, 255, 0.3)',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                marginTop: '10px',
                background: 'rgba(0, 200, 255, 0.05)',
                transition: 'all 0.3s ease',
                flexShrink: 0
              }}
            >
              <UploadCloud size={24} className="cyan" />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>Upload PDF / TXT Manuals</span>
              <span style={{ fontSize: '10px', color: '#888' }}>Click to trigger cognitive ingestion</span>
            </div>

            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: '15px', overflowY: 'auto', flexGrow: 1, paddingRight: '5px' }} className="custom-scrollbar">
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>INGESTED DOCUMENTS</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} style={{ 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '6px', 
                      padding: '8px 10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="checkbox" 
                          checked={file.active} 
                          onChange={() => toggleDocActive(idx)}
                          style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                        />
                        <Database size={14} className={file.active ? "cyan" : ""} style={{ opacity: file.active ? 1 : 0.4 }} />
                        <span style={{ fontSize: '11px', color: file.active ? '#ddd' : '#666', textDecoration: file.active ? 'none' : 'line-through' }}>{file.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '9px', color: '#888', fontFamily: 'var(--font-mono)' }}>
                        <span>{file.chunks} CHUNKS</span>
                        <Trash2 
                          size={12} 
                          style={{ color: '#ff4d4d', cursor: 'pointer', marginLeft: '5px' }} 
                          onClick={() => handleDeleteDoc(idx)}
                          title="Purge Document"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Global V-RAG Source Images Stack */}
          {(() => {
            const latestWithImages = [...messages].reverse().find(m => m.source_images && m.source_images.length > 0);
            const imgs = latestWithImages ? latestWithImages.source_images : [];
            if (imgs.length === 0) return null;
            
            return (
              <div className="glass-panel" style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', padding: '15px' }}>
                <div className="panel-header" style={{ marginBottom: '10px' }}>
                  <div className="panel-title">
                    <Database size={16} className="cyan" />
                    <h3 style={{ fontSize: '12px' }}>Latest AI Context</h3>
                  </div>
                </div>
                <div className="source-images-stack" style={{ display: 'flex', cursor: 'pointer', minHeight: '65px', alignItems: 'center', justifyContent: 'center' }}>
                  {imgs.map((imgUrl, idx) => (
                    <img 
                      key={idx} 
                      src={imgUrl} 
                      alt="Source Page" 
                      onClick={() => setFullScreenImage(imgUrl)}
                      style={{
                        width: '50px',
                        height: '70px',
                        objectFit: 'cover',
                        border: '1px solid rgba(0, 200, 255, 0.6)',
                        borderRadius: '4px',
                        marginLeft: idx === 0 ? '0' : '-30px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.8)',
                        zIndex: imgs.length - idx,
                        transition: 'transform 0.2s, z-index 0s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.zIndex = 100; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.zIndex = imgs.length - idx; }}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </section>
        ) : (
          <section className="sandbox-col" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <PresentationSandbox 
              isTwinSpeaking={activeMotion !== ''}
              onTriggerSpeech={(text, gesture, sync = false) => {
                addLog('info', `Sandbox: Triggering twin speech for slide`);
                setMessages(prev => [...prev, {
                  id: Date.now(),
                  sender: 'bot',
                  text: text,
                  gesture: gesture
                }]);
                setActiveMotion(gesture);
                setTimeout(() => setActiveMotion(''), 800);
                // Actually dispatch to the bridge for audio on robot
                return fetch('http://localhost:5002/command', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: gesture, text: text, sync_speech: sync }) 
                }).catch(() => {
                   console.log("Port 5002 offline.");
                });
              }}
              onDoubtSubmit={(text) => {
                handleSendMessage(null, text);
              }}
            />
          </section>
        )}

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
      {/* FULL SCREEN IMAGE MODAL */}
      {fullScreenImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 10, 15, 0.9)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer'
          }}
          onClick={() => setFullScreenImage(null)}
        >
          <img 
            src={fullScreenImage} 
            alt="Full Source" 
            style={{
              maxHeight: '90vh',
              maxWidth: '90vw',
              border: '2px solid var(--primary)',
              boxShadow: '0 0 30px rgba(0, 255, 166, 0.2)'
            }} 
          />
        </div>
      )}
    </div>
  );
}
