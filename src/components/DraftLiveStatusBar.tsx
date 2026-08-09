import React, { useState, useEffect, useMemo } from 'react';
import { DraftSettings, OCRResult, Position, DraftPick } from '../types';
import { Clock, User, CheckCircle2, Flame, Sparkles, UserPlus } from 'lucide-react';
import { NFLPlayer } from '../data/nflPlayers';

interface DraftLiveStatusBarProps {
  settings: DraftSettings;
  data: OCRResult;
  playerDatabase: NFLPlayer[];
  onQuickDraft: (p: NFLPlayer, col: number, round: number) => void;
}

export const DraftLiveStatusBar: React.FC<DraftLiveStatusBarProps> = ({ settings, data, playerDatabase, onQuickDraft }) => {
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
  
  // Timer Logic
  const [timeLeft, setTimeLeft] = useState(settings.time_per_pick || 60);
  useEffect(() => {
    if (isComplete) return;
    setTimeLeft(settings.time_per_pick || 60);
  }, [currentPick, settings.time_per_pick, isComplete]);

  useEffect(() => {
    if (timeLeft <= 0 || isComplete) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isComplete]);

  // Top 3 Recommendations for the User
  const userRecs = useMemo(() => {
    const drafted = new Set(data.picks.map(p => p.player_name.toLowerCase()));
    const myRoster = data.picks.filter(p => p.team_column === settings.my_team_column);
    const qbCount = myRoster.filter(p => p.position === 'QB').length;
    
    return playerDatabase
      .filter(p => !drafted.has(p.name.toLowerCase()))
      .map(p => {
        let score = 1000 - p.rank;
        if (p.position === 'QB' && qbCount >= 1) score -= 100;
        if (p.injuryStatus) score -= 200;
        return { ...p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [playerDatabase, data.picks, settings.my_team_column]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isMyTurn ? 'bg-emerald-500 text-black animate-pulse' : 'bg-slate-800 text-emerald-400'}`}>
            {isMyTurn ? <Flame className="w-6 h-6 fill-current" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Draft Control</p>
            <h2 className="text-xl font-black text-white leading-tight">
              {isComplete ? 'Draft Complete' : isMyTurn ? 'YOUR TURN' : `Pick #${currentPick}: ${settings.team_names[currentSlot.col]}`}
            </h2>
          </div>
        </div>
        
        {!isComplete && (
          <div className={`flex flex-col items-end ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
            <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">Time Remaining</span>
            <span className="text-2xl font-mono font-black">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
        )}
      </div>

      {isMyTurn && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 animate-in fade-in zoom-in duration-500">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Personalized Recommendations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {userRecs.map((p, i) => (
              <button key={p.id} onClick={() => onQuickDraft(p, currentSlot.col, currentSlot.round)} className="flex items-center justify-between p-3 bg-slate-900 border border-emerald-500/20 hover:border-emerald-500 rounded-xl transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black opacity-40">#{i+1}</span>
                  <div className="text-left">
                    <div className="text-xs font-black text-white">{p.name}</div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase">{p.position} • {p.nflTeam}</div>
                  </div>
                </div>
                <UserPlus className="w-4 h-4 text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
