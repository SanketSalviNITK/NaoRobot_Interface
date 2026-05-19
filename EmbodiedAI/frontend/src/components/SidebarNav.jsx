import React from 'react';
import { LayoutGrid, Activity, Zap, MessageSquare, Terminal, FileText, Settings, Cpu } from 'lucide-react';

export default function SidebarNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'overview', icon: LayoutGrid, label: 'Overview' },
    { id: 'telemetry', icon: Activity, label: 'Telemetry' },
    { id: 'control', icon: Zap, label: 'Control' },
    { id: 'behaviors', icon: Cpu, label: 'Behaviors' },
    { id: 'logs', icon: Terminal, label: 'Logs' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'files', icon: FileText, label: 'Files' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="w-20 bg-bg-darker border-r border-panel-border flex flex-col items-center py-6 gap-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`group flex flex-col items-center gap-1 transition-all w-full relative ${
            activeTab === tab.id ? 'text-primary' : 'text-text-dim hover:text-white/60'
          }`}
        >
          {activeTab === tab.id && (
            <div className="absolute left-0 w-1 h-8 bg-primary shadow-[0_0_15px_var(--primary)] rounded-r-full"></div>
          )}
          <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
          <span className="text-[7px] font-medium tracking-tight">
            {tab.label}
          </span>
        </button>
      ))}
      
      <div className="mt-auto pb-4">
         <button className="text-text-dim hover:text-primary transition-colors">
            <Cpu size={18} />
         </button>
      </div>
    </nav>
  );
}
