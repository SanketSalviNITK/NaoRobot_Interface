import React from 'react';
import { Settings } from 'lucide-react';

export default function SystemStatusSummary({ status }) {
  return (
    <div className="flex flex-col gap-4 h-full relative overflow-hidden">
      <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest">System Status</span>
      
      <div className="flex flex-col gap-4 z-10">
        <div className="flex flex-col gap-1">
           <div className="flex justify-between text-[8px] font-mono uppercase">
              <span className="text-white/40">CPU Usage</span>
              <span className="text-white/80">23%</span>
           </div>
           <div className="h-0.5 w-full bg-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/40" style={{ width: '23%' }}></div>
           </div>
           <div className="h-6 w-full opacity-30">
              <svg viewBox="0 0 100 20" className="w-full h-full">
                 <path d="M0,10 L10,8 L20,12 L30,5 L40,10 L50,8 L60,12 L70,10 L80,8 L90,12 L100,10" fill="none" stroke="#00f2ff" strokeWidth="0.5" />
              </svg>
           </div>
        </div>

        <div className="flex flex-col gap-1">
           <div className="flex justify-between text-[8px] font-mono uppercase">
              <span className="text-white/40">Memory Usage</span>
              <span className="text-white/80">41%</span>
           </div>
           <div className="h-0.5 w-full bg-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/40" style={{ width: '41%' }}></div>
           </div>
        </div>

        <div className="flex flex-col gap-1">
           <div className="flex justify-between text-[8px] font-mono uppercase">
              <span className="text-white/40">Temperature</span>
              <span className="text-white/80">42°C</span>
           </div>
        </div>

        <div className="mt-2 flex flex-col gap-1">
           <span className="text-[7px] font-mono text-white/20 uppercase tracking-widest">Software Version</span>
           <span className="text-[9px] font-mono text-white/60">2.7.1.3</span>
        </div>
      </div>

      {/* Robot Silhouette Placeholder */}
      <div className="absolute right-[-10px] bottom-0 w-24 h-40 opacity-10 pointer-events-none">
         <svg viewBox="0 0 100 200" className="w-full h-full text-primary fill-current">
            <rect x="35" y="10" width="30" height="30" rx="5" />
            <rect x="25" y="45" width="50" height="70" rx="5" />
            <rect x="15" y="45" width="8" height="50" rx="4" />
            <rect x="77" y="45" width="8" height="50" rx="4" />
            <rect x="30" y="120" width="12" height="60" rx="5" />
            <rect x="58" y="120" width="12" height="60" rx="5" />
         </svg>
      </div>

      <div className="mt-auto flex justify-between items-center text-[7px] text-white/20 uppercase font-mono">
         <span>Uptime: 2d 14h 33m</span>
         <Settings size={10} />
      </div>
    </div>
  );
}
