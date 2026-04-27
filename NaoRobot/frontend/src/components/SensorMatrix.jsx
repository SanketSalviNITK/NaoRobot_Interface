import React from 'react';
import { Activity, Radar, Thermometer, Cpu, Database } from 'lucide-react';

export default function SensorMatrix({ sensors }) {
  const metrics = [
    { label: 'HEAD_TACTILE', value: sensors.head_touch > 0 ? 'ACTIVE' : 'IDLE', icon: Activity, color: sensors.head_touch > 0 ? 'text-primary' : 'text-slate-600' },
    { label: 'SONAR_L', value: `${(sensors.sonar_left || 0).toFixed(2)}m`, icon: Radar, color: 'text-primary' },
    { label: 'SONAR_R', value: `${(sensors.sonar_right || 0).toFixed(2)}m`, icon: Radar, color: 'text-primary' },
    { label: 'CPU_LOAD', value: `${sensors.cpu_load}%`, icon: Cpu, color: 'text-primary' },
    { label: 'MEM_ALLOC', value: `${sensors.memory_usage}%`, icon: Database, color: 'text-primary' },
  ];

  return (
    <div className="glass-card p-6 flex flex-col gap-6 relative h-full">
      <div className="tech-corner top-right"></div>
      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
        <Activity size={14} className="text-primary" /> 04 // Sensor Matrix
      </h2>

      <div className="flex flex-col gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="flex items-center justify-between p-3 border border-primary/5 bg-primary/5 hover:bg-primary/10 transition-colors">
            <div className="flex items-center gap-3">
              <m.icon size={14} className={m.color} />
              <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
            </div>
            <span className={`text-[10px] font-mono ${m.color === 'text-primary' ? 'text-white' : m.color}`}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-primary/10">
        <div className="flex justify-between text-[7px] font-mono opacity-30 uppercase mb-1">
          <span>Signal_Frequency</span>
          <span>50Hz</span>
        </div>
        <div className="w-full h-1 bg-slate-800 overflow-hidden">
          <div className="h-full bg-primary/20 w-3/4 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
