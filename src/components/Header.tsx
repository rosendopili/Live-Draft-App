import React from 'react';
import { Layout, Users, Sparkles, PlusCircle, RotateCcw, ShieldCheck, Sliders } from 'lucide-react';
import logoImg from '../assets/logo.png';

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
    <header className="bg-stone-950 border-b border-stone-800 sticky top-0 z-40 backdrop-blur-md bg-stone-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-2 md:h-16 gap-3">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('board')}>
              <div className="bg-stone-800 p-1 rounded-lg border border-stone-700 shadow-inner flex items-center justify-center w-10 h-10 overflow-hidden">
                <img 
                  src={logoImg} 
                  alt="Leatherheads Logo" 
                  className="w-14 h-14 object-cover scale-[1.5]"
                />
              </div>
              <span className="text-xl font-black tracking-tighter text-stone-100 uppercase">LEATHERHEADS</span>
            </div>
            
            <div className="flex items-center gap-1 md:hidden">
              <button onClick={onOpenSettings} className="p-2 text-stone-400"><Sliders className="w-5 h-5" /></button>
              <button onClick={onOpenManualPick} className="p-2 text-stone-400"><PlusCircle className="w-5 h-5" /></button>
              <button onClick={onStartNewDraft} className="p-2 text-stone-400"><RotateCcw className="w-5 h-5" /></button>
            </div>
          </div>

          <nav className="flex items-center justify-center bg-stone-900/50 p-1 rounded-xl border border-stone-800 w-full md:w-auto overflow-x-auto">
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
                    ? 'bg-amber-900/40 text-amber-500 border border-amber-900/50'
                    : 'text-stone-500'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={onOpenSettings} className="p-2 text-stone-400 hover:text-white transition-colors"><Sliders className="w-5 h-5" /></button>
            <button onClick={onOpenManualPick} className="p-2 text-stone-400 hover:text-white transition-colors"><PlusCircle className="w-5 h-5" /></button>
            <button onClick={onStartNewDraft} className="p-2 text-stone-400 hover:text-red-400 transition-colors"><RotateCcw className="w-5 h-5" /></button>
            {hasApiKey && <ShieldCheck className="w-4 h-4 text-amber-600 ml-2" />}
          </div>
        </div>
      </div>
    </header>
  );
};
