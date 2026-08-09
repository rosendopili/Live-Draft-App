import React, { useState, useMemo } from 'react';
import { DraftPick, OCRResult, DraftSettings } from '../types';
import { PositionBadge } from './PositionBadge';
import { Plus, X } from 'lucide-react';

interface DraftBoardGridProps {
  data: OCRResult;
  settings?: DraftSettings;
  onUpdatePick: (pick: DraftPick) => void;
  onAddPick: (round: number, col: number) => void;
  onEditPickClick: (pick: DraftPick) => void;
}

export const DraftBoardGrid: React.FC<DraftBoardGridProps> = ({
  data, settings, onAddPick, onEditPickClick,
}) => {
  const [focusedRound, setFocusedRound] = useState<number | null>(null);

  const totalTeams = settings?.total_teams || 12;
  const totalRounds = settings?.total_rounds || 16;
  const myTeamCol = settings?.my_team_column || 1;

  const pickMap = useMemo(() => {
    const map = new Map<string, DraftPick>();
    data.picks.forEach((p) => map.set(`${p.round}-${p.team_column}`, p));
    return map;
  }, [data.picks]);

  return (
    <div className="space-y-6">
      {focusedRound ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl animate-in zoom-in duration-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">ROUND {focusedRound}</h3>
            <button onClick={() => setFocusedRound(null)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-3">
            {Array.from({ length: totalTeams }, (_, i) => {
              const col = i + 1;
              const pick = pickMap.get(`${focusedRound}-${col}`);
              const teamName = settings?.team_names[col] || `Team ${col}`;
              return (
                <div key={col} className={`flex items-center justify-between p-4 rounded-2xl border ${col === myTeamCol ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-950/50 border-slate-800'}`}>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Slot {col}</span>
                    <span className={`font-bold ${col === myTeamCol ? 'text-emerald-400' : 'text-slate-300'}`}>{teamName}</span>
                  </div>
                  <div className="flex-1 text-right pr-4">
                    {pick ? (
                      <div onClick={() => onEditPickClick(pick)} className="cursor-pointer inline-flex items-center gap-3">
                        <span className="font-black text-white">{pick.player_name}</span>
                        <PositionBadge position={pick.position} size="sm" />
                      </div>
                    ) : (
                      <button onClick={() => onAddPick(focusedRound, col)} className="text-xs font-bold text-slate-600 hover:text-emerald-400 transition flex items-center gap-1 ml-auto">EMPTY <Plus className="w-3 h-3"/></button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 sm:p-4 shadow-xl overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-2 text-[10px] font-black text-slate-500 uppercase">Rnd</th>
                {Array.from({ length: totalTeams }, (_, i) => (
                  <th key={i} className={`p-2 text-[10px] font-black uppercase text-center border-x border-slate-800/50 ${i + 1 === myTeamCol ? 'text-emerald-400' : 'text-slate-400'}`}>Slot {i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: totalRounds }, (_, r) => (
                <tr key={r} className="border-t border-slate-800/50">
                  <td onClick={() => setFocusedRound(r + 1)} className="p-2 text-center font-black text-xs text-emerald-500 cursor-pointer hover:bg-emerald-500/10 transition-colors rounded-lg">R{r + 1}</td>
                  {Array.from({ length: totalTeams }, (_, c) => {
                    const pick = pickMap.get(`${r + 1}-${c + 1}`);
                    return (
                      <td key={c} className={`p-1 min-w-[120px] ${c + 1 === myTeamCol ? 'bg-emerald-500/5' : ''}`}>
                        {pick ? (
                          <div onClick={() => onEditPickClick(pick)} className="p-2 rounded-xl border transition-all cursor-pointer bg-slate-800/50 border-slate-700 hover:border-emerald-500/50">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[8px] font-black text-slate-500">#{pick.overall_pick}</span>
                              <PositionBadge position={pick.position} size="xs" />
                            </div>
                            <div className="text-[10px] font-bold text-white truncate">{pick.player_name}</div>
                          </div>
                        ) : (
                          <div onClick={() => onAddPick(r + 1, c + 1)} className="h-10 rounded-xl border border-dashed border-slate-800/50 flex items-center justify-center cursor-pointer hover:bg-slate-800/30 transition-all"><Plus className="w-3 h-3 text-slate-700" /></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
