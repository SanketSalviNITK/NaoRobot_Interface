import React from 'react';
import { Wifi, Zap } from 'lucide-react';

export default function NeuralLink({ ip, setIp, loading, onConnect, onSimulate }) {
  return (
    <div className="glass-card p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <Wifi size={14} className="text-primary" /> 01 // Uplink Protocol
        </h2>
        <span className="text-[8px] font-mono opacity-30">PORT: 9559</span>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <label className="text-[8px] font-mono text-primary/60 uppercase">Target_IP_Coordinates</label>
          <input 
            className="w-full text-xs"
            placeholder="0.0.0.0" 
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />
        </div>
        <button 
          className="btn-primary w-full justify-center py-4 text-xs font-black group"
          onClick={() => onConnect(false)}
          disabled={loading || !ip}
        >
          <Zap size={14} className="group-hover:animate-pulse" />
          {loading ? 'SYNCHRONIZING...' : 'ESTABLISH NEURAL LINK'}
        </button>
        <button 
          className="btn-outline w-full py-2 text-[9px] opacity-40 hover:opacity-100 transition-opacity"
          onClick={() => onSimulate(true)}
        >
          INITIALIZE VIRTUAL_CORE
        </button>
      </div>
    </div>
  );
}
