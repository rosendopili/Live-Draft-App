import React, { useState, useMemo, useEffect } from 'react';
import { DraftPick, Position, DraftSettings, OCRResult } from '../types';
import { INITIAL_NFL_PLAYERS, NFLPlayer } from '../data/nflPlayers';
import { X, Search, Check, UserPlus, Sparkles, Filter, AlertCircle, Layers } from 'lucide-react';

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
  isOpen,
  onClose,
  settings,
  data,
  onSavePick,
  defaultRound,
  defaultCol,
}) => {
  const totalTeams = settings.total_teams || 12;
  const totalRounds = settings.total_rounds || 16;

  const [selectedCol, setSelectedCol] = useState<number>(defaultCol || settings.my_team_column || 1);
  const [selectedRound, setSelectedRound] = useState<number>(defaultRound || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosFilter, setSelectedPosFilter] = useState<Position | 'ALL'>('ALL');

  const [selectedPlayer, setSelectedPlayer] = useState<NFLPlayer | null>(null);
  const [customPlayerName, setCustomPlayerName] = useState('');
  const [customPosition, setCustomPosition] = useState<Position>('WR');
  const [customNflTeam, setCustomNflTeam] = useState('NFL');

  useEffect(() => {
    if (defaultCol) setSelectedCol(defaultCol);
    if (defaultRound) setSelectedRound(defaultRound);
  }, [defaultCol, defaultRound, isOpen]);

  // Set of player names already drafted on current board
  const draftedPlayerNames = useMemo(() => {
    const set = new Set<string>();
    data.picks.forEach((p) => {
      if (p.player_name) {
        set.add(p.player_name.trim().toLowerCase());
      }
    });
    return set;
  }, [data.picks]);

  // Filter available NFL players
  const availablePlayers = useMemo(() => {
    return INITIAL_NFL_PLAYERS.filter((player) => {
      // Check if already drafted
      if (draftedPlayerNames.has(player.name.toLowerCase())) {
        return false;
      }
      // Position filter
      if (selectedPosFilter !== 'ALL' && player.position !== selectedPosFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          player.name.toLowerCase().includes(q) ||
          player.nflTeam.toLowerCase().includes(q) ||
          player.position.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [draftedPlayerNames, selectedPosFilter, searchQuery]);

  if (!isOpen) return null;

  // Calculate pick details based on round, col, draft type
  const calculateOverallPick = (round: number, col: number) => {
    if (settings.draft_type === 'snake') {
      const isEven = round % 2 === 0;
      const pickInRound = isEven ? totalTeams - col + 1 : col;
      return (round - 1) * totalTeams + pickInRound;
    }
    return (round - 1) * totalTeams + col;
  };

  const calculatePickInRound = (round: number, col: number) => {
    if (settings.draft_type === 'snake' && round % 2 === 0) {
      return totalTeams - col + 1;
    }
    return col;
  };

  const currentOverall = calculateOverallPick(selectedRound, selectedCol);
  const currentPickInRound = calculatePickInRound(selectedRound, selectedCol);
  const teamName = settings.team_names[selectedCol] || `Team ${selectedCol}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalName = '';
    let finalPos: Position = 'WR';
    let finalTeam = 'NFL';

    if (selectedPlayer) {
      finalName = selectedPlayer.name;
      finalPos = selectedPlayer.position;
      finalTeam = selectedPlayer.nflTeam;
    } else if (customPlayerName.trim()) {
      finalName = customPlayerName.trim();
      finalPos = customPosition;
      finalTeam = customNflTeam.trim().toUpperCase() || 'NFL';
    } else {
      return;
    }

    const newPick: DraftPick = {
      round: selectedRound,
      pick_in_round: currentPickInRound,
      overall_pick: currentOverall,
      team_column: selectedCol,
      team_name: teamName,
      player_name: finalName,
      position: finalPos,
      nfl_team: finalTeam,
      raw_text: `${finalName} ${finalPos} ${finalTeam}`,
      confidence: 1.0,
      status: 'confirmed',
      notes: 'Manually logged by user',
    };

    onSavePick(newPick);

    // Reset selection & close
    setSelectedPlayer(null);
    setCustomPlayerName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Manual Pick Entry
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Direct GM Logger
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Record a draft pick for any team on the board without needing a board photo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Top Parameters Bar */}
          <div className="p-4 bg-slate-800/60 border-b border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Select Team Column */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Draft Board Column / Team
                </label>
                <select
                  value={selectedCol}
                  onChange={(e) => setSelectedCol(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {Array.from({ length: totalTeams }, (_, i) => {
                    const c = i + 1;
                    const name = settings.team_names[c] || `Team ${c}`;
                    const isMyTeam = c === settings.my_team_column;
                    return (
                      <option key={c} value={c}>
                        Col {c}: {name} {isMyTeam ? '(YOUR TEAM)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Select Round */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Draft Round
                </label>
                <select
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {Array.from({ length: totalRounds }, (_, i) => {
                    const r = i + 1;
                    return (
                      <option key={r} value={r}>
                        Round {r}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Pick Summary Tag */}
            <div className="flex items-center justify-between text-xs bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-emerald-300 font-bold">
              <span>Target Slot: <strong>{teamName}</strong> (Col {selectedCol})</span>
              <span>Round {selectedRound}, Pick {currentPickInRound} (Overall #{currentOverall})</span>
            </div>
          </div>

          {/* Search & Filter Available Players */}
          <div className="p-4 space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedPlayer(null);
                  }}
                  placeholder="Search top available players (e.g. CeeDee, Josh Allen)..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Position Filter Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setSelectedPosFilter(pos)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold border transition ${
                      selectedPosFilter === pos
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Players Selection Grid */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 border border-slate-800 rounded-xl p-2 bg-slate-950/50">
              {availablePlayers.length > 0 ? (
                availablePlayers.map((player) => {
                  const isSelected = selectedPlayer?.id === player.id;
                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlayer(player);
                        setCustomPlayerName('');
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-950/80 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                          : 'bg-slate-800/80 border-slate-700/70 hover:bg-slate-700/80 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                            player.position === 'QB'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : player.position === 'RB'
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : player.position === 'WR'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : player.position === 'TE'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}
                        >
                          {player.position}
                        </span>

                        <div>
                          <div className="text-xs font-extrabold flex items-center gap-2">
                            <span>{player.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                              {player.nflTeam} • Bye {player.byeWeek}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-sm">
                            {player.positionRank} • ADP #{player.adp} • {player.notes || player.tags.join(', ')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-[11px] font-bold text-slate-300">Tier {player.tier}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 space-y-1">
                  <p>No matching pre-listed players found.</p>
                  <p className="text-[11px] text-slate-500">
                    Use the custom player input below to type any name!
                  </p>
                </div>
              )}
            </div>

            {/* Custom Unlisted Player Option */}
            <div className="p-3 bg-slate-800/70 border border-slate-700/80 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-slate-200">
                Or Type Custom Unlisted Player Name
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={customPlayerName}
                  onChange={(e) => {
                    setCustomPlayerName(e.target.value);
                    setSelectedPlayer(null);
                  }}
                  placeholder="e.g. Audric Estime"
                  className="sm:col-span-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />

                <select
                  value={customPosition}
                  onChange={(e) => setCustomPosition(e.target.value as Position)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {POSITIONS.filter((p) => p !== 'ALL').map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={customNflTeam}
                  onChange={(e) => setCustomNflTeam(e.target.value.toUpperCase())}
                  placeholder="NFL Team (e.g. DEN)"
                  maxLength={4}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!selectedPlayer && !customPlayerName.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20"
            >
              <Check className="w-4 h-4" />
              <span>Record Draft Pick</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
