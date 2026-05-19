import React from 'react';
import { User } from 'lucide-react';
import * as api from '../services/api';

export default function StatusMonitor({ status }) {
  const isLifeActive = status.life_state !== 'disabled';

  const handleToggleLife = async () => {
    const newState = isLifeActive ? 'disabled' : 'interactive';
    await api.toggleLife(newState);
  };

  return (
    <div className="glass-card p-8 flex flex-col justify-center items-center text-center gap-4 relative overflow-hidden group">
      <div className="absolute inset-0 bg-primary/5 -z-10 group-hover:bg-primary/10 transition-all duration-700"></div>
      
      <div className="p-6 border border-primary/20 bg-primary/5 relative transform group-hover:scale-105 transition-transform duration-500">
         <User size={48} className="text-primary group-hover:drop-shadow-[0_0_10px_rgba(0,242,255,0.8)]" />
         <div className="tech-corner top-left"></div>
         <div className="tech-corner bottom-right"></div>
      </div>
      
      <div>
         <h3 className="text-2xl font-black uppercase tracking-tighter">
           {status.name} <span className="text-primary">{status.mock_mode ? 'X-SIM' : 'X-REAL'}</span>
         </h3>
         <div className="flex flex-col gap-2 mt-2">
            <button 
              onClick={handleToggleLife}
              className={`px-4 py-1 text-[8px] font-black tracking-widest border transition-all ${
                isLifeActive 
                ? 'bg-accent/20 border-accent text-accent animate-pulse' 
                : 'bg-green-500/20 border-green-500 text-green-500'
              }`}
            >
              {isLifeActive ? 'AUTONOMOUS_LIFE: ON' : 'SAFE_MODE: ACTIVE'}
            </button>
            <p className="text-[7px] font-mono text-primary/40 uppercase tracking-[0.2em]">
              Core_Sync: {status.life_state}
            </p>
         </div>
      </div>
      
      <div className="flex gap-2">
         <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-bold border border-primary/20">NAOQI 2.8</span>
         <span className="px-3 py-1 bg-slate-900 text-slate-500 text-[8px] font-bold">OS_V1.0</span>
      </div>

      <div className="w-full mt-4 h-[2px] bg-slate-800 relative">
        <div 
          className="absolute h-full bg-primary shadow-[0_0_10px_rgba(0,242,255,0.5)] transition-all duration-1000"
          style={{ width: `${status.battery}%` }}
        ></div>
      </div>
      <span className="text-[8px] font-mono text-primary/40 uppercase">Power_Level: {status.battery}%</span>
    </div>
  );
}
