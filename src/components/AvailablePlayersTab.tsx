import React, { useState, useMemo } from 'react';
import { DraftPick, Position, DraftSettings, OCRResult } from '../types';
import { INITIAL_NFL_PLAYERS, NFLPlayer } from '../data/nflPlayers';
import {
  Search,
  Filter,
  Sparkles,
  UserPlus,
  TrendingUp,
  Award,
  Zap,
  Check,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Shield,
  Layers,
  Flame,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

interface AvailablePlayersTabProps {
  data: OCRResult;
  settings: DraftSettings;
  onQuickDraftPlayer: (player: NFLPlayer, col: number, round: number) => void;
  onOpenManualModalWithPos?: (col?: number, round?: number) => void;
}

const POSITIONS: (Position | 'ALL')[] = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DST'];

export const AvailablePlayersTab: React.FC<AvailablePlayersTabProps> = ({
  data,
  settings,
  onQuickDraftPlayer,
  onOpenManualModalWithPos,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPos, setSelectedPos] = useState<Position | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'rank' | 'adp' | 'pts' | 'tier'>('rank');

  // AI Live Recommendation State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const totalTeams = settings.total_teams || 12;
  const totalRounds = settings.total_rounds || 16;
  const myCol = settings.my_team_column || 1;
  const myTeamName = settings.team_names[myCol] || `Team ${myCol}`;

  // Find set of drafted player names
  const draftedSet = useMemo(() => {
    const set = new Set<string>();
    data.picks.forEach((p) => {
      if (p.player_name) set.add(p.player_name.trim().toLowerCase());
    });
    return set;
  }, [data.picks]);

  // Filter available players
  const availablePlayers = useMemo(() => {
    return INITIAL_NFL_PLAYERS.filter((player) => {
      if (draftedSet.has(player.name.toLowerCase())) return false;
      if (selectedPos !== 'ALL' && player.position !== selectedPos) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          player.name.toLowerCase().includes(q) ||
          player.nflTeam.toLowerCase().includes(q) ||
          player.position.toLowerCase().includes(q) ||
          player.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'adp') return a.adp - b.adp;
      if (sortBy === 'pts') return b.projectedPtsPPR - a.projectedPtsPPR;
      if (sortBy === 'tier') return a.tier - b.tier;
      return a.rank - b.rank;
    });
  }, [draftedSet, selectedPos, searchQuery, sortBy]);

  // Compute User Roster Breakdown
  const myPicks = useMemo(() => {
    return data.picks.filter((p) => p.team_column === myCol).sort((a, b) => a.round - b.round);
  }, [data.picks, myCol]);

  const posCounts: Record<Position, number> = useMemo(() => {
    const counts: Record<Position, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DST: 0 };
    myPicks.forEach((p) => {
      if (counts[p.position] !== undefined) counts[p.position]++;
    });
    return counts;
  }, [myPicks]);

  // Calculate current pick on clock
  const getOverallPick = (round: number, col: number) => {
    if (settings.draft_type === 'snake') {
      const isEven = round % 2 === 0;
      const pickInRound = isEven ? totalTeams - col + 1 : col;
      return (round - 1) * totalTeams + pickInRound;
    }
    return (round - 1) * totalTeams + col;
  };

  const takenOverallPicks = useMemo(() => {
    const set = new Set<number>();
    data.picks.forEach((p) => set.add(getOverallPick(p.round, p.team_column)));
    return set;
  }, [data.picks, settings.draft_type, totalTeams]);

  let currentClockOverall = 1;
  const totalSpots = totalTeams * totalRounds;
  while (currentClockOverall <= totalSpots && takenOverallPicks.has(currentClockOverall)) {
    currentClockOverall++;
  }

  // Calculate round & col for current clock
  const getCurrentSlot = (overall: number) => {
    const round = Math.ceil(overall / totalTeams);
    const pickInRoundNum = ((overall - 1) % totalTeams) + 1;
    let col = pickInRoundNum;
    if (settings.draft_type === 'snake' && round % 2 === 0) {
      col = totalTeams - pickInRoundNum + 1;
    }
    return { round, col };
  };

  const currentSlot = getCurrentSlot(currentClockOverall);
  const isMyTurn = currentSlot.col === myCol;

  // Compute Top Recommended Targets Heuristically
  const recommendedTargets = useMemo(() => {
    // Exclude drafted
    const unpicked = INITIAL_NFL_PLAYERS.filter((p) => !draftedSet.has(p.name.toLowerCase()));
    const format = settings.scoring_format || 'PPR';
    const roster = settings.roster_settings || {
      qb: 1,
      rb: 2,
      wr: 2,
      te: 1,
      flex: 1,
      k: 1,
      dst: 1,
      bench: 6,
    };

    // Strategy weights based on scoring and roster requirements
    return unpicked
      .map((player) => {
        let score = 100 - player.rank;

        // Scoring format modifiers
        if (format === '2QB / Superflex' && player.position === 'QB') score += 40;
        if (format === 'TE Premium' && player.position === 'TE') score += 30;
        if ((format === 'PPR' || format === 'Half-PPR') && player.position === 'WR') score += 20;

        // Penalize positions that are disabled (e.g., 0 Kickers or 0 Defenses)
        if (player.position === 'K' && roster.k === 0) score -= 1000;
        if (player.position === 'DST' && roster.dst === 0) score -= 1000;

        // Dynamic roster need modifiers
        const maxNeededRB = roster.rb + roster.flex;
        const maxNeededWR = roster.wr + roster.flex;
        const maxNeededTE = roster.te + (roster.flex > 0 ? 1 : 0);

        if (player.position === 'QB' && posCounts.QB < roster.qb && myPicks.length >= 3) score += 30;
        if (player.position === 'RB' && posCounts.RB < maxNeededRB) score += 25;
        if (player.position === 'WR' && posCounts.WR < maxNeededWR) score += 25;
        if (player.position === 'TE' && posCounts.TE < maxNeededTE && myPicks.length >= 3) score += 20;

        return { player, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.player);
  }, [draftedSet, posCounts, myPicks.length, settings.scoring_format, settings.roster_settings]);

// Live Gemini AI Strategy Recommendation Request (Client-Side)
  const handleFetchAiRecommendation = async () => {
    setIsAiLoading(true);
    setAiError(null);
    setAiAnalysis(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is missing from Vercel settings.');

      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const topAvailableSummary = availablePlayers.slice(0, 15).map((p) => ({
        name: p.name, pos: p.position, team: p.nflTeam, rank: p.rank, tier: p.tier
      }));

      const myRosterSummary = myPicks.map((p) => ({
        round: p.round, name: p.player_name, pos: p.position
      }));

      const prompt = `
You are an elite fantasy football draft expert. Provide advice for ${myTeamName}.
League Settings: ${settings.scoring_format || 'PPR'}, ${settings.draft_type}.
Current State: Pick #${currentClockOverall} overall. ${isMyTurn ? 'THE MANAGER IS ON THE CLOCK.' : 'Waiting.'}
Roster So Far: ${JSON.stringify(myRosterSummary)}
Top Available: ${JSON.stringify(topAvailableSummary)}
Provide 3-5 bullet points of advice on who to pick next and why. Keep it concise.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiAnalysis(response.text() || 'No recommendation available.');
    } catch (err: any) {
      setAiError(err.message || 'Error generating AI strategy.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Smart Pick Recommendation Engine */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Live Draft Advisor ({settings.scoring_format})
              </span>
              <span className="text-xs font-bold text-slate-400">
                {myPicks.length} Drafted • Col {myCol} ({myTeamName})
              </span>
            </div>

            <h2 className="text-lg font-black text-white flex items-center gap-2">
              Next Pick Target Advisor
              {isMyTurn && (
                <span className="text-xs bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-black animate-pulse">
                  ON THE CLOCK
                </span>
              )}
            </h2>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-bold text-slate-400">Roster Requirements:</span>
              <span className="text-[10px] font-extrabold bg-slate-800 border border-slate-700/80 text-emerald-300 px-2 py-0.5 rounded-md">
                {settings.roster_settings ? (
                  `${settings.roster_settings.qb} QB • ${settings.roster_settings.rb} RB • ${settings.roster_settings.wr} WR • ${settings.roster_settings.te} TE • ${settings.roster_settings.flex} FLEX${settings.roster_settings.k > 0 ? ` • ${settings.roster_settings.k} K` : ''}${settings.roster_settings.dst > 0 ? ` • ${settings.roster_settings.dst} DST` : ''} • ${settings.roster_settings.bench} Bench`
                ) : (
                  '1 QB • 2 RB • 2 WR • 1 TE • 1 FLEX • 1 K • 1 DST • 6 Bench'
                )}
              </span>
            </div>
          </div>

          <button
            onClick={handleFetchAiRecommendation}
            disabled={isAiLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 transition flex items-center space-x-2 disabled:opacity-50"
          >
            {isAiLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-300" />
            )}
            <span>{isAiLoading ? 'Analyzing Board...' : 'Ask Gemini AI Recommendation'}</span>
          </button>
        </div>

        {/* Gemini AI Custom Response Box if fetched */}
        {aiAnalysis && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 text-xs text-emerald-100 space-y-2 animate-in fade-in duration-300">
            <div className="font-extrabold text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Gemini AI Strategy Recommendation:</span>
            </div>
            <p className="whitespace-pre-line leading-relaxed font-medium">{aiAnalysis}</p>
          </div>
        )}

        {aiError && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 text-xs text-red-300">
            {aiError}
          </div>
        )}

        {/* Top 3 Recommended Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {recommendedTargets.map((player, idx) => (
            <div
              key={player.id}
              className="bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-3.5 space-y-2.5 transition flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-white">{player.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      {player.nflTeam} • {player.positionRank} • ADP #{player.adp}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black ${
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
              </div>

              <p className="text-[11px] text-slate-300 italic leading-snug">
                {player.notes || player.tags.join(' • ')}
              </p>

              <button
                onClick={() => onQuickDraftPlayer(player, currentSlot.col, currentSlot.round)}
                className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1 shadow-md"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>
                  Draft to {currentSlot.col === myCol ? 'MY TEAM' : `Col ${currentSlot.col}`} (Pick #{currentClockOverall})
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Available Players Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          {/* Position Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => setSelectedPos(pos)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition border ${
                  selectedPos === pos
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search player, team, tag..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="rank">Sort by Rank</option>
              <option value="adp">Sort by ADP</option>
              <option value="pts">Sort by Projected Points</option>
              <option value="tier">Sort by Tier</option>
            </select>
          </div>
        </div>

        {/* Players List Grid / Table */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 flex justify-between px-2">
            <span>Showing {availablePlayers.length} Available Players</span>
            <span>Click "Draft" to record pick for current team on clock</span>
          </div>

          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            {availablePlayers.length > 0 ? (
              availablePlayers.map((player) => (
                <div
                  key={player.id}
                  className="p-3 hover:bg-slate-800/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left Player Info */}
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 ${
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
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-black text-white">{player.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          {player.nflTeam} • Bye {player.byeWeek}
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          Tier {player.tier}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                        <span>Rank #{player.rank} ({player.positionRank})</span>
                        <span>ADP #{player.adp}</span>
                        <span className="text-emerald-300 font-semibold">{player.projectedPtsPPR} Projected PPR Pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => onQuickDraftPlayer(player, currentSlot.col, currentSlot.round)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition flex items-center space-x-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Draft to Col {currentSlot.col}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <p className="text-sm font-bold">No available players matched your filter or search.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedPos('ALL');
                  }}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
