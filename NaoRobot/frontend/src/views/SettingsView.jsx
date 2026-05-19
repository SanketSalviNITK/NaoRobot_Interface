import React, { useState } from 'react';
import { RotateCcw, Shield, Cpu, Sliders, Bell, HardDrive } from 'lucide-react';
import { toggleLife } from '../services/api';

export default function SettingsView({ status }) {
  const [lifeState, setLifeState] = useState(status.life_state || 'disabled');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleLife = async () => {
    const newState = lifeState === 'disabled' ? 'interactive' : 'disabled';
    setIsUpdating(true);
    try {
      await toggleLife(newState);
      setLifeState(newState);
    } catch (e) {
      console.error('Failed to toggle autonomous life', e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 p-8 flex flex-col gap-8 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">System <span className="text-primary">Configuration</span></h2>
        <p className="text-[10px] font-mono text-primary/40 uppercase tracking-[0.3em]">Hardware & Neural Interface Parameters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Autonomous Life Section */}
        <div className="glass-panel p-6 flex flex-col gap-6 border-l-2 border-l-primary/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <RotateCcw size={24} className={`text-primary ${lifeState !== 'disabled' ? 'animate-spin-slow' : ''}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Autonomous Life</span>
              <span className="text-[9px] font-mono text-primary/40 uppercase">ALAutonomousLife Service</span>
            </div>
          </div>
          
          <p className="text-xs text-white/50 leading-relaxed">
            When enabled, the robot will move naturally, track faces, and respond to environmental stimuli even when no commands are being sent.
          </p>

          <div className="flex items-center justify-between bg-black/20 p-4 rounded border border-white/5">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-mono text-white/30 uppercase">Current State</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${lifeState === 'disabled' ? 'text-accent' : 'text-green'}`}>
                {lifeState.toUpperCase()}
              </span>
            </div>
            <button 
              onClick={handleToggleLife}
              disabled={isUpdating}
              className={`px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                lifeState === 'disabled' 
                  ? 'bg-primary/20 text-primary border border-primary/40 hover:bg-primary hover:text-white' 
                  : 'bg-accent/20 text-accent border border-accent/40 hover:bg-accent hover:text-white'
              }`}
            >
              {isUpdating ? 'SYNCING...' : lifeState === 'disabled' ? 'INITIALIZE' : 'TERMINATE'}
            </button>
          </div>
        </div>

        {/* Neural Security */}
        <div className="glass-panel p-6 flex flex-col gap-6 border-l-2 border-l-accent/30 opacity-60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
              <Shield size={24} className="text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Security Protocol</span>
              <span className="text-[9px] font-mono text-accent/40 uppercase">Encrypted Link 2.0</span>
            </div>
          </div>
          <p className="text-xs text-white/50">Connection is secured via hardware-level encryption. Neural buffers are flushed every 300s.</p>
          <div className="mt-auto flex items-center justify-between text-[8px] font-mono text-white/20 uppercase tracking-widest">
            <span>Level: Alpha-1</span>
            <span>Status: Verified</span>
          </div>
        </div>

        {/* Diagnostic Tools */}
        <div className="glass-panel p-6 flex flex-col gap-4 col-span-1 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Sliders size={18} className="text-primary/60" />
               <span className="text-[10px] font-black uppercase tracking-widest text-white">System Diagnostics</span>
            </div>
            <span className="text-[8px] font-mono text-white/20 uppercase">Core_v2.7</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Neural Engine', icon: Cpu, val: 'OPTIMAL' },
              { label: 'Packet Buffer', icon: HardDrive, val: '1024KB' },
              { label: 'Telemetry Link', icon: Bell, val: '12ms' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded flex flex-col gap-2">
                <item.icon size={14} className="text-primary/40" />
                <span className="text-[8px] font-mono text-white/40 uppercase">{item.label}</span>
                <span className="text-[10px] font-black text-white">{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
