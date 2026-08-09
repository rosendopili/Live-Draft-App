import React from 'react';
import { OCRResult, DraftPick, DraftSettings } from '../types';
import { PositionBadge } from './PositionBadge';
import { Users, Shield, Award, AlertCircle, AlertTriangle, User, Sparkles } from 'lucide-react';

interface TeamRostersTabProps {
  data: OCRResult;
  settings?: DraftSettings;
  onEditPickClick: (pick: DraftPick) => void;
}

export const TeamRostersTab: React.FC<TeamRostersTabProps> = ({ data, settings, onEditPickClick }) => {
  const totalTeams = settings?.total_teams || data.draft_info.total_teams || 12;
  const myTeamCol = settings?.my_team_column || 4;
  const [selectedTeamFilter, setSelectedTeamFilter] = React.useState<number | 'ALL'>('ALL');

  // Group picks by team column
  const teamsMap = Array.from({ length: totalTeams }, (_, i) => {
    const col = i + 1;
    const customName = settings?.team_names?.[col];
    const teamHeader = data.draft_info.teams?.find((t) => t.column === col);
    const name = customName || (teamHeader ? teamHeader.name : `Team ${col}`);
    const teamPicks = data.picks.filter((p) => p.team_column === col).sort((a, b) => a.round - b.round);

    // Positional counts
    const posCounts: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DST: 0 };
    teamPicks.forEach((p) => {
      if (posCounts[p.position] !== undefined) posCounts[p.position]++;
    });

    const avgConf = teamPicks.length > 0
      ? teamPicks.reduce((acc, p) => acc + p.confidence, 0) / teamPicks.length
      : 1.0;

    return {
      column: col,
      name,
      isMyTeam: col === myTeamCol,
      picks: teamPicks,
      posCounts,
      avgConf,
    };
  });

  const visibleTeams = selectedTeamFilter === 'ALL' 
    ? teamsMap 
    : teamsMap.filter((t) => t.column === selectedTeamFilter);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Team Column Analysis</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Transcribed Roster Breakdowns</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organized by draft board columns. View positional depth and confidence ratings for each team.
          </p>
        </div>

        {/* Mobile Filter Selector */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-bold text-slate-400">Filter Team:</span>
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 min-h-[40px]"
          >
            <option value="ALL">All {totalTeams} Teams</option>
            <option value={myTeamCol}>
              Col {myTeamCol}: {settings?.team_names?.[myTeamCol] || `Team ${myTeamCol}`} (MY TEAM)
            </option>
            {Array.from({ length: totalTeams }, (_, i) => i + 1)
              .filter((c) => c !== myTeamCol)
              .map((c) => (
                <option key={c} value={c}>
                  Col {c}: {settings?.team_names?.[c] || `Team ${c}`}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Grid of Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {visibleTeams.map((team) => (
          <div
            key={team.column}
            className={`rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between border transition-all ${
              team.isMyTeam
                ? 'bg-emerald-950/30 border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-emerald-500/10'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                      Column {team.column}
                    </span>
                    {team.isMyTeam && (
                      <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                        YOUR TEAM
                      </span>
                    )}
                  </div>
                  <h3 className={`text-base font-extrabold ${team.isMyTeam ? 'text-emerald-300 text-lg' : 'text-white'}`}>
                    {team.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-200">{team.picks.length} Picks</span>
                  <div className="text-[10px] text-slate-400">
                    Avg Conf: {(team.avgConf * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Positional Count Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-3">
                {Object.entries(team.posCounts).map(([pos, count]) => {
                  const req = settings?.roster_settings
                    ? (settings.roster_settings[pos.toLowerCase() as keyof typeof settings.roster_settings] ?? 0)
                    : (pos === 'K' || pos === 'DST' ? 1 : pos === 'QB' || pos === 'TE' ? 1 : 2);

                  const isNotRequired = req === 0 && count === 0;

                  return (
                    <span
                      key={pos}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center space-x-1 ${
                        isNotRequired
                          ? 'bg-slate-950/40 text-slate-600 border-slate-900 line-through opacity-50'
                          : count >= req && count > 0
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                          : count > 0
                          ? 'bg-slate-800 text-slate-200 border-slate-700'
                          : 'bg-slate-950 text-slate-500 border-slate-900'
                      }`}
                      title={req > 0 ? `Required Starters: ${req}` : 'Position disabled/not required in league'}
                    >
                      <span>{pos}:</span>
                      <span className="font-extrabold">{count}{req > 0 ? `/${req}` : ''}</span>
                    </span>
                  );
                })}
              </div>

              {/* Roster Pick List */}
              <div className="space-y-2 pt-3">
                {team.picks.length > 0 ? (
                  team.picks.map((pick) => (
                    <div
                      key={`${pick.round}-${pick.overall_pick}`}
                      onClick={() => onEditPickClick(pick)}
                      className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl p-2.5 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 w-6">
                          R{pick.round}
                        </span>
                        <PositionBadge position={pick.position} size="sm" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 truncate transition-colors">
                            {pick.player_name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-right flex-shrink-0">
                        <span className="text-[10px] font-black uppercase text-slate-400">
                          {pick.nfl_team}
                        </span>
                        {pick.confidence < 0.75 && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" title="Low Confidence Pick" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic py-4 text-center">
                    No picks detected in this column yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
