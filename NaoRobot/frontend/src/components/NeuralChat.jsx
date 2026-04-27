import React, { useEffect, useRef } from 'react';
import { User, Cpu, Clock } from 'lucide-react';

export default function NeuralChat({ dialogue }) {
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dialogue]);

  return (
    <div className="glass-card flex flex-col h-[450px] border-primary/10 relative overflow-hidden bg-black/40">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <Cpu size={16} className="text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Nao_Core Neural Link</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[7px] font-mono text-green-500/70 uppercase">Bi-Directional Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-primary/40"></div>
          <div className="w-1 h-1 rounded-full bg-primary/40"></div>
          <div className="w-1 h-1 rounded-full bg-primary/40"></div>
        </div>
      </div>

      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar scroll-smooth"
      >
        {dialogue && dialogue.length > 0 ? (
          dialogue.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={i} 
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
              >
                {/* Avatar */}
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                  isUser ? 'bg-primary/20 border-primary/40 shadow-[0_0_10px_rgba(0,242,255,0.2)]' : 'bg-white/5 border-white/10'
                }`}>
                  {isUser ? <User size={14} className="text-primary" /> : <Cpu size={14} className="text-white/60" />}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col gap-1.5 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 text-[11px] font-mono leading-relaxed relative rounded-2xl ${
                    isUser 
                    ? 'bg-primary/10 text-primary border border-primary/20 rounded-tr-none shadow-[inset_0_0_20px_rgba(0,242,255,0.05)]' 
                    : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
                  }`}>
                    {msg.text}
                    {/* Futuristic corner accent */}
                    <div className={`absolute top-0 ${isUser ? 'right-[-1px]' : 'left-[-1px]'} w-2 h-2 bg-black rotate-45`}></div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-30">
                    <Clock size={8} />
                    <span className="text-[7px] font-mono uppercase tracking-tighter">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center flex-col gap-4 opacity-10">
             <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary animate-spin-slow"></div>
             <span className="text-[9px] font-mono uppercase tracking-[0.4em]">Establishing_Link...</span>
          </div>
        )}
      </div>

      {/* Tech Overlay Footer */}
      <div className="px-6 py-2 bg-black/60 border-t border-white/5 flex items-center justify-between">
        <span className="text-[7px] font-mono text-white/20">ENCRYPTED_STREAM_V2.4</span>
        <div className="flex gap-4">
           <div className="flex items-center gap-1.5">
             <div className="w-1 h-1 rounded-full bg-primary shadow-[0_0_5px_rgba(0,242,255,1)]"></div>
             <span className="text-[7px] font-mono text-primary/60">RX</span>
           </div>
           <div className="flex items-center gap-1.5">
             <div className="w-1 h-1 rounded-full bg-accent shadow-[0_0_5px_rgba(255,0,122,1)]"></div>
             <span className="text-[7px] font-mono text-accent/60">TX</span>
           </div>
        </div>
      </div>
    </div>
  );
}
