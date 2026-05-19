import React from 'react';
import { Power, Wifi, Shield, Cpu } from 'lucide-react';

export default function HUDHeader({ status, onDisconnect }) {
  return (
    <header className="h-16 bg-bg-darker border-b border-panel-border flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-sm border border-panel-border flex items-center justify-center bg-white/5 shadow-inner">
             <Cpu size={18} className="text-primary/60" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-widest text-white flex items-center gap-4">
              NAO-01
              <div className="flex items-center gap-2 bg-green/5 border border-green/20 px-2.5 py-0.5 rounded-sm">
                <div className="w-1 h-1 rounded-full bg-green animate-pulse"></div>
                <span className="text-[7px] font-bold text-green uppercase tracking-widest">Linked</span>
              </div>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/40 border border-panel-border px-4 py-2 rounded-sm">
           <span className="text-[8px] font-mono text-white/20 uppercase">Uplink:</span>
           <span className="text-[10px] font-mono text-primary/80 tracking-tighter">{status.ip || '169.254.175.171'}</span>
        </div>
      </div>

      <div className="flex items-center gap-12">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-white/40 uppercase">Battery</span>
            <span className="text-[11px] font-bold">{status.battery}%</span>
            <div className="w-8 h-4 border border-white/20 rounded-sm p-0.5 relative">
               <div className="h-full bg-green rounded-xs" style={{ width: `${status.battery}%` }}></div>
               <div className="absolute -right-1 top-1 w-1 h-2 bg-white/20 rounded-r-sm"></div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-white/40 uppercase">Wi-Fi</span>
            <div className="flex items-end gap-0.5 h-3">
               <div className="w-1 h-1.5 bg-primary"></div>
               <div className="w-1 h-2.5 bg-primary"></div>
               <div className="w-1 h-3.5 bg-primary"></div>
               <div className="w-1 h-2 bg-primary/20"></div>
            </div>
          </div>
        </div>

        <button 
          onClick={onDisconnect}
          className="bg-accent/10 border border-accent hover:bg-accent hover:text-white transition-all text-accent px-4 py-2 rounded flex items-center gap-2 group"
        >
          <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center">
            <div className="w-2 h-2 bg-current rounded-full group-hover:scale-125 transition-transform"></div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Emergency Stop</span>
        </button>
      </div>
    </header>
  );
}
