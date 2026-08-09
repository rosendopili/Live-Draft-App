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
  const [roster, setRoster] = useState<RosterSettings>(settings.roster_settings || { qb: 1, rb: 2, wr: 2, te: 1, flex_wrb: 0, flex_wrbte: 1, flex_super: 0, k: 1, dst: 1, bench: 6 });
  const [teamNames, setTeamNames] = useState(settings.team_names);

  if (!isOpen) return null;

  const rosterKeys: {key: keyof RosterSettings, label: string}[] = [
    {key: 'qb', label: 'QB'}, {key: 'rb', label: 'RB'}, {key: 'wr', label: 'WR'}, {key: 'te', label: 'TE'},
    {key: 'flex_wrb', label: 'Flex (WR/RB)'}, {key: 'flex_wrbte', label: 'Flex (W/R/T)'}, {key: 'flex_super', label: 'SuperFlex'},
    {key: 'k', label: 'K'}, {key: 'dst', label: 'DST'}, {key: 'bench', label: 'Bench'}
  ];

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
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Sliders className="w-3 h-3"/> Parameters</label>
              <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Scoring Format</span>
                  <select value={format} onChange={e => setFormat(e.target.value as any)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">
                    <option value="PPR">Full PPR</option>
                    <option value="Half-PPR">Half PPR</option>
                    <option value="Standard">Standard</option>
                    <option value="TE Premium">TE Premium</option>
                    <option value="2QB / Superflex">2QB / Superflex</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={teams} onChange={e => setTeams(Number(e.target.value))} placeholder="Teams" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" />
                  <input type="number" value={rounds} onChange={e => setRounds(Number(e.target.value))} placeholder="Rounds" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" />
                </div>
                <input type="number" value={time} onChange={e => setTime(Number(e.target.value))} placeholder="Seconds Per Pick" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Layers className="w-3 h-3"/> Roster Construction</label>
              <div className="grid grid-cols-1 gap-2 bg-slate-950/50 p-4 rounded-xl border border-slate-800 max-h-[200px] overflow-y-auto">
                {rosterKeys.map(({key, label}) => (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase">{label}</span>
                    <input type="number" value={roster[key]} onChange={e => setRoster({...roster, [key]: Number(e.target.value)})} className="w-12 bg-slate-800 border border-slate-700 rounded px-1 py-1 text-center text-xs text-white" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Users className="w-3 h-3"/> My Slot & Team Names</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Array.from({length: teams}, (_, i) => (
                <div key={i+1} className="flex items-center gap-2">
                  <button type="button" onClick={() => setMyCol(i+1)} className={`w-8 h-8 rounded-lg text-[10px] font-black border transition-all ${myCol === i+1 ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>{i+1}</button>
                  <input value={teamNames[i+1] || ''} onChange={e => setTeamNames({...teamNames, [i+1]: e.target.value})} placeholder={`Team ${i+1}`} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 rounded-b-2xl">
          <button onClick={() => { onSaveSettings({...settings, total_teams: teams, total_rounds: rounds, my_team_column: myCol, team_names: teamNames, time_per_pick: time, scoring_format: format, roster_settings: roster}); onClose(); }} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black transition flex items-center justify-center gap-2 uppercase tracking-widest text-xs">Update Settings</button>
        </div>
      </div>
    </div>
  );
};
