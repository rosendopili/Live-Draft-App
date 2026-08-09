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
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [playerDatabase, setPlayerDatabase] = useState<NFLPlayer[]>(INITIAL_NFL_PLAYERS);

  // Check health endpoint for API Key presence on backend
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHasApiKey(!!data.hasApiKey))
      .catch(() => setHasApiKey(false));
  }, []);

  // Sync with Live Sleeper Data
  useEffect(() => {
    async function syncPlayers() {
      const livePlayers = await fetchSleeperPlayers();
      if (livePlayers.length > 0) {
        setPlayerDatabase(prev => {
          const merged = [...prev];
          const seenNames = new Set(prev.map(p => p.name.toLowerCase()));
          livePlayers.forEach(lp => { if (!seenNames.has(lp.name.toLowerCase())) merged.push(lp); });
          return merged;
        });
      }
    }
    syncPlayers();
  }, []);

  const [draftSettings, setDraftSettings] = useState<DraftSettings>({
    total_teams: 12, total_rounds: 16, draft_type: 'snake', scoring_format: 'PPR', my_team_column: 4,
    team_names: Object.fromEntries(Array.from({length: 16}, (_, i) => [i+1, `Team ${i+1}`])),
  });

  const [ocrResult, setOcrResult] = useState<OCRResult>({
    draft_info: { league_name: 'My Draft', total_teams: 12, total_rounds: 16, teams: Array.from({ length: 12 }, (_, i) => ({ column: i + 1, name: `Team ${i + 1}` })) },
    picks: [], summary: { total_detected: 0, avg_confidence: 1.0, processing_time_ms: 0, low_confidence_count: 0, positions_breakdown: { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DST: 0 } },
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualDefaultRound, setManualDefaultRound] = useState(1);
  const [manualDefaultCol, setManualDefaultCol] = useState(1);
  const [editingPick, setEditingPick] = useState<DraftPick | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleUpdatePick = (updatedPick: DraftPick) => {
    setOcrResult((prev) => {
      const existingIndex = prev.picks.findIndex((p) => p.round === updatedPick.round && p.team_column === updatedPick.team_column);
      let newPicks = [...prev.picks];
      if (existingIndex >= 0) newPicks[existingIndex] = updatedPick; else newPicks.push(updatedPick);
      return { ...prev, picks: newPicks, summary: { ...prev.summary!, total_detected: newPicks.length } };
    });
  };

  const handleConfirmReset = () => { setOcrResult(prev => ({ ...prev, picks: [] })); setIsResetModalOpen(false); };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header hasApiKey={hasApiKey} activeTab={activeTab} setActiveTab={setActiveTab} detectedCount={ocrResult.picks.length} onOpenManualPick={() => setIsManualModalOpen(true)} onStartNewDraft={() => setIsResetModalOpen(true)} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'board' && (
          <div className="space-y-6">
            <DraftLiveStatusBar settings={draftSettings} data={ocrResult} onOpenUploadModal={() => setIsManualModalOpen(true)} onOpenSettingsModal={() => setIsSettingsModalOpen(true)} onResetBoard={() => setIsResetModalOpen(true)} />
            <SummaryStats data={ocrResult} />
            <DraftBoardGrid data={ocrResult} settings={draftSettings} onUpdatePick={handleUpdatePick} onAddPick={(r, c) => { setManualDefaultRound(r); setManualDefaultCol(c); setIsManualModalOpen(true); }} onEditPickClick={(p) => { setEditingPick(p); setIsEditModalOpen(true); }} />
          </div>
        )}

        {activeTab === 'available' && (
          <AvailablePlayersTab data={ocrResult} settings={draftSettings} playerDatabase={playerDatabase} onQuickDraftPlayer={(player, col, round) => {
            handleUpdatePick({ round, pick_in_round: col, overall_pick: ((round-1)*draftSettings.total_teams+col), team_column: col, team_name: draftSettings.team_names[col], player_name: player.name, position: player.position, nfl_team: player.nflTeam, raw_text: '', confidence: 1, status: 'confirmed' });
          }} />
        )}

        {activeTab === 'rosters' && <TeamRostersTab data={ocrResult} settings={draftSettings} onEditPickClick={(p) => { setEditingPick(p); setIsEditModalOpen(true); }} />}
      </main>

      <ResetConfirmModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} onConfirmReset={handleConfirmReset} currentPicksCount={ocrResult.picks.length} />
      <ManualPickModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} settings={draftSettings} data={ocrResult} onSavePick={handleUpdatePick} defaultRound={manualDefaultRound} defaultCol={manualDefaultCol} />
      <DraftSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} settings={draftSettings} onSaveSettings={setDraftSettings} onResetBoard={() => setIsResetModalOpen(true)} />
      <EditPickModal pick={editingPick} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdatePick} onDelete={(r, c) => setOcrResult(prev => ({ ...prev, picks: prev.picks.filter(p => !(p.round === r && p.team_column === c)) }))} totalTeams={ocrResult.draft_info.total_teams} />
    </div>
  );
}
