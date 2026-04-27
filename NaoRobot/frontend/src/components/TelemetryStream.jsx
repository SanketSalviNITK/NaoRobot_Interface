import React from 'react';
import { Terminal } from 'lucide-react';

export default function TelemetryStream({ logs }) {
  return (
    <div className="glass-card p-6 flex-1 flex flex-col min-h-[250px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
          <Terminal size={12} className="text-primary" /> Telemetry Data Stream
        </h3>
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
      </div>
      
      <div className="flex flex-col gap-3 font-mono text-[9px] overflow-y-auto max-h-[180px] custom-scrollbar">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3 border-l border-primary/20 pl-3 py-1 hover:bg-primary/5 transition-colors">
            <span className="text-primary/40 shrink-0">[{log.time}]</span> 
            <span className="text-slate-300 uppercase tracking-tight">{log.msg}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-20 py-8 italic">
            <span>NO DATA DETECTED</span>
            <span className="text-[8px] mt-2">WAITING FOR CORE SIGNAL...</span>
          </div>
        )}
      </div>
    </div>
  );
}
