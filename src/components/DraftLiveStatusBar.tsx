import React from 'react';
import { DraftSettings, OCRResult, Position } from '../types';
import { Clock, User, CheckCircle2, Flame, Layers } from 'lucide-react';

interface DraftLiveStatusBarProps {
  settings: DraftSettings;
  data: OCRResult;
}

export const DraftLiveStatusBar: React.FC<DraftLiveStatusBarProps> = ({ settings, data }) => {
  const totalTeams = settings.total_teams || 12;
  const totalRounds = settings.total_rounds || 16;
  const totalSpots = totalTeams * totalRounds;
  const currentPick = data.picks.length + 1;
  const isComplete = currentPick > totalSpots;

  const getSlot = (overall: number) => {
    const round = Math.ceil(overall / totalTeams);
    const pickInR = ((overall - 1) % totalTeams) + 1;
    const col = (settings.draft_type === 'snake' && round % 2 === 0) ? totalTeams - pickInR + 1 : pickInR;
    return { round, col };
  };

  const currentSlot = getSlot(currentPick);
  const isMyTurn = currentSlot.col === settings.my_team_column && !isComplete;
  const myTeamName = settings.team_names[settings.my_team_column] || `Team ${settings.my_team_column}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMyTurn ? 'bg-emerald-500 text-black animate-pulse' : 'bg-slate-800 text-emerald-400'}`}>
            {isMyTurn ? <Flame className="w-5 h-5 fill-current" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Status • {settings.scoring_format}</p>
            <h2 className="text-lg font-bold text-white">
              {isComplete ? <span className="text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Draft Complete</span> : 
               isMyTurn ? <span className="text-emerald-400">YOUR PICK (Slot {currentSlot.col})</span> :
               <span>Pick #{currentPick}: {settings.team_names[currentSlot.col]}</span>}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl border ${isMyTurn ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-slate-950/40 border-slate-800'}`}>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-300">{myTeamName} (Col {settings.my_team_column})</span>
          </div>
          <div className="text-sm font-bold text-white">
            {isComplete ? 'Draft finished' : isMyTurn ? 'YOU ARE ON THE CLOCK' : 'Waiting for turn...'}
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-slate-950/40 border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-300">Draft Progress</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(data.picks.length / totalSpots) * 100}%` }}></div>
            </div>
            <span className="text-[10px] font-black text-slate-400">{data.picks.length}/{totalSpots}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
