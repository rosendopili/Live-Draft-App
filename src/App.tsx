import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DraftBoardGrid } from './components/DraftBoardGrid';
import { EditPickModal } from './components/EditPickModal';
import { TeamRostersTab } from './components/TeamRostersTab';
import { SummaryStats } from './components/SummaryStats';
import { DraftSettingsModal } from './components/DraftSettingsModal';
import { DraftLiveStatusBar } from './components/DraftLiveStatusBar';
import { AvailablePlayersTab } from './components/AvailablePlayersTab';
import { ManualPickModal } from './components/ManualPickModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { DraftPick, OCRResult, DraftSettings } from './types';
import { INITIAL_NFL_PLAYERS, NFLPlayer } from './data/nflPlayers';
import { fetchSleeperPlayers } from './services/sleeperApi';

export default function App() {
  const [activeTab, setActiveTab] = useState<'board' | 'available' | 'rosters'>('board');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [playerDatabase, setPlayerDatabase] = useState<NFLPlayer[]>(INITIAL_NFL_PLAYERS);

  useEffect(() => {
    fetch('/api/health').then(res => res.json()).then(data => setHasApiKey(!!data.hasApiKey)).catch(() => setHasApiKey(false));
  }, []);

  useEffect(() => {
    async function sync() {
      const live = await fetchSleeperPlayers();
      if (live.length > 0) {
        setPlayerDatabase(prev => {
          const merged = [...prev];
          const seen = new Set(prev.map(p => p.name.toLowerCase()));
          live.forEach(lp => { if (!seen.has(lp.name.toLowerCase())) merged.push(lp); });
          return merged;
        });
      }
    }
    sync();
  }, []);

  const [draftSettings, setDraftSettings] = useState<DraftSettings>({
    total_teams: 12, total_rounds: 16, draft_type: 'snake', scoring_format: 'PPR', my_team_column: 1, time_per_pick: 60,
    team_names: Object.fromEntries(Array.from({length: 16}, (_, i) => [i+1, `Team ${i+1}`])),
  });

  const [ocrResult, setOcrResult] = useState<OCRResult>({
    draft_info: { league_name: 'My Draft', total_teams: 12, total_rounds: 16, teams: Array.from({ length: 12 }, (_, i) => ({ column: i + 1, name: `Team ${i + 1}` })) },
    picks: [],
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualRound, setManualRound] = useState(1);
  const [manualCol, setManualCol] = useState(1);
  const [editingPick, setEditingPick] = useState<DraftPick | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleUpdatePick = (p: DraftPick) => {
    setOcrResult((prev) => {
      const idx = prev.picks.findIndex((old) => old.round === p.round && old.team_column === p.team_column);
      let next = [...prev.picks];
      if (idx >= 0) next[idx] = p; else next.push(p);
      return { ...prev, picks: next };
    });
  };

  const handleQuickDraft = (p: NFLPlayer, col: number, round: number) => {
    handleUpdatePick({
      round, pick_in_round: col, overall_pick: ((round-1)*draftSettings.total_teams+col),
      team_column: col, team_name: draftSettings.team_names[col], player_name: p.name,
      position: p.position, nfl_team: p.nflTeam, raw_text: '', confidence: 1, status: 'confirmed'
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans overflow-x-hidden selection:bg-amber-600 selection:text-white">
      <Header hasApiKey={hasApiKey} activeTab={activeTab} setActiveTab={setActiveTab} onOpenSettings={() => setIsSettingsModalOpen(true)} onOpenManualPick={() => setIsManualModalOpen(true)} onStartNewDraft={() => setIsResetModalOpen(true)} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 overflow-hidden">
        {activeTab === 'board' && (
          <div className="space-y-6">
            <DraftLiveStatusBar settings={draftSettings} data={ocrResult} playerDatabase={playerDatabase} onQuickDraft={handleQuickDraft} />
            <SummaryStats data={ocrResult} />
            <DraftBoardGrid data={ocrResult} settings={draftSettings} onUpdatePick={handleUpdatePick} onAddPick={(r, c) => { setManualRound(r); setManualCol(c); setIsManualModalOpen(true); }} onEditPickClick={(p) => { setEditingPick(p); setIsEditModalOpen(true); }} />
          </div>
        )}
        {activeTab === 'available' && <AvailablePlayersTab data={ocrResult} settings={draftSettings} playerDatabase={playerDatabase} onQuickDraftPlayer={handleQuickDraft} />}
        {activeTab === 'rosters' && <TeamRostersTab data={ocrResult} settings={draftSettings} onEditPickClick={(p) => { setEditingPick(p); setIsEditModalOpen(true); }} />}
      </main>

      <ResetConfirmModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} onConfirmReset={() => { setOcrResult(prev => ({ ...prev, picks: [] })); setIsResetModalOpen(false); }} currentPicksCount={ocrResult.picks.length} />
      <ManualPickModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} settings={draftSettings} data={ocrResult} onSavePick={handleUpdatePick} defaultRound={manualRound} defaultCol={manualCol} playerDatabase={playerDatabase} />
      <DraftSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} settings={draftSettings} onSaveSettings={setDraftSettings} />
      <EditPickModal pick={editingPick} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdatePick} onDelete={(r, c) => setOcrResult(prev => ({ ...prev, picks: prev.picks.filter(p => !(p.round === r && p.team_column === c)) }))} totalTeams={ocrResult.draft_info.total_teams} />
    </div>
  );
}
