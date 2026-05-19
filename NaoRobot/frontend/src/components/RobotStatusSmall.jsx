import React from 'react';
import { ShieldCheck, Thermometer, Cpu, Database, Clock } from 'lucide-react';

export default function RobotStatusSmall({ status }) {
  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex flex-col gap-1">
        <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest">Robot Status</span>
        <h2 className="text-sm font-black text-green tracking-widest">READY</h2>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-text-dim">
            <Clock size={12} />
            <span className="text-[9px] uppercase">Uptime</span>
          </div>
          <span className="text-[10px] font-mono">2d 14h 33m</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-text-dim">
            <Thermometer size={12} />
            <span className="text-[9px] uppercase">Temp</span>
          </div>
          <span className="text-[10px] font-mono">42°C</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-text-dim">
            <Cpu size={12} />
            <span className="text-[9px] uppercase">CPU Load</span>
          </div>
          <span className="text-[10px] font-mono">{status.sensors?.cpu_load || 23}%</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-text-dim">
            <Database size={12} />
            <span className="text-[9px] uppercase">Memory</span>
          </div>
          <span className="text-[10px] font-mono">{status.sensors?.memory_usage || 41}%</span>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-white/5">
         <div className="flex items-center gap-2 text-green/60">
            <ShieldCheck size={14} />
            <span className="text-[7px] font-mono uppercase tracking-widest">Systems_Nominal</span>
         </div>
      </div>
    </div>
  );
}
