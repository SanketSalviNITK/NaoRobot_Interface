import React, { useState } from 'react';
import { MessageSquare, Mic } from 'lucide-react';

export default function VocalSynthesis({ onSay }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text) return;
    onSay(text);
    setText('');
  };

  return (
    <div className="glass-card p-8 flex flex-col gap-6 relative overflow-hidden">
      <div className="tech-corner top-right"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -rotate-45 translate-x-16 -translate-y-16"></div>
      
      <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
        <MessageSquare size={14} className="text-primary" /> 02 // Vocal Synthesis
      </h2>
      
      <div className="flex gap-4 relative z-10">
        <input 
          className="flex-1 text-lg py-4 border-primary/10 bg-black/20 focus:bg-black/40"
          placeholder="TRANSMIT VOCAL SEQUENCE..." 
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn-primary px-8 flex flex-col items-center justify-center gap-1" onClick={handleSend}>
          <Mic size={18} />
          <span className="text-[9px] font-black">SEND</span>
        </button>
      </div>
    </div>
  );
}
