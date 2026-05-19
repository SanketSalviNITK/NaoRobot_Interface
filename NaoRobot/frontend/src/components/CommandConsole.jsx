import React, { useState } from 'react';
import { User, MoveUp, MoveDown, ArrowLeft, ArrowRight, Hand, MessageSquare, Send, Circle } from 'lucide-react';

export default function ControlConsole({ onAction, onSay }) {
  const [text, setText] = useState('');

  const mainActions = [
    { id: 'sit', label: 'Sit', icon: MoveDown },
    { id: 'stand', label: 'Stand', icon: MoveUp },
    { id: 'walk', label: 'Walk Forward', icon: MoveUp },
    { id: 'turn_left', label: 'Turn Left', icon: ArrowLeft },
    { id: 'turn_right', label: 'Turn Right', icon: ArrowRight },
    { id: 'wave', label: 'Wave', icon: Hand },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="tech-header">CONTROL CONSOLE</div>
      
      <div className="grid grid-cols-12 gap-8 flex-1">
        
        {/* Kinetic Grid */}
        <div className="col-span-6 grid grid-cols-6 gap-2">
          {mainActions.map(action => (
            <button 
              key={action.id}
              onClick={() => onAction(action.id)}
              className="btn-control h-20 col-span-1"
            >
              <action.icon size={18} />
              <span className="text-[7px] text-center leading-tight">{action.label}</span>
            </button>
          ))}
          
          <div className="col-span-6 mt-4 flex flex-col gap-2">
            <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest">Text to Speech</span>
            <div className="relative flex items-center">
               <input 
                 type="text" 
                 value={text}
                 onChange={(e) => setText(e.target.value)}
                 placeholder="Type text for NAO to speak..."
                 className="input-cyber w-full pr-16 h-12"
               />
               <span className="absolute right-12 text-[8px] font-mono text-white/20">{text.length} / 200</span>
               <button onClick={() => onSay(text)} className="absolute right-2 p-2 text-primary hover:scale-110 transition-transform">
                  <Send size={14} />
               </button>
            </div>
          </div>
        </div>

        {/* LED & Logic */}
        <div className="col-span-6 grid grid-cols-1 gap-6 border-l border-panel-border pl-8 overflow-y-auto custom-scrollbar">
           <div className="flex flex-col gap-4">
              <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest">LED System Control</span>
              <div className="flex items-center gap-8">
                 {/* Mock Color Wheel */}
                 <div className="shrink-0 w-20 h-20 rounded-full bg-gradient-to-tr from-primary via-accent to-yellow border-2 border-white/10 shadow-lg relative cursor-crosshair">
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full border border-white bg-black"></div>
                 </div>
                 
                 <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-3">
                       <span className="text-[9px] font-mono text-white/40 w-4">R:</span>
                       <input type="text" readOnly value="0" className="bg-black/60 border border-panel-border text-[10px] font-mono w-full px-2 py-1.5 rounded text-white" />
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[9px] font-mono text-white/40 w-4">G:</span>
                       <input type="text" readOnly value="200" className="bg-black/60 border border-panel-border text-[10px] font-mono w-full px-2 py-1.5 rounded text-white" />
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[9px] font-mono text-white/40 w-4">B:</span>
                       <input type="text" readOnly value="255" className="bg-black/60 border border-panel-border text-[10px] font-mono w-full px-2 py-1.5 rounded text-white" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest">Presets</span>
                <span className="text-[8px] font-mono text-primary/40 uppercase">#00C8FF</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                 {['#00f2ff', '#ff007a', '#10b981', '#f59e0b', '#ffffff', '#333333'].map(c => (
                   <div key={c} className="h-8 rounded-sm border border-white/5 cursor-pointer hover:border-white/20 transition-all" style={{ backgroundColor: c }}></div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
