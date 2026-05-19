import React from 'react';
import { Terminal, Clock, ShieldCheck, Activity } from 'lucide-react';

export default function StatusBar({ logs, status }) {
  const latestLog = logs[0]?.msg || 'IDLE';

  return (
    <footer className="h-10 border-t border-white/5 bg-black/60 flex items-center justify-between px-6 z-50 text-[8px] font-mono uppercase tracking-[0.2em] text-white/40">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-primary/60" />
          <span className="text-white/60">SYS_MESSAGES: {logs.length}</span>
        </div>
        <div className="h-4 w-[1px] bg-white/5"></div>
        <div className="flex items-center gap-2">
           <Activity size={12} className="text-primary/60" />
           <span>Behavior: <span className="text-primary">{status.life_state}</span></span>
        </div>
        <div className="h-4 w-[1px] bg-white/5"></div>
        <div className="flex items-center gap-2 overflow-hidden max-w-xs whitespace-nowrap">
           <span className="text-primary/60">LATEST:</span>
           <span className="text-white/80 animate-pulse">{latestLog}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
           <ShieldCheck size={12} className="text-green/60" />
           <span className="text-green/60">SECURE_CHANNEL_ACTIVE</span>
        </div>
        <div className="h-4 w-[1px] bg-white/5"></div>
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-white/30" />
          <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </footer>
  );
}
