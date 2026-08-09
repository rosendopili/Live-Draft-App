import React, { useState, useMemo } from 'react';
import { DraftPick, Position, DraftSettings, OCRResult } from '../types';
import { INITIAL_NFL_PLAYERS, NFLPlayer } from '../data/nflPlayers';
import { GoogleGenAI } from '@google/genai';
import {
  Search,
  Sparkles,
  UserPlus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface AvailablePlayersTabProps {
  data: OCRResult;
  settings: DraftSettings;
  onQuickDraftPlayer: (player: NFLPlayer, col: number, round: number) => void;
  onOpenManualModalWithPos?: (col?: number, round?: number) => void;
  apiKey: string;
}

const POSITIONS: (Position | 'ALL')[] = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DST'];

export const AvailablePlayersTab: React.FC<AvailablePlayersTabProps> = ({
  data,
  settings,
  onQuickDraftPlayer,
  onOpenManualModalWithPos,
  apiKey,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPos, setSelectedPos] = useState<Position | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'rank' | 'adp' | 'pts' | 'tier'>('rank');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const totalTeams = settings.total_teams || 12;
  const myCol = settings.my_team_column || 1;
  const myTeamName = settings.team_names[myCol] || `Team ${myCol}`;

  const draftedSet = useMemo(() => {
    const set = new Set<string>();
    data.picks.forEach((p) => { if (p.player_name) set.add(p.player_name.trim().toLowerCase()); });
    return set;
  }, [data.picks]);

  const availablePlayers = useMemo(() => {
    return INITIAL_NFL_PLAYERS.filter((p) => {
      if (draftedSet.has(p.name.toLowerCase())) return false;
      if (selectedPos !== 'ALL' && p.position !== selectedPos) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.nflTeam.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'adp') return a.adp - b.adp;
      if (sortBy === 'pts') return b.projectedPtsPPR - a.projectedPtsPPR;
      if (sortBy === 'tier') return a.tier - b.tier;
      return a.rank - b.rank;
    });
  }, [draftedSet, selectedPos, searchQuery, sortBy]);

  const myPicks = useMemo(() => data.picks.filter((p) => p.team_column === myCol), [data.picks, myCol]);

  const handleFetchAiRecommendation = async () => {
    if (!apiKey) { setAiError('Please enter an API key on the Scan tab first.'); return; }
    setIsAiLoading(true); setAiError(null); setAiAnalysis(null);
    try {
      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Fantasy Expert Advice for ${myTeamName}. Format: ${settings.scoring_format}. Roster: ${JSON.stringify(myPicks.map(p => p.player_name))}. Available: ${JSON.stringify(availablePlayers.slice(0, 10).map(p => p.name))}. Provide 3 short tips.`;
      const result = await model.generateContent(prompt);
      setAiAnalysis((await result.response).text());
    } catch (err: any) { setAiError(err.message); } finally { setIsAiLoading(false); }
  };

  const getOverallPick = (round: number, col: number) => {
    const isSnake = settings.draft_type === 'snake';
    const pickInRound = (isSnake && round % 2 === 0) ? totalTeams - col + 1 : col;
    return (round - 1) * totalTeams + pickInRound;
  };

  const takenOverall = new Set(data.picks.map(p => getOverallPick(p.round, p.team_column)));
  let currentClock = 1; while (takenOverall.has(currentClock)) currentClock++;
  const round = Math.ceil(currentClock / totalTeams);
  const pickInR = ((currentClock - 1) % totalTeams) + 1;
  const col = (settings.draft_type === 'snake' && round % 2 === 0) ? totalTeams - pickInR + 1 : pickInR;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">Next Pick Advisor {col === myCol && <span className="text-xs bg-emerald-500 text-black px-2 py-0.5 rounded-full animate-pulse">YOUR TURN</span>}</h2>
            <p className="text-xs text-slate-400">Current Pick: #{currentClock} (Round {round}, Col {col})</p>
          </div>
          <button onClick={handleFetchAiRecommendation} disabled={isAiLoading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold transition flex items-center gap-2">
            {isAiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Ask Gemini AI
          </button>
        </div>
        {aiAnalysis && <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 text-xs whitespace-pre-line">{aiAnalysis}</div>}
        {aiError && <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-3 text-xs text-red-400 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{aiError}</div>}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex flex-wrap gap-1">
            {POSITIONS.map(pos => (
              <button key={pos} onClick={() => setSelectedPos(pos)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${selectedPos === pos ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}>{pos}</button>
            ))}
          </div>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search players..." className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-1.5 text-xs flex-1 outline-none focus:border-emerald-500" />
        </div>
        <div className="divide-y divide-slate-800">
          {availablePlayers.map(p => (
            <div key={p.id} className="py-3 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${p.position === 'QB' ? 'bg-red-500/20 text-red-400' : p.position === 'RB' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{p.position}</span>
                <div>
                  <div className="flex items-center gap-2"><span className="font-bold text-sm">{p.name}</span><span className="text-[10px] text-slate-500 uppercase">{p.nflTeam}</span></div>
                  <div className="text-[10px] text-slate-400">Rank #{p.rank} • Tier {p.tier} • ADP #{p.adp}</div>
                </div>
              </div>
              <button onClick={() => onQuickDraftPlayer(p, col, round)} className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> Draft</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
