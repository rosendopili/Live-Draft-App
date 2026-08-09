import React from 'react';
import { Layout, Users, Sparkles, PlusCircle, RotateCcw, ShieldCheck, ShieldAlert, Sliders } from 'lucide-react';

interface HeaderProps {
  hasApiKey: boolean;
  activeTab: 'board' | 'available' | 'rosters';
  setActiveTab: (tab: 'board' | 'available' | 'rosters') => void;
  onOpenSettings: () => void;
  onOpenManualPick: () => void;
  onStartNewDraft: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasApiKey, activeTab, setActiveTab, onOpenSettings, onOpenManualPick, onStartNewDraft,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('board')}>
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter text-white">LIVE DRAFT</span>
          </div>

          <nav className="hidden md:flex items-center bg-slate-950/50 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'board', label: 'Draft Board', icon: Layout },
              { id: 'available', label: 'Available', icon: Sparkles },
              { id: 'rosters', label: 'Rosters', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                  activeTab === tab.id ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={onOpenSettings} title="Draft Settings" className="p-2 text-slate-400 hover:text-white transition-colors"><Sliders className="w-5 h-5" /></button>
            <button onClick={onOpenManualPick} title="Manual Pick" className="p-2 text-slate-400 hover:text-white transition-colors"><PlusCircle className="w-5 h-5" /></button>
            <button onClick={onStartNewDraft} title="Reset Draft" className="p-2 text-slate-400 hover:text-red-400 transition-colors"><RotateCcw className="w-5 h-5" /></button>
            <div className="hidden lg:flex items-center px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg gap-2 ml-2">
              {hasApiKey ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{hasApiKey ? 'AI Ready' : 'AI Offline'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
