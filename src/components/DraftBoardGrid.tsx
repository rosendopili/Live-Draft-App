import React, { useState, useMemo } from 'react';
import { DraftPick, Position, OCRResult, DraftSettings } from '../types';
import { PositionBadge } from './PositionBadge';
import { Search, Filter, AlertTriangle, CheckCircle, Edit3, Plus, Eye, Sparkles, User } from 'lucide-react';

interface DraftBoardGridProps {
  data: OCRResult;
  settings?: DraftSettings;
  onUpdatePick: (pick: DraftPick) => void;
  onAddPick: (round: number, col: number) => void;
  onEditPickClick: (pick: DraftPick) => void;
  imagePreviewUrl?: string;
}

export const DraftBoardGrid: React.FC<DraftBoardGridProps> = ({
  data,
  settings,
  onUpdatePick,
  onAddPick,
  onEditPickClick,
  imagePreviewUrl,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [showLowConfidenceOnly, setShowLowConfidenceOnly] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [focusedTeamCol, setFocusedTeamCol] = useState<number | 'ALL'>('ALL');

  const totalTeams = settings?.total_teams || data.draft_info.total_teams || 12;
  const totalRounds = settings?.total_rounds || data.draft_info.total_rounds || 16;
  const myTeamCol = settings?.my_team_column || 4;

  // Build a lookup matrix map: key = `${round}-${team_column}`
  const pickMap = useMemo(() => {
    const map = new Map<string, DraftPick>();
    data.picks.forEach((p) => {
      map.set(`${p.round}-${p.team_column}`, p);
    });
    return map;
  }, [data.picks]);

  // Filter picks for list or stats
  const filteredPicks = useMemo(() => {
    return data.picks.filter((p) => {
      const matchesSearch =
        p.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nfl_team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.raw_text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPos = selectedPosition === 'ALL' || p.position === selectedPosition;
      const matchesLowConf = !showLowConfidenceOnly || p.confidence < 0.75;
      return matchesSearch && matchesPos && matchesLowConf;
    });
  }, [data.picks, searchQuery, selectedPosition, showLowConfidenceOnly]);

  const lowConfidenceCount = useMemo(() => {
    return data.picks.filter((p) => p.confidence < 0.75).length;
  }, [data.picks]);

  return (
    <div className="space-y-6">
      {/* Control Bar & Filter Tools */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search player name, NFL team, or sticker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 min-h-[42px]"
            />
          </div>

          {/* Position Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DST'].map((pos) => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] ${
                  selectedPosition === pos
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Toggle Low Confidence & Original Image */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowLowConfidenceOnly(!showLowConfidenceOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all min-h-[40px] ${
                showLowConfidenceOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${lowConfidenceCount > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>Low Conf ({lowConfidenceCount})</span>
            </button>

            {imagePreviewUrl && (
              <button
                onClick={() => setShowImagePreview(!showImagePreview)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all min-h-[40px] ${
                  showImagePreview
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>{showImagePreview ? 'Hide Photo' : 'Board Photo'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Board Photo Reference Drawer */}
        {showImagePreview && imagePreviewUrl && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Physical Board Photo OCR Source</span>
              </span>
              <button
                onClick={() => setShowImagePreview(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 p-1"
              >
                Close Photo
              </button>
            </div>
            <div className="max-h-80 overflow-auto rounded-lg border border-slate-800 flex justify-center bg-black">
              <img src={imagePreviewUrl} alt="Source Draft Board" className="max-h-80 object-contain" />
            </div>
          </div>
        )}
      </div>

      {/* Draft Board Matrix Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-6 shadow-xl space-y-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>Transcribed Draft Board</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {totalRounds} Rnds × {totalTeams} Teams
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any sticker cell to verify or edit player information.
            </p>
          </div>

          {/* View Filter (Mobile & Tablet Friendly) */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 shrink-0">View Mode:</span>
            <select
              value={focusedTeamCol}
              onChange={(e) => setFocusedTeamCol(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 min-h-[38px]"
            >
              <option value="ALL">Full 12-Team Matrix</option>
              <option value={myTeamCol}>
                Col {myTeamCol}: {settings?.team_names?.[myTeamCol] || `Team ${myTeamCol}`} (MY TEAM)
              </option>
              {Array.from({ length: totalTeams }, (_, i) => i + 1)
                .filter((col) => col !== myTeamCol)
                .map((col) => (
                  <option key={col} value={col}>
                    Col {col}: {settings?.team_names?.[col] || `Team ${col}`}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Conditional Rendering: Focused Single-Team View or Full Matrix */}
        {focusedTeamCol !== 'ALL' ? (
          /* Focused Single-Team Mobile View */
          <div className="space-y-3 pt-1">
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                  Focused Team Column {focusedTeamCol}
                </span>
                <h4 className="text-base font-extrabold text-white">
                  {settings?.team_names?.[focusedTeamCol] || `Team ${focusedTeamCol}`}
                  {focusedTeamCol === myTeamCol && ' (YOUR TEAM)'}
                </h4>
              </div>
              <button
                onClick={() => setFocusedTeamCol('ALL')}
                className="text-xs font-bold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg"
              >
                Show All Teams
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: totalRounds }, (_, rIndex) => {
                const roundNum = rIndex + 1;
                const pick = pickMap.get(`${roundNum}-${focusedTeamCol}`);
                const isFiltered = pick && filteredPicks.includes(pick);

                return (
                  <div
                    key={roundNum}
                    className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-300 shrink-0">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">RND</span>
                      <span className="text-xs font-black">{roundNum}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {pick ? (
                        <div
                          onClick={() => onEditPickClick(pick)}
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            !isFiltered && (searchQuery || selectedPosition !== 'ALL' || showLowConfidenceOnly)
                              ? 'opacity-30'
                              : 'opacity-100'
                          } ${
                            pick.confidence < 0.75
                              ? 'bg-amber-950/40 border-amber-500/50'
                              : 'bg-slate-800 border-slate-700 hover:border-emerald-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400">
                              Pick #{pick.overall_pick}
                            </span>
                            <PositionBadge position={pick.position} size="sm" />
                          </div>
                          <div className="font-extrabold text-xs text-white truncate mt-0.5">
                            {pick.player_name}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                            <span className="font-bold text-slate-300">{pick.nfl_team}</span>
                            <span className="text-emerald-400 font-bold">{(pick.confidence * 100).toFixed(0)}% Conf</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAddPick(roundNum, focusedTeamCol)}
                          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 flex items-center justify-center space-x-1.5 text-xs text-slate-400 font-bold min-h-[44px]"
                        >
                          <Plus className="w-4 h-4 text-emerald-400" />
                          <span>Add Pick (Round {roundNum})</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Scrollable Matrix Table */
          <div className="overflow-x-auto pb-4 touch-pan-x">
            <table className="w-full border-collapse min-w-[850px]">
              <thead>
                <tr>
                  <th className="w-12 p-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-950/80 border border-slate-800 rounded-tl-lg">
                    Rnd
                  </th>
                  {Array.from({ length: totalTeams }, (_, i) => {
                    const teamCol = i + 1;
                    const isMyTeam = teamCol === myTeamCol;
                    const customName = settings?.team_names?.[teamCol];
                    const teamHeader = data.draft_info.teams?.find((t) => t.column === teamCol);
                    const displayName = customName || (teamHeader ? teamHeader.name : `Team ${teamCol}`);

                    return (
                      <th
                        key={teamCol}
                        className={`p-2 text-center text-xs font-bold transition-all min-w-[125px] border ${
                          isMyTeam
                            ? 'bg-emerald-950/80 border-emerald-500/60 ring-2 ring-emerald-500/30'
                            : 'bg-slate-950/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isMyTeam ? 'text-emerald-300' : 'text-emerald-400'}`}>
                            Pick {teamCol}
                          </span>
                          {isMyTeam && (
                            <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1 rounded uppercase">
                              MY TEAM
                            </span>
                          )}
                        </div>
                        <div className={`truncate max-w-[130px] font-extrabold ${isMyTeam ? 'text-emerald-200 text-sm' : 'text-slate-100'}`}>
                          {displayName}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: totalRounds }, (_, rIndex) => {
                  const roundNum = rIndex + 1;
                  return (
                    <tr key={roundNum} className="hover:bg-slate-800/20 transition-colors">
                      {/* Round Header Cell */}
                      <td className="p-2 text-center font-black text-xs text-slate-400 bg-slate-950/50 border border-slate-800">
                        R{roundNum}
                      </td>

                      {/* Team Pick Cells */}
                      {Array.from({ length: totalTeams }, (_, cIndex) => {
                        const colNum = cIndex + 1;
                        const isMyTeam = colNum === myTeamCol;
                        const pick = pickMap.get(`${roundNum}-${colNum}`);

                        // Check if matches filter criteria
                        const isFiltered = pick && filteredPicks.includes(pick);

                        return (
                          <td
                            key={colNum}
                            className={`p-1 border border-slate-800/80 align-top transition-all ${
                              isMyTeam ? 'bg-emerald-950/20' : ''
                            }`}
                          >
                            {pick ? (
                              <div
                                onClick={() => onEditPickClick(pick)}
                                className={`group relative p-2 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                                  !isFiltered && (searchQuery || selectedPosition !== 'ALL' || showLowConfidenceOnly)
                                    ? 'opacity-25 grayscale'
                                    : 'opacity-100'
                                } ${
                                  pick.confidence < 0.75
                                    ? 'bg-amber-950/30 border-amber-500/50 hover:border-amber-400'
                                    : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/80 hover:border-emerald-500/60'
                                }`}
                              >
                                {/* Overall Pick Badge */}
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-bold text-slate-400">
                                    #{pick.overall_pick}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <PositionBadge position={pick.position} size="sm" />
                                  </div>
                                </div>

                                {/* Player Name */}
                                <div className="font-bold text-xs text-slate-100 truncate group-hover:text-emerald-300 transition-colors">
                                  {pick.player_name}
                                </div>

                                {/* NFL Team & Raw Sticker Text */}
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                                  <span className="font-extrabold uppercase text-slate-300">
                                    {pick.nfl_team}
                                  </span>
                                  <span
                                    className={`font-semibold px-1 py-0.2 rounded text-[9px] ${
                                      pick.confidence >= 0.85
                                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                                    }`}
                                    title={`Confidence: ${(pick.confidence * 100).toFixed(0)}%`}
                                  >
                                    {(pick.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>

                                {/* Edit Icon Hover */}
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 p-1 rounded-md border border-slate-700">
                                  <Edit3 className="w-3 h-3 text-emerald-400" />
                                </div>

                                {/* Warning tag for low confidence */}
                                {pick.confidence < 0.75 && (
                                  <div className="mt-1 flex items-center space-x-1 text-[9px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
                                    <span className="truncate">Needs Review</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Empty Slot */
                              <div
                                onClick={() => onAddPick(roundNum, colNum)}
                                className="h-16 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-800/30 flex flex-col items-center justify-center text-slate-600 hover:text-slate-400 cursor-pointer transition-all group min-h-[44px]"
                                title={`Add Pick to R${roundNum} C${colNum}`}
                              >
                                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-semibold mt-0.5">Empty</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
