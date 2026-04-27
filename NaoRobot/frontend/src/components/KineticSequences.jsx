import React from 'react';
import { Zap, Power, ArrowUp, ArrowDown, Move, Activity, UserCheck } from 'lucide-react';

export default function KineticSequences({ onAction }) {
  const primaryActions = [
    { id: 'wakeup', label: 'POWER_ON', icon: Power, color: 'text-primary' },
    { id: 'rest', label: 'POWER_OFF', icon: Power, color: 'text-accent' },
    { id: 'stand', label: 'STAND_INIT', icon: ArrowUp, color: 'text-white' },
    { id: 'sit', label: 'SIT_INIT', icon: ArrowDown, color: 'text-white' },
  ];

  const behaviorActions = [
    { id: 'hello', label: 'WAVE_HELLO', icon: UserCheck, color: 'text-primary/60' },
    { id: 'wipe', label: 'WIPE_BROW', icon: Activity, color: 'text-primary/60' },
    { id: 'dance', label: 'DANCE_SEQ', icon: Move, color: 'text-primary/60' },
  ];

  return (
    <div className="glass-card p-6 flex flex-col gap-6 relative h-full">
      <div className="tech-corner bottom-left"></div>
      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
        <Zap size={14} className="text-primary" /> 03 // Kinetic Lab
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {primaryActions.map((action) => (
            <button 
              key={action.id}
              className="btn-outline py-4 text-[9px] flex flex-col items-center gap-2 group hover:bg-primary/5" 
              onClick={() => onAction(action.id)}
            >
              <action.icon size={14} className={`${action.color} group-hover:scale-110 transition-transform`} />
              {action.label}
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-primary/10">
          <label className="text-[8px] font-mono text-primary/40 uppercase mb-3 block">Complex Behaviors</label>
          <div className="flex flex-col gap-2">
            {behaviorActions.map((action) => (
              <button 
                key={action.id}
                className="btn-outline w-full py-3 text-[9px] flex items-center justify-between px-4 hover:border-primary/40"
                onClick={() => onAction(action.id)}
              >
                <span className="flex items-center gap-3">
                  <action.icon size={12} className={action.color} />
                  {action.label}
                </span>
                <span className="text-[7px] font-mono opacity-30">EXECUTE</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
