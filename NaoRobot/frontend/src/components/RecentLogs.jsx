import React from 'react';
import { Terminal, ChevronRight } from 'lucide-react';

export default function RecentLogs({ logs }) {
  const displayLogs = logs && logs.length > 0 ? logs : [
    { time: '14:35:42', type: 'INFO', msg: 'Robot is online and ready.' },
    { time: '14:35:41', type: 'INFO', msg: 'Sensors initialized successfully.' },
    { time: '14:35:40', type: 'INFO', msg: 'Battery level: 78% (Charging)' },
    { time: '14:35:38', type: 'WARN', msg: 'Left bumper pressed.' },
    { time: '14:35:36', type: 'INFO', msg: 'Behavior "Wave" completed.' },
    { time: '14:35:31', type: 'INFO', msg: 'Executing behavior: Wave' },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest">Recent Logs</span>
        <Terminal size={12} className="text-text-dim" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2">
        {displayLogs.map((log, i) => (
          <div key={i} className="flex gap-3 text-[8px] font-mono leading-tight">
            <span className="text-white/20 shrink-0">{log.time}</span>
            <span className={log.type === 'WARN' ? 'text-yellow' : 'text-primary/60'}>[{log.type}]</span>
            <span className="text-white/60">{log.msg || log}</span>
          </div>
        ))}
      </div>

      <button className="flex items-center justify-center gap-1 text-[8px] font-bold text-text-dim hover:text-primary transition-all self-center mt-2">
         VIEW ALL LOGS <ChevronRight size={10} />
      </button>
    </div>
  );
}
