import React from 'react';
import { Camera, FileCode, Sparkles, RefreshCw, Layers, TrendingUp, UserPlus, Sliders, RotateCcw } from 'lucide-react';

interface HeaderProps {
  hasApiKey: boolean;
  activeTab: 'board' | 'available' | 'rosters' | 'json' | 'samples';
  setActiveTab: (tab: 'board' | 'available' | 'rosters' | 'json' | 'samples') => void;
  detectedCount: number;
  avgConfidence?: number;
  onNewScan: () => void;
  onOpenSettings?: () => void;
  onOpenManualPick?: () => void;
  onStartNewDraft?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasApiKey,
  activeTab,
  setActiveTab,
  detectedCount,
  avgConfidence,
  onNewScan,
  onOpenSettings,
  onOpenManualPick,
  onStartNewDraft,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white truncate">
                  DraftBoard OCR
                </h1>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                  AI 3.6
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden lg:block truncate">
                Physical Fantasy Football Draft Board Transcription Engine
              </p>
            </div>
          </div>

          {/* Action Buttons for Mobile & Desktop */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {onOpenManualPick && (
              <button
                onClick={onOpenManualPick}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shadow-md shadow-emerald-600/20 min-h-[40px] sm:min-h-[42px]"
                title="Manually Record GM Pick"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">+ Manual Pick</span>
                <span className="sm:hidden text-[11px]">+ Pick</span>
              </button>
            )}

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 p-2 sm:px-2.5 sm:py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 shadow-sm min-h-[40px] sm:min-h-[42px]"
                title="League & Draft Settings"
              >
                <Sliders className="w-4 h-4 text-slate-300" />
                <span className="hidden md:inline">Settings</span>
              </button>
            )}

            <button
              onClick={onNewScan}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm min-h-[40px] sm:min-h-[42px]"
              title="Upload Draft Board Photo"
            >
              <RefreshCw className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Upload Photo</span>
            </button>

            {onStartNewDraft && (
              <button
                onClick={onStartNewDraft}
                className="bg-red-950/60 hover:bg-red-900/80 active:scale-95 text-red-300 border border-red-800/80 p-2 sm:px-2.5 sm:py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 shadow-sm min-h-[40px] sm:min-h-[42px]"
                title="Reset Board & Start Fresh Draft"
              >
                <RotateCcw className="w-4 h-4 text-red-400" />
                <span className="hidden lg:inline">New Draft</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Bar (Touch & Mobile Friendly) */}
        <div className="border-t border-slate-800/80 py-1.5 -mx-3 px-3 overflow-x-auto scrollbar-none flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('board')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'board'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Draft Board Matrix</span>
            {detectedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-200 border border-emerald-500/40 font-extrabold">
                {detectedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('available')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'available'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Available & AI Strategy</span>
          </button>

          <button
            onClick={() => setActiveTab('rosters')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'rosters'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-sky-400" />
            <span>Team Rosters</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'json'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Raw JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('samples')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'samples'
                ? 'bg-slate-800 text-slate-100 border border-slate-600'
                : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Test Board Photos</span>
          </button>
        </div>
      </div>
    </header>
  );
};
