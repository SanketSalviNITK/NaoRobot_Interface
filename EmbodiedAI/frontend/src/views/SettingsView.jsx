import React, { useState } from 'react';
import { 
  RotateCcw, Shield, Cpu, Sliders, Bell, HardDrive, 
  Volume2, VolumeX, Eye, EyeOff, Mic, MicOff, 
  Database, Sparkles, Activity, ToggleLeft, ToggleRight
} from 'lucide-react';

export default function SettingsView({ status = {} }) {
  // 1. Behavior & Motor Toggles
  const [lifeState, setLifeState] = useState(status.life_state || 'disabled');
  const [awareness, setAwareness] = useState(true);
  const [fallManager, setFallManager] = useState(true);

  // 2. AI & Cognitive Toggles
  const [micLoop, setMicLoop] = useState(true);
  const [gesturesEnabled, setGesturesEnabled] = useState(true);
  const [ragMode, setRagMode] = useState(false);

  // 3. sensory & feedback toggles
  const [ledFeedback, setLedFeedback] = useState(true);
  const [audioVolume, setAudioVolume] = useState(true);

  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleLife = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setLifeState(prev => prev === 'disabled' ? 'interactive' : 'disabled');
      setIsUpdating(false);
    }, 600);
  };

  return (
    <div className="flex-1 p-8 flex flex-col gap-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HUD Header */}
      <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
          System <span className="text-primary">Configuration</span>
        </h2>
        <p className="text-[10px] font-mono text-primary/40 uppercase tracking-[0.3em]">
          Hardware, Cognitive & Neural Interface Matrix
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ================= SECTION 1: PHYSICAL SERVICES ================= */}
        <div className="glass-panel p-6 flex flex-col gap-6 border-t-2 border-t-primary/30 md:col-span-1">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Cpu size={18} className="text-primary" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Physical & Motors</h3>
          </div>

          {/* Autonomous Life Toggle */}
          <div className="flex flex-col gap-3 bg-white/5 p-4 rounded border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Autonomous Life</span>
              <button 
                onClick={handleToggleLife}
                disabled={isUpdating}
                className={`text-xs ${lifeState === 'disabled' ? 'text-white/40' : 'text-primary'}`}
              >
                {lifeState === 'disabled' ? <ToggleLeft size={24} /> : <ToggleRight size={24} />}
              </button>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Blends organic breathing and micro-movements to make the robot look alive.
            </p>
            <span className="text-[8px] font-mono text-primary/30 uppercase mt-1">Status: {lifeState.toUpperCase()}</span>
          </div>

          {/* Basic Awareness Toggle */}
          <div className="flex flex-col gap-3 bg-white/5 p-4 rounded border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Basic Awareness</span>
              <button onClick={() => setAwareness(!awareness)} className="text-xs">
                {awareness ? <ToggleRight size={24} className="text-primary" /> : <ToggleLeft size={24} className="text-white/40" />}
              </button>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Enables active head tracking to follow faces and turn towards sharp noises.
            </p>
            <span className="text-[8px] font-mono text-primary/30 uppercase mt-1">Status: {awareness ? 'ACTIVE' : 'LOCKED'}</span>
          </div>

          {/* Fall Manager Safety Toggle */}
          <div className="flex flex-col gap-3 bg-white/5 p-4 rounded border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Fall Protection</span>
              <button onClick={() => setFallManager(!fallManager)} className="text-xs">
                {fallManager ? <ToggleRight size={24} className="text-primary" /> : <ToggleLeft size={24} className="text-white/40" />}
              </button>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Cuts joint power instantly if balance is lost to absorb impact and protect gear assemblies.
            </p>
            <span className="text-[8px] font-mono text-accent/50 uppercase mt-1">Safety: {fallManager ? 'SECURED' : 'BYPASSED'}</span>
          </div>
        </div>

        {/* ================= SECTION 2: AI & NEURAL COGNITION ================= */}
        <div className="glass-panel p-6 flex flex-col gap-6 border-t-2 border-t-accent/30 md:col-span-1">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Activity size={18} className="text-accent" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Cognition & Neural</h3>
          </div>

          {/* Mic Loop Toggle */}
          <div className="flex flex-col gap-3 bg-white/5 p-4 rounded border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {micLoop ? <Mic size={14} className="text-accent" /> : <MicOff size={14} className="text-white/30" />}
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Mic Ingestion Loop</span>
              </div>
              <button onClick={() => setMicLoop(!micLoop)} className="text-xs">
                {micLoop ? <ToggleRight size={24} className="text-accent" /> : <ToggleLeft size={24} className="text-white/40" />}
              </button>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Controls whether the robot continuously listens and captures audio via SFTP.
            </p>
            <span className="text-[8px] font-mono text-accent/30 uppercase mt-1">STRATEGY: RECORD-AND-FETCH</span>
          </div>

          {/* Physical Gestures Toggle */}
          <div className="flex flex-col gap-3 bg-white/5 p-4 rounded border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className={gesturesEnabled ? "text-accent" : "text-white/30"} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Physical Gestures</span>
              </div>
              <button onClick={() => setGesturesEnabled(!gesturesEnabled)} className="text-xs">
                {gesturesEnabled ? <ToggleRight size={24} className="text-accent" /> : <ToggleLeft size={24} className="text-white/40" />}
              </button>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Allows the AI model to perform full arm and head motions corresponding to speech mood.
            </p>
            <span className="text-[8px] font-mono text-accent/30 uppercase mt-1">Behavior: {gesturesEnabled ? 'ENABLED' : 'MUTED'}</span>
          </div>

          {/* RAG Context Boost Toggle */}
          <div className="flex flex-col gap-3 bg-white/5 p-4 rounded border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={14} className={ragMode ? "text-accent" : "text-white/30"} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">RAG Context Boost</span>
              </div>
              <button onClick={() => setRagMode(!ragMode)} className="text-xs">
                {ragMode ? <ToggleRight size={24} className="text-accent" /> : <ToggleLeft size={24} className="text-white/40" />}
              </button>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Instructs the LLM brain to pull local documentation before building responses.
            </p>
            <span className="text-[8px] font-mono text-accent/30 uppercase mt-1">Source: ChromaDB Local</span>
          </div>
        </div>

        {/* ================= SECTION 3: SENSORY & FEEDBACK ================= */}
        <div className="glass-panel p-6 flex flex-col gap-6 border-t-2 border-t-white/30 md:col-span-1">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Sliders size={18} className="text-white/70" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Sensory & Feedback</h3>
          </div>

          {/* LED Feedback Indicators Toggle */}
          <div className="flex flex-col gap-3 bg-white/5 p-4 rounded border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {ledFeedback ? <Eye size={14} className="text-white" /> : <EyeOff size={14} className="text-white/30" />}
                <span className="text-[10px] font-black uppercase tracking-widest text-white">LED Status Cues</span>
              </div>
              <button onClick={() => setLedFeedback(!ledFeedback)} className="text-xs">
                {ledFeedback ? <ToggleRight size={24} className="text-white" /> : <ToggleLeft size={24} className="text-white/40" />}
              </button>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Triggers visual green (listening) and white (thinking) blinks on NAO's eye arrays.
            </p>
            <span className="text-[8px] font-mono text-white/20 uppercase mt-1">Hardware: FaceLeds</span>
          </div>

          {/* Speech Synthesis Mute Switch */}
          <div className="flex flex-col gap-3 bg-white/5 p-4 rounded border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {audioVolume ? <Volume2 size={14} className="text-white" /> : <VolumeX size={14} className="text-white/30" />}
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Speech Synthesis</span>
              </div>
              <button onClick={() => setAudioVolume(!audioVolume)} className="text-xs">
                {audioVolume ? <ToggleRight size={24} className="text-white" /> : <ToggleLeft size={24} className="text-white/40" />}
              </button>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Mutes or activates the physical speakers on the side of the robot's head.
            </p>
            <span className="text-[8px] font-mono text-white/20 uppercase mt-1">Speaker: {audioVolume ? 'ACTIVE' : 'MUTED'}</span>
          </div>
        </div>

      </div>

      {/* Dynamic Link Diagnostic Bar */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
             <Shield size={18} className="text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white">Diagnostic Interface Link</span>
          </div>
          <span className="text-[8px] font-mono text-white/20 uppercase">Core API Server Active</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Neural Engine', icon: Cpu, val: 'ACTIVE (GEMMA-4)' },
            { label: 'Local Whisper', icon: HardDrive, val: 'OPTIMAL (BASE)' },
            { label: 'Hardware Latency', icon: Bell, val: '7ms' },
            { label: 'Interface Security', icon: Shield, val: 'VERIFIED' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded flex flex-col gap-2 hover:bg-white/10 transition-all">
              <item.icon size={14} className="text-primary/60" />
              <span className="text-[8px] font-mono text-white/40 uppercase">{item.label}</span>
              <span className="text-[10px] font-black text-white">{item.val}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
