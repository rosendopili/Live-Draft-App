import React from 'react';
import { DraftSettings, OCRResult, Position } from '../types';
import { Sparkles, RefreshCw, Clock, User, Award, Sliders, ArrowRight, ShieldAlert, CheckCircle2, Flame, Layers, RotateCcw } from 'lucide-react';

interface DraftLiveStatusBarProps {
  settings: DraftSettings;
  data: OCRResult;
  onOpenUploadModal: () => void;
  onOpenSettingsModal: () => void;
  onResetBoard?: () => void;
}

export const DraftLiveStatusBar: React.FC<DraftLiveStatusBarProps> = ({
  settings,
  data,
  onOpenUploadModal,
  onOpenSettingsModal,
  onResetBoard,
}) => {
  const totalTeams = settings.total_teams || 12;
  const totalRounds = settings.total_rounds || 16;
  const totalDraftSpots = totalTeams * totalRounds;
  const detectedPicksCount = data.picks.length;

  // Compute draft order & current pick on the clock
  // Find highest pick number or next empty spot in draft order
  const getOverallPickForPosition = (round: number, col: number): number => {
    if (settings.draft_type === 'snake') {
      const isEvenRound = round % 2 === 0;
      const pickInRound = isEvenRound ? totalTeams - col + 1 : col;
      return (round - 1) * totalTeams + pickInRound;
    } else {
      // Linear draft
      return (round - 1) * totalTeams + col;
    }
  };

  const getSlotFromOverallPick = (overall: number) => {
    const round = Math.ceil(overall / totalTeams);
    const pickInRoundNum = ((overall - 1) % totalTeams) + 1;
    let col = pickInRoundNum;
    if (settings.draft_type === 'snake' && round % 2 === 0) {
      col = totalTeams - pickInRoundNum + 1;
    }
    return { round, col, pickInRoundNum };
  };

  // Build map of taken overall picks
  const takenOverallPicks = new Set<number>();
  data.picks.forEach((p) => {
    const overall = getOverallPickForPosition(p.round, p.team_column);
    takenOverallPicks.add(overall);
  });

  // Find current pick on clock (first unpicked overall pick from 1..totalDraftSpots)
  let currentClockOverall = 1;
  while (currentClockOverall <= totalDraftSpots && takenOverallPicks.has(currentClockOverall)) {
    currentClockOverall++;
  }

  const isDraftComplete = currentClockOverall > totalDraftSpots;
  const currentSlot = getSlotFromOverallPick(currentClockOverall);
  const currentTeamName =
    settings.team_names[currentSlot.col] ||
    data.draft_info.teams?.find((t) => t.column === currentSlot.col)?.name ||
    `Team ${currentSlot.col}`;

  const isMyTeamOnTheClock = currentSlot.col === settings.my_team_column && !isDraftComplete;

  // Compute user's next pick
  let myNextOverall = currentClockOverall;
  while (
    myNextOverall <= totalDraftSpots &&
    getSlotFromOverallPick(myNextOverall).col !== settings.my_team_column
  ) {
    myNextOverall++;
  }

  const picksUntilMyTurn = myNextOverall - currentClockOverall;

  // Compute user's current roster breakdown
  const myTeamPicks = data.picks.filter((p) => p.team_column === settings.my_team_column);
  const myPosCounts: Record<Position, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DST: 0 };
  myTeamPicks.forEach((p) => {
    if (myPosCounts[p.position] !== undefined) myPosCounts[p.position]++;
  });

  // Smart position recommendation based on league scoring & user roster
  const getRecommendation = () => {
    const format = settings.scoring_format || 'PPR';
    const { QB, RB, WR, TE, K, DST } = myPosCounts;

    if (format === '2QB / Superflex' && QB === 0) {
      return { pos: 'QB', note: '2QB/Superflex format prioritizes early Quarterbacks!' };
    }
    if (format === 'TE Premium' && TE === 0 && myTeamPicks.length >= 3) {
      return { pos: 'TE', note: 'TE Premium format offers 1.5 PPR for top Tight Ends.' };
    }
    if (RB === 0 && WR === 0) {
      return { pos: 'RB / WR', note: 'Target anchor RB or elite WR1 to solidify core.' };
    }
    if (WR < 2 && (format === 'PPR' || format === 'Half-PPR')) {
      return { pos: 'WR', note: 'PPR scoring strongly favors high-volume Target WRs.' };
    }
    if (RB < 2) {
      return { pos: 'RB', note: 'Secure reliable workhorse RB volume.' };
    }
    if (TE === 0 && myTeamPicks.length >= 4) {
      return { pos: 'TE', note: 'Consider locking in a top TE target.' };
    }
    if (QB === 0 && myTeamPicks.length >= 5) {
      return { pos: 'QB', note: 'Look for high-upside dual-threat QB.' };
    }
    return { pos: 'Best Player Available', note: 'Focus on highest value talent remaining.' };
  };

  const rec = getRecommendation();
  const myTeamName = settings.team_names[settings.my_team_column] || `Team ${settings.my_team_column}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        {/* Left: Live Status & Clock */}
        <div className="flex items-center space-x-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-lg ${
              isMyTeamOnTheClock
                ? 'bg-emerald-500 text-slate-950 animate-pulse shadow-emerald-500/40 ring-4 ring-emerald-500/20'
                : 'bg-slate-800 text-emerald-400 border border-slate-700'
            }`}
          >
            {isMyTeamOnTheClock ? <Flame className="w-6 h-6 fill-current" /> : <Clock className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Live Draft Status
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {settings.scoring_format} • {totalRounds} Rnds • {totalTeams} Teams ({settings.draft_type.toUpperCase()})
              </span>
            </div>

            <div className="flex items-center space-x-2 mt-0.5">
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                {isDraftComplete ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5" /> Draft Completed! All {totalDraftSpots} Picks Transcribed.
                  </span>
                ) : isMyTeamOnTheClock ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-black text-lg">
                    ⚡ YOU ARE ON THE CLOCK! (Pick #{currentClockOverall})
                  </span>
                ) : (
                  <span>
                    Pick #{currentClockOverall}: <span className="text-emerald-400">{currentTeamName}</span> (R{currentSlot.round}, P{currentSlot.col})
                  </span>
                )}
              </h2>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onResetBoard && (
            <button
              onClick={onResetBoard}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-red-950/50 hover:bg-red-900/80 text-red-300 border border-red-800/80 transition flex items-center space-x-1.5 shadow-sm active:scale-95"
              title="Start fresh draft & clear board picks"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>Reset Board</span>
            </button>
          )}

          <button
            onClick={onOpenSettingsModal}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Draft Settings</span>
          </button>

          <button
            onClick={onOpenUploadModal}
            className="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center space-x-2 shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Upload Latest Draft Photo</span>
          </button>
        </div>
      </div>

      {/* Middle Grid: User Countdown, Roster & Smart Advice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* User Pick Countdown Card */}
        <div
          className={`rounded-xl p-3.5 border flex flex-col justify-between ${
            isMyTeamOnTheClock
              ? 'bg-emerald-950/50 border-emerald-500/60 ring-2 ring-emerald-500/30'
              : 'bg-slate-800/60 border-slate-700/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>My Team (Col {settings.my_team_column}): <strong className="text-white">{myTeamName}</strong></span>
            </span>
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              Pick #{settings.my_team_column}
            </span>
          </div>

          <div className="mt-2 space-y-1">
            {isDraftComplete ? (
              <div className="text-xs text-slate-400">All picks completed. Review team rosters.</div>
            ) : isMyTeamOnTheClock ? (
              <div className="text-sm font-extrabold text-emerald-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span>Make your pick now! Upload board photo after sticker is placed.</span>
              </div>
            ) : (
              <div className="text-xs font-semibold text-slate-200">
                Next Pick in <span className="text-emerald-400 font-extrabold text-sm">{picksUntilMyTurn} picks</span> (Pick #{myNextOverall})
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Draft Board Progress</span>
              <span>{detectedPicksCount} / {totalDraftSpots} ({((detectedPicksCount / totalDraftSpots) * 100).toFixed(0)}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/80">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (detectedPicksCount / totalDraftSpots) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* My Team Roster Summary */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>My Drafted Roster ({myTeamPicks.length} players)</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {Object.entries(myPosCounts).map(([pos, count]) => {
              const req = settings.roster_settings
                ? (settings.roster_settings[pos.toLowerCase() as keyof typeof settings.roster_settings] ?? 0)
                : (pos === 'K' || pos === 'DST' ? 1 : pos === 'QB' || pos === 'TE' ? 1 : 2);

              if (req === 0 && count === 0) return null;

              return (
                <span
                  key={pos}
                  className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border ${
                    count >= req && count > 0
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                      : count > 0
                      ? 'bg-slate-900 text-slate-100 border-slate-600'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  {pos}: {count}{req > 0 ? `/${req}` : ''}
                </span>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 truncate pt-1">
            {myTeamPicks.length > 0 ? (
              <span>Last Pick: <strong className="text-slate-200">{myTeamPicks[myTeamPicks.length - 1].player_name}</strong> ({myTeamPicks[myTeamPicks.length - 1].position})</span>
            ) : (
              <span className="italic text-slate-500">No players drafted yet for your team.</span>
            )}
          </div>
        </div>

        {/* Smart Scoring Format Strategy Target */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center space-x-1 text-xs font-bold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recommended Position Target ({settings.scoring_format})</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold">
              {rec.pos}
            </span>
            <p className="text-xs text-slate-300 leading-tight flex-1">
              {rec.note}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
