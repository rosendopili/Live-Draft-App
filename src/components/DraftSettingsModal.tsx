import React, { useState } from 'react';
import { Settings, X, Sliders, Users, Clock, Layers } from 'lucide-react';
import { DraftSettings, RosterSettings } from '../types';

interface DraftSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DraftSettings;
  onSaveSettings: (newSettings: DraftSettings) => void;
}

export const DraftSettingsModal: React.FC<DraftSettingsModalProps> = ({ isOpen, onClose, settings, onSaveSettings }) => {
  const [rounds, setRounds] = useState(settings.total_rounds);
  const [teams, setTeams] = useState(settings.total_teams);
  const [myCol, setMyCol] = useState(settings.my_team_column);
  const [time, setTime] = useState(settings.time_per_pick || 60);
  const [format, setFormat] = useState(settings.scoring_format || 'PPR');
  const [roster, setRoster] = useState<RosterSettings>(settings.roster_settings || { qb: 1, rb: 2, wr: 2, te: 1, flex: 1, k: 1, dst: 1, bench: 6 });
  const [teamNames, setTeamNames] = useState(settings.team_names);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex justify-between bg-slate-950/50 rounded-t-2xl">
          <h2 className="font-bold uppercase tracking-tight text-sm flex items-center gap-2"><Settings className="w-4 h-4"/> Draft Config</h2>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-white"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Sliders className="w-3 h-3"/> Core Settings</label>
              <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Scoring Format</span>
                  <select value={format} onChange={e => setFormat(e.target.value as any)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none">
                    <option value="PPR">Full PPR</option>
                    <option value="Half-PPR">Half PPR</option>
                    <option value="Standard">Standard (Non-PPR)</option>
                    <option value="TE Premium">TE Premium</option>
                    <option value="2QB / Superflex">2QB / Superflex</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-[10px] font-bold text-slate-400 block mb-1">Teams</span><input type="number" value={teams} onChange={e => setTeams(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" /></div>
                  <div><span className="text-[10px] font-bold text-slate-400 block mb-1">Rounds</span><input type="number" value={rounds} onChange={e => setRounds(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" /></div>
                </div>
                <div><span className="text-[10px] font-bold text-slate-400 block mb-1">Time (Seconds)</span><input type="number" value={time} onChange={e => setTime(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" /></div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Layers className="w-3 h-3"/> Roster Config</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                {Object.keys(roster).map(pos => (
                  <div key={pos} className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{pos}</span>
                    <input type="number" value={roster[pos as keyof RosterSettings]} onChange={e => setRoster({...roster, [pos]: Number(e.target.value)})} className="w-12 bg-slate-800 border border-slate-700 rounded px-1 py-1 text-center text-xs text-white" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Users className="w-3 h-3"/> Team Names & My Slot</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Array.from({length: teams}, (_, i) => (
                <div key={i+1} className="flex items-center gap-2">
                  <button type="button" onClick={() => setMyCol(i+1)} className={`w-8 h-8 rounded-lg text-[10px] font-black border transition-all ${myCol === i+1 ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>{i+1}</button>
                  <input value={teamNames[i+1] || ''} onChange={e => setTeamNames({...teamNames, [i+1]: e.target.value})} placeholder={`Team ${i+1}`} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 rounded-b-2xl">
          <button onClick={() => { onSaveSettings({...settings, total_teams: teams, total_rounds: rounds, my_team_column: myCol, team_names: teamNames, time_per_pick: time, scoring_format: format, roster_settings: roster}); onClose(); }} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black transition flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-lg">Apply Config</button>
        </div>
      </div>
    </div>
  );
};
