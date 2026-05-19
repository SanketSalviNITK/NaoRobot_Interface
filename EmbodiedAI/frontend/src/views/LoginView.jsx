import React from 'react';
import { Lock, User, Cpu } from 'lucide-react';

export default function LoginView({ onLogin, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-bg-darker relative p-4">
      {/* Background Robot Watermark */}
      <div className="absolute opacity-[0.02] pointer-events-none transform scale-150">
        <Cpu size={400} />
      </div>

      <div className="glass-panel w-full max-w-[380px] p-8 flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-1000">
        <div className="flex flex-col gap-2 items-center text-center">
          <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center bg-primary/5 mb-2">
            <Cpu size={32} className="text-primary animate-pulse" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
            NAO <span className="text-primary italic">ROBOTICS</span>
          </h1>
          <p className="text-[10px] font-mono text-primary/40 uppercase tracking-[0.4em]">Remote Control Center // V2.0</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative group">
            <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="OPERATOR_ID" 
              className="input-scada pl-12"
              required 
            />
          </div>
          
          <div className="relative group">
            <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="password" 
              placeholder="ACCESS_KEY" 
              className="input-scada pl-12"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-scada mt-4 py-4 text-xs tracking-[0.5em]"
          >
            {loading ? 'AUTHENTICATING...' : 'SECURE_LOGIN'}
          </button>
        </form>

        <div className="flex justify-between items-center px-2">
          <div className="flex gap-2">
             <div className="w-1 h-1 rounded-full bg-primary/40"></div>
             <div className="w-1 h-1 rounded-full bg-primary/40"></div>
             <div className="w-1 h-1 rounded-full bg-primary/40"></div>
          </div>
          <span className="text-[7px] font-mono text-primary/20 uppercase tracking-widest">S.C.A.D.A COMPLIANT // ENCRYPTED</span>
        </div>
      </div>
    </div>
  );
}
