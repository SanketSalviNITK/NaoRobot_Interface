import React from 'react';
import { Activity, Battery as BatteryIcon, Info } from 'lucide-react';

export default function TelemetryLab({ sensors, status }) {
  const sonarL = sensors?.sonar_left || 0;
  const sonarR = sensors?.sonar_right || 0;

  const jointAngles = [
    { label: 'Head Yaw', value: -12.4, rLabel: 'R. Shoulder Pitch', rValue: 32.1 },
    { label: 'Head Pitch', value: 6.7, rLabel: 'R. Shoulder Roll', rValue: -6.3 },
    { label: 'L. Shoulder Pitch', value: -21.3, rLabel: 'R. Elbow Yaw', rValue: 47.8 },
    { label: 'L. Shoulder Roll', value: 5.2, rLabel: 'R. Elbow Roll', rValue: -2.7 },
    { label: 'L. Elbow Yaw', value: 88.1, rLabel: 'R. Wrist Yaw', rValue: 10.3 },
    { label: 'L. Elbow Roll', value: -3.1, rLabel: 'R. Hip Yaw Pitch', rValue: -3.6 },
    { label: 'L. Wrist Yaw', value: -15.2, rLabel: 'R. Hip Yaw Pitch', rValue: 4.1 },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="tech-header shrink-0">
        <Activity size={12} className="text-primary" />
        SENSORS & TELEMETRY
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-4">
        {/* Row 1: Battery & Sonar */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="bg-white/5 p-3 rounded flex items-center justify-between border border-white/5">
            <div className="flex flex-col">
              <span className="text-[7px] font-bold text-text-dim uppercase tracking-widest">Battery</span>
              <span className="text-sm font-black">{status.battery}%</span>
            </div>
            <div className="relative w-12 h-12">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/5" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray={126} strokeDashoffset={126 - (126 * status.battery) / 100} className="text-green" />
              </svg>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded flex flex-col gap-2 border border-white/5">
            <span className="text-[7px] font-bold text-text-dim uppercase tracking-widest text-center">Sonar</span>
            <div className="flex justify-around items-end h-8">
              {[65, 42].map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="h-6 w-1.5 bg-primary/20 relative rounded-full overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-primary/60" style={{ height: `${v}%` }}></div>
                  </div>
                  <span className="text-[6px] font-mono">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Tactile Matrix (Horizontal) */}
        <div className="bg-white/5 p-3 rounded border border-white/5 flex flex-col gap-3 shrink-0">
          <span className="text-[7px] font-bold text-text-dim uppercase tracking-widest">Tactile Matrix</span>
          <div className="grid grid-cols-4 gap-2">
             {['Head', 'L_H', 'R_H', 'Bump'].map(label => (
               <div key={label} className="flex flex-col items-center gap-1">
                  <div className="w-4 h-4 rounded bg-black/40 border border-white/5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-green/40 shadow-[0_0_5px_rgba(16,185,129,0.3)]"></div>
                  </div>
                  <span className="text-[6px] text-white/30 font-mono">{label}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Row 3: IMU (Compact) */}
        <div className="bg-white/5 p-3 rounded border border-white/5 flex flex-col gap-2 shrink-0">
          <span className="text-[7px] font-bold text-text-dim uppercase tracking-widest">Inertial Measurement</span>
          <div className="h-10 bg-black/40 rounded border border-white/5 relative overflow-hidden">
             <svg viewBox="0 0 100 20" className="w-full h-full opacity-40">
                <path d="M0,10 Q25,5 50,10 T100,10" fill="none" stroke="#00f2ff" strokeWidth="0.5" />
             </svg>
             <div className="absolute top-1 left-2 text-[6px] font-mono text-primary/40 uppercase">G_Link: Active</div>
          </div>
        </div>

        {/* Row 4: Joint Mapping (High Density) */}
        <div className="bg-white/5 p-3 rounded border border-white/5 flex flex-col gap-2 flex-1 min-h-0">
           <span className="text-[7px] font-bold text-text-dim uppercase tracking-widest">Joint Mapping</span>
           <div className="grid grid-cols-2 gap-x-3 gap-y-1 overflow-y-auto custom-scrollbar">
              {jointAngles.map((j, i) => (
                <div key={i} className="flex justify-between items-center text-[7px] font-mono py-0.5 border-b border-white/5 last:border-0">
                   <span className="text-white/20 truncate max-w-[50px]">{j.label}</span>
                   <span className="text-primary">{j.value}°</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
