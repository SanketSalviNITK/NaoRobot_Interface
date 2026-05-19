import React from 'react';
import { Camera, Maximize2, MoreHorizontal } from 'lucide-react';

export default function VisionFeed() {
  return (
    <div className="w-full h-full bg-slate-900/50 flex flex-col relative group">
      {/* Feed Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white shadow-sm">TOP_CAM_LIVE</span>
        </div>
        <div className="flex gap-4">
           <span className="text-[8px] font-mono text-white/40 uppercase">Res: 1280x720</span>
           <span className="text-[8px] font-mono text-white/40 uppercase">FPS: 30</span>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black">
        <img 
          src="http://localhost:5000/api/video_feed" 
          alt="Optical Uplink" 
          className="w-full h-full object-cover opacity-80"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1531746790731-6c087fecd05a?q=80&w=2560&auto=format&fit=crop";
            e.target.className = "w-full h-full object-cover opacity-20 grayscale";
          }}
        />
        
        {/* Face Detection Box Overlay */}
        <div className="absolute top-1/4 left-1/3 w-32 h-32 border border-primary/40 animate-pulse pointer-events-none">
           <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-primary"></div>
           <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-primary"></div>
           <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-primary"></div>
           <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-primary"></div>
           <span className="absolute -top-4 left-0 text-[7px] font-mono text-primary/60 uppercase">Neural_Scan: Active</span>
        </div>
      </div>

      {/* Control Overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2">
         <button className="w-8 h-8 rounded border border-white/10 bg-black/40 flex items-center justify-center hover:bg-primary/20 transition-all">
            <Maximize2 size={14} className="text-white/60" />
         </button>
         <button className="w-8 h-8 rounded border border-white/10 bg-black/40 flex items-center justify-center hover:bg-primary/20 transition-all">
            <MoreHorizontal size={14} className="text-white/60" />
         </button>
      </div>

      {/* Tech Overlays */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
           <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary/40 w-2/3"></div>
           </div>
           <span className="text-[7px] font-mono text-white/20 uppercase">Bitrate: 4.2 Mbps</span>
        </div>
      </div>
    </div>
  );
}
