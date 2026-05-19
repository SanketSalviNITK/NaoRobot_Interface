import React from 'react';
import { User, Search, PlayCircle, RotateCcw, Plus } from 'lucide-react';

export default function QuickBehaviors({ onAction }) {
  const behaviors = [
    { id: 'intro', label: 'Introduction', desc: 'Waves and says hello', icon: User },
    { id: 'track', label: 'Look At Person', desc: 'Track and look at a person', icon: User },
    { id: 'find', label: 'Find Face', desc: 'Detect and look at faces', icon: Search },
    { id: 'reset', label: 'Rest Pose', desc: 'Move to default posture', icon: RotateCcw },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest">Quick Behaviors</span>
      
      <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
        {behaviors.map(b => (
          <button 
            key={b.id}
            onClick={() => onAction(b.id)}
            className="flex items-center gap-3 p-2 border border-panel-border bg-white/5 hover:bg-white/10 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-sm bg-black/40 flex items-center justify-center text-text-dim group-hover:text-primary">
               <b.icon size={14} />
            </div>
            <div className="flex flex-col">
               <span className="text-[9px] font-bold text-white/80">{b.label}</span>
               <span className="text-[7px] text-white/20 uppercase tracking-tighter">{b.desc}</span>
            </div>
          </button>
        ))}
      </div>

      <button className="flex items-center justify-center gap-2 py-2 border border-dashed border-white/10 text-[8px] font-bold text-text-dim hover:text-primary hover:border-primary transition-all">
         <Plus size={10} />
         ADD NEW BEHAVIOR
      </button>
    </div>
  );
}
