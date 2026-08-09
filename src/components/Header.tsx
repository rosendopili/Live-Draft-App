import React from 'react';
import { Layout, Users, Sparkles, Settings, PlusCircle, RotateCcw, ShieldCheck, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  hasApiKey: boolean;
  activeTab: 'board' | 'available' | 'rosters' | 'settings';
  setActiveTab: (tab: 'board' | 'available' | 'rosters' | 'settings') => void;
  detectedCount: number;
  onNewScan: () => void;
  onOpenSettings: () => void;
  onOpenManualPick: () => void;
  onStartNewDraft: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasApiKey,
  activeTab,
  setActiveTab,
  detectedCount,
  onOpenManualPick,
  onStartNewDraft,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('board')}>
            <div className="bg-emerald-600 p-1.5 rounded-lg shadow-lg shadow-emerald-900/20">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter text-white">LIVE DRAFT</span>
          </div>

          <nav className="hidden md:flex items-center bg-slate-950/50 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'board', label: 'Draft Board', icon: Layout },
              { id: 'available', label: 'Available', icon: Sparkles },
              { id: 'rosters', label: 'Rosters', icon: Users },
              { id: 'settings', label: 'AI Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg gap-2">
              {hasApiKey ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{hasApiKey ? 'AI Ready' : 'AI Offline'}</span>
            </div>
            <button onClick={onOpenManualPick} className="p-2 text-slate-400 hover:text-white transition-colors"><PlusCircle className="w-5 h-5" /></button>
            <button onClick={onStartNewDraft} className="p-2 text-slate-400 hover:text-red-400 transition-colors"><RotateCcw className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </header>
  );
};
