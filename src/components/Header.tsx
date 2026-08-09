import React from 'react';
import { Layout, Users, Sparkles, PlusCircle, RotateCcw, ShieldCheck, Sliders } from 'lucide-react';

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
        <div className="flex flex-col md:flex-row md:items-center justify-between py-2 md:h-16 gap-3">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('board')}>
              <div className="bg-emerald-600 p-1.5 rounded-lg shadow-lg shadow-emerald-900/20">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tighter text-white">LIVE DRAFT</span>
            </div>
            
            <div className="flex items-center gap-1 md:hidden">
              <button onClick={onOpenSettings} className="p-2 text-slate-400"><Sliders className="w-5 h-5" /></button>
              <button onClick={onOpenManualPick} className="p-2 text-slate-400"><PlusCircle className="w-5 h-5" /></button>
              <button onClick={onStartNewDraft} className="p-2 text-slate-400"><RotateCcw className="w-5 h-5" /></button>
            </div>
          </div>

          <nav className="flex items-center justify-center bg-slate-950/50 p-1 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto">
            {[
              { id: 'board', label: 'Board', icon: Layout },
              { id: 'available', label: 'Available', icon: Sparkles },
              { id: 'rosters', label: 'Rosters', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-500'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={onOpenSettings} className="p-2 text-slate-400 hover:text-white transition-colors"><Sliders className="w-5 h-5" /></button>
            <button onClick={onOpenManualPick} className="p-2 text-slate-400 hover:text-white transition-colors"><PlusCircle className="w-5 h-5" /></button>
            <button onClick={onStartNewDraft} className="p-2 text-slate-400 hover:text-red-400 transition-colors"><RotateCcw className="w-5 h-5" /></button>
            {hasApiKey && <ShieldCheck className="w-4 h-4 text-emerald-500 ml-2" />}
          </div>
        </div>
      </div>
    </header>
  );
};
