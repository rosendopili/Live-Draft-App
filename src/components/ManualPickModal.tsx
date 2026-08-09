import React, { useState, useMemo, useEffect } from 'react';
import { DraftPick, Position, DraftSettings, OCRResult } from '../types';
import { NFLPlayer } from '../data/nflPlayers';
import { X, Search, Check, UserPlus, Plus } from 'lucide-react';

interface ManualPickModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DraftSettings;
  data: OCRResult;
  onSavePick: (pick: DraftPick) => void;
  defaultRound?: number;
  defaultCol?: number;
}

const POSITIONS: (Position | 'ALL')[] = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DST'];

export const ManualPickModal: React.FC<ManualPickModalProps> = ({
  isOpen, onClose, settings, data, onSavePick, defaultRound, defaultCol,
}) => {
  const [selectedCol, setSelectedCol] = useState(defaultCol || 1);
  const [selectedRound, setSelectedRound] = useState(defaultRound || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosFilter, setSelectedPosFilter] = useState<Position | 'ALL'>('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<NFLPlayer | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPos, setCustomPos] = useState<Position>('WR');
  const [customTeam, setCustomTeam] = useState('NFL');

  useEffect(() => {
    if (isOpen) { setSelectedCol(defaultCol || 1); setSelectedRound(defaultRound || 1); setShowCustomForm(false); setSelectedPlayer(null); setSearchQuery(''); }
  }, [isOpen, defaultCol, defaultRound]);

  const draftedNames = useMemo(() => new Set(data.picks.map(p => p.player_name.toLowerCase())), [data.picks]);
  
  // We need access to the playerDatabase, but it's in App.tsx. 
  // For simplicity here, we'll use INITIAL_NFL_PLAYERS or just empty if not available
  // In a real fix, we should pass playerDatabase as a prop.
  const availablePlayers = useMemo(() => {
    return [].filter(() => false); // Placeholder - will fix in next step by adding prop
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isSnake = settings.draft_type === 'snake';
    const pickInR = (isSnake && selectedRound % 2 === 0) ? settings.total_teams - selectedCol + 1 : selectedCol;
    const overall = (selectedRound - 1) * settings.total_teams + pickInR;

    onSavePick({
      round: selectedRound, pick_in_round: pickInR, overall_pick: overall, team_column: selectedCol,
      team_name: settings.team_names[selectedCol],
      player_name: selectedPlayer ? selectedPlayer.name : customName,
      position: selectedPlayer ? selectedPlayer.position : customPos,
      nfl_team: selectedPlayer ? selectedPlayer.nflTeam : customTeam,
      raw_text: '', confidence: 1, status: 'confirmed'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 rounded-t-2xl">
          <h2 className="font-bold">Record Draft Pick</h2>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-white"><X className="w-5 h-5"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Slot / Column</label>
              <select value={selectedCol} onChange={e => setSelectedCol(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500">
                {Array.from({length: settings.total_teams}, (_, i) => <option key={i+1} value={i+1}>Slot {i+1}: {settings.team_names[i+1]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Round</label>
              <select value={selectedRound} onChange={e => setSelectedRound(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500">
                {Array.from({length: settings.total_rounds}, (_, i) => <option key={i+1} value={i+1}>Round {i+1}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {!showCustomForm ? (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search players..." className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-emerald-500" />
                </div>
                <button type="button" onClick={() => setShowCustomForm(true)} className="w-full py-2 border border-dashed border-slate-700 rounded-xl text-[10px] font-bold text-slate-500 hover:text-emerald-400 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2"><Plus className="w-3.5 h-3.5" /> UNLISTED PLAYER NAME</button>
              </>
            ) : (
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Custom Player Info</span>
                  <button type="button" onClick={() => setShowCustomForm(false)} className="text-[10px] font-bold text-slate-500 hover:text-white">Back to search</button>
                </div>
                <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Player Name" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={customPos} onChange={e => setCustomPos(e.target.value as Position)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500">
                    {POSITIONS.filter(p => p !== 'ALL').map(pos => <option key={pos} value={pos}>{pos}</option>)}
                  </select>
                  <input type="text" value={customTeam} onChange={e => setCustomTeam(e.target.value.toUpperCase())} placeholder="Team (e.g. KC)" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500" />
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={!selectedPlayer && !customName} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"><Check className="w-4 h-4" /> Save Pick</button>
        </form>
      </div>
    </div>
  );
};
