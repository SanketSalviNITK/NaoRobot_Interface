import React from 'react';
import { Wifi, Search, ShieldCheck } from 'lucide-react';

export default function ConnectionView({ ip, setIp, onConnect, onSimulate, loading }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-bg-darker p-4">
      <div className="glass-panel w-full max-w-[420px] p-8 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex justify-between items-start border-b border-white/5 pb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Neural <span className="text-primary">Link</span></h2>
            <p className="text-[9px] font-mono text-primary/40 uppercase tracking-[0.3em]">Hardware Pairing Protocol</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-accent/20 flex items-center justify-center bg-accent/5">
             <Wifi size={18} className="text-accent animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/60">Target IP Address</label>
            <div className="relative group">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.1.101" 
                className="input-scada pl-12 h-12 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 px-2">
            <input type="checkbox" id="remember" className="accent-primary" defaultChecked />
            <label htmlFor="remember" className="text-[8px] font-mono text-primary/40 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">Remember_Device_ID</label>
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={onConnect}
              disabled={loading}
              className="btn-scada h-12 text-[10px]"
            >
              {loading ? 'LINKING...' : 'ESTABLISH_HARDWARE_LINK'}
            </button>
            <button 
              onClick={onSimulate}
              disabled={loading}
              className="text-[8px] font-black tracking-[0.3em] uppercase text-primary/20 hover:text-primary transition-colors py-3"
            >
              Launch_Virtual_Environment
            </button>
          </div>

          <div className="flex flex-col items-center justify-center relative group pt-4 border-t border-white/5">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Aldebaran_Nao_Front.jpg/330px-Aldebaran_Nao_Front.jpg" 
              alt="NAO" 
              className="w-32 h-auto object-contain relative grayscale group-hover:grayscale-0 transition-all duration-1000 brightness-50 group-hover:brightness-100"
            />
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex justify-between items-center text-[7px] font-mono text-white/10 uppercase tracking-[0.2em]">
          <span>Packet_Rate: 120ms</span>
          <span>Security_Level: ALPHA_1</span>
          <span>Buffer: 1024kb</span>
        </div>
      </div>
    </div>
  );
}
