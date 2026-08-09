import React, { useState, useMemo } from 'react';
import { Position, DraftSettings, OCRResult } from '../types';
import { NFLPlayer } from '../data/nflPlayers';
import { Search, Sparkles, UserPlus, RefreshCw, AlertCircle, TrendingUp, Activity, User } from 'lucide-react';

interface AvailablePlayersTabProps {
  data: OCRResult;
  settings: DraftSettings;
  playerDatabase: NFLPlayer[];
  onQuickDraftPlayer: (player: NFLPlayer, col: number, round: number) => void;
}

const POSITIONS: (Position | 'ALL')[] = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DST'];

export const AvailablePlayersTab: React.FC<AvailablePlayersTabProps> = ({
  data, settings, playerDatabase, onQuickDraftPlayer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPos, setSelectedPos] = useState<Position | 'ALL'>('ALL');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const myCol = settings.my_team_column || 1;
  const myTeamName = settings.team_names[myCol] || `Team ${myCol}`;

  const currentPick = data.picks.length + 1;
  const currentRound = Math.ceil(currentPick / settings.total_teams);
  const pickInRound = ((currentPick - 1) % settings.total_teams) + 1;
  const currentCol = (settings.draft_type === 'snake' && currentRound % 2 === 0) ? settings.total_teams - pickInRound + 1 : pickInRound;

  const draftedSet = useMemo(() => new Set(data.picks.map(p => p.player_name.toLowerCase())), [data.picks]);
  
  // Scoring logic helper to be used in recommendations
  const calculatePlayerScore = (p: NFLPlayer, drafted: Set<string>, myRoster: any[], currentP: number, scoringFormat: string) => {
    if (drafted.has(p.name.toLowerCase())) return -10000;
    
    let score = 1000 - p.rank;
    
    // 1. ADP Reach Penalty: Prevent recommending players way too early
    // If a player's ADP is more than 1.5 rounds (18 picks) after current pick, penalize heavily
    const adpGap = p.adp - currentP;
    if (adpGap > 18) {
      score -= (adpGap - 18) * 15;
    }

    // 2. Positional Scarcity & Value
    const isSuperflex = scoringFormat === '2QB / Superflex';
    const qbCount = myRoster.filter(r => r.position === 'QB').length;
    const teCount = myRoster.filter(r => r.position === 'TE').length;
    const rbCount = myRoster.filter(r => r.position === 'RB').length;
    const wrCount = myRoster.filter(r => r.position === 'WR').length;

    if (p.position === 'QB') {
      if (!isSuperflex) {
        score *= 0.8; // Lower baseline value for QB in 1QB leagues
        if (qbCount >= 1) score -= 400; // Drastic penalty for 2nd QB
      } else {
        if (qbCount >= 2) score -= 300;
      }
    }

    if (p.position === 'TE') {
      score *= 0.9;
      if (teCount >= 1) score -= 300;
    }

    if (p.position === 'RB') {
      if (rbCount >= 3) score *= 0.9;
    }

    if (p.position === 'WR') {
      if (wrCount >= 4) score *= 0.9;
    }

    // 3. Injury Penalty
    if (p.injuryStatus) {
      score -= 200;
    }

    return score;
  };

  const smartRecommendations = useMemo(() => {
    const myRoster = data.picks.filter(p => p.team_column === myCol);
    return playerDatabase
      .filter(p => !draftedSet.has(p.name.toLowerCase()) && p.nflTeam && p.nflTeam !== 'FA')
      .map(p => ({ ...p, calculatedScore: calculatePlayerScore(p, draftedSet, myRoster, currentPick, settings.scoring_format) }))
      .sort((a, b) => b.calculatedScore - a.calculatedScore)
      .slice(0, 3);
  }, [playerDatabase, draftedSet, data.picks, myCol, currentPick, settings.scoring_format]);

  const filteredPlayers = useMemo(() => {
    return playerDatabase
      .filter(p => 
        !draftedSet.has(p.name.toLowerCase()) && 
        p.nflTeam && p.nflTeam !== 'FA' && 
        (selectedPos === 'ALL' || p.position === selectedPos) && 
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => a.rank - b.rank);
  }, [draftedSet, selectedPos, searchQuery, playerDatabase]);

  const handleFetchAiRecommendation = async () => {
    setIsAiLoading(true); setAiError(null); setAiAnalysis(null);
    try {
      const myRoster = data.picks.filter(p => p.team_column === myCol).map(p => `${p.player_name} (${p.position})`);
      const topAvail = smartRecommendations.map(p => `${p.name} (${p.position}, Rank: ${p.rank}, ADP: ${p.adp})`);
      const prompt = `Expert advice for ${myTeamName} (slot ${myCol}). League: ${settings.scoring_format}. My Roster: ${myRoster.join(', ') || 'Empty'}. Top Available (Ranked): ${topAvail.join(', ')}. Current overall pick: ${currentPick}. Account for ADP and positional value (QB/TE devalued vs high-premium RB/WR). Give 3 concise strategic bullet points.`;
      const res = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Server error');
      setAiAnalysis(json.recommendation);
    } catch (err: any) { setAiError(err.message); } finally { setIsAiLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600/20 p-2 rounded-xl text-emerald-400"><User className="w-5 h-5"/></div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">ADP-Informed Targets</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Optimized for your roster needs and pick #{currentPick}</p>
            </div>
          </div>
          <button onClick={handleFetchAiRecommendation} disabled={isAiLoading} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg">
            {isAiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Ask Gemini Advisor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {smartRecommendations.map((p, idx) => (
            <div key={p.id} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between group hover:border-emerald-500/40 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="w-6 h-6 rounded-lg bg-emerald-600/10 text-emerald-500 flex items-center justify-center text-[10px] font-black border border-emerald-500/20">#{idx + 1}</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${p.position === 'QB' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{p.position}</span>
              </div>
              <div className="mb-4">
                <div className="font-black text-slate-100 truncate">{p.name}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">{p.nflTeam} • Rank #{p.rank} • ADP #{p.adp}</div>
              </div>
              <button onClick={() => onQuickDraftPlayer(p, currentCol, currentRound)} className="w-full py-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5"><UserPlus className="w-3 h-3"/> DRAFT</button>
            </div>
          ))}
        </div>

        {aiAnalysis && <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-4 text-xs leading-relaxed text-emerald-100 font-medium whitespace-pre-line mt-2">{aiAnalysis}</div>}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex flex-wrap gap-1.5 flex-1">
            {POSITIONS.map(pos => (
              <button key={pos} onClick={() => setSelectedPos(pos)} className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${selectedPos === pos ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>{pos}</button>
            ))}
          </div>
          <div className="relative lg:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search live rosters..." className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-colors" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredPlayers.slice(0, 100).map(p => (
            <div key={p.id} className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${p.position === 'QB' ? 'bg-red-500/10 text-red-500' : p.position === 'RB' ? 'bg-blue-500/10 text-blue-500' : p.position === 'WR' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>{p.position}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-sm text-slate-100">{p.name}</div>
                    {p.injuryStatus && <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-950/50 border border-red-500/30 text-[8px] font-black text-red-400 uppercase"><Activity className="w-2.5 h-2.5" /> {p.injuryStatus}</span>}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{p.nflTeam} • Rank #{p.rank}</div>
                </div>
              </div>
              <button onClick={() => onQuickDraftPlayer(p, currentCol, currentRound)} className="p-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-xl transition-all"><UserPlus className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
