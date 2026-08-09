import React, { useState, useEffect, useMemo } from 'react';
import { DraftSettings, OCRResult, NFLPlayer } from '../types';
import { Clock, Flame, Sparkles, UserPlus } from 'lucide-react';

interface DraftLiveStatusBarProps {
  settings: DraftSettings;
  data: OCRResult;
  playerDatabase: NFLPlayer[];
  onQuickDraft: (p: NFLPlayer, col: number, round: number) => void;
}

export const DraftLiveStatusBar: React.FC<DraftLiveStatusBarProps> = ({ settings, data, playerDatabase, onQuickDraft }) => {
  const totalTeams = settings.total_teams || 12;
  const currentPick = data.picks.length + 1;
  const getSlot = (p: number) => {
    const round = Math.ceil(p / totalTeams);
    const pickInR = ((p - 1) % totalTeams) + 1;
    const col = (settings.draft_type === 'snake' && round % 2 === 0) ? totalTeams - pickInR + 1 : pickInR;
    return { round, col };
  };
  const currentSlot = getSlot(currentPick);
  const isMyTurn = currentSlot.col === settings.my_team_column;
  
  const [timeLeft, setTimeLeft] = useState(settings.time_per_pick || 60);
  useEffect(() => { setTimeLeft(settings.time_per_pick || 60); }, [currentPick, settings.time_per_pick]);
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const activeRecs = useMemo(() => {
    const drafted = new Set(data.picks.map(p => p.player_name.toLowerCase()));
    const myRoster = data.picks.filter(p => p.team_column === currentSlot.col);
    const posCounts = { QB: 0, RB: 0, WR: 0, TE: 0 };
    myRoster.forEach(p => { if (posCounts[p.position as keyof typeof posCounts] !== undefined) posCounts[p.position as keyof typeof posCounts]++; });
    
    const r = settings.roster_settings || { qb: 1, rb: 2, wr: 2, te: 1, flex_wrb: 0, flex_wrbte: 1, flex_super: 0 };

    return playerDatabase
      .filter(p => !drafted.has(p.name.toLowerCase()) && p.nflTeam)
      .map(p => {
        let score = 1000 - p.rank;
        const adpGap = p.adp - currentPick;
        if (adpGap > 18) score -= (adpGap - 18) * 25; 

        // 1. Dynamic Value based on roster depth
        if (p.position === 'WR') score += (r.wr - 2) * 50;
        if (p.position === 'RB') score += (r.rb - 2) * 50;

        // 2. Flex & Superflex Boosts
        if (p.position === 'QB' && r.flex_super > 0) score += 200;
        if (p.position === 'TE' && r.flex_wrbte > 0) score += 30;

        // 3. Positional Needs Penalty
        if (p.position === 'QB' && posCounts.QB >= (r.qb + r.flex_super)) score -= 500;
        if (p.position === 'TE' && posCounts.TE >= (r.te + r.flex_wrbte)) score -= 300;
        if (p.position === 'QB' && r.flex_super === 0 && currentPick < 30) score -= 400; // Standard devalue

        if (p.injuryStatus) score -= 400;
        return { ...p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [playerDatabase, data.picks, currentSlot.col, settings, currentPick]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isMyTurn ? 'bg-emerald-500 text-black animate-pulse' : 'bg-slate-800 text-emerald-400'}`}>
            {isMyTurn ? <Flame className="w-6 h-6 fill-current" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{settings.scoring_format} • {settings.total_teams} Teams</p>
            <h2 className="text-xl font-black text-white leading-tight">{isMyTurn ? 'YOUR TURN' : `Pick #${currentPick}: ${settings.team_names[currentSlot.col]}`}</h2>
          </div>
        </div>
        <div className={`flex flex-col items-end ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
          <span className="text-[10px] font-black uppercase opacity-60">Time</span>
          <span className="text-2xl font-mono font-black">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Top Recommendations</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {activeRecs.map((p, i) => (
            <button key={p.id} onClick={() => onQuickDraft(p, currentSlot.col, currentSlot.round)} className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 hover:border-emerald-500 rounded-xl transition-all group text-left">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black opacity-30">#{i+1}</span>
                <div><div className="text-xs font-bold text-white truncate max-w-[110px]">{p.name}</div><div className="text-[9px] font-bold text-slate-500 uppercase">{p.position} • {p.nflTeam}</div></div>
              </div>
              <UserPlus className="w-4 h-4 text-emerald-500 opacity-20 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
