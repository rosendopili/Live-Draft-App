import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { DraftBoardGrid } from './components/DraftBoardGrid';
import { EditPickModal } from './components/EditPickModal';
import { RawJsonTab } from './components/RawJsonTab';
import { TeamRostersTab } from './components/TeamRostersTab';
import { SummaryStats } from './components/SummaryStats';
import { DraftSettingsModal } from './components/DraftSettingsModal';
import { DraftLiveStatusBar } from './components/DraftLiveStatusBar';
import { AvailablePlayersTab } from './components/AvailablePlayersTab';
import { ManualPickModal } from './components/ManualPickModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { SAMPLE_BOARDS } from './data/sampleBoards';
import { DraftPick, OCRResult, DraftSettings } from './types';
import { NFLPlayer } from './data/nflPlayers';

export default function App() {
  const [activeTab, setActiveTab] = useState<'board' | 'available' | 'rosters' | 'json' | 'samples'>('samples');
  const [userApiKey, setUserApiKey] = useState<string>(localStorage.getItem('gemini_api_key') || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (userApiKey) {
      localStorage.setItem('gemini_api_key', userApiKey);
    }
  }, [userApiKey]);

  const [draftSettings, setDraftSettings] = useState<DraftSettings>({
    total_teams: 12, total_rounds: 16, draft_type: 'snake', scoring_format: 'PPR', my_team_column: 4,
    team_names: { 1: 'Team 1', 2: 'Team 2', 3: 'Team 3', 4: 'Team 4', 5: 'Team 5', 6: 'Team 6', 7: 'Team 7', 8: 'Team 8', 9: 'Team 9', 10: 'Team 10', 11: 'Team 11', 12: 'Team 12' },
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [manualDefaultRound, setManualDefaultRound] = useState<number>(1);
  const [manualDefaultCol, setManualDefaultCol] = useState<number>(1);

  const [ocrResult, setOcrResult] = useState<OCRResult>({
    draft_info: { league_name: 'My Draft', total_teams: 12, total_rounds: 16, teams: Array.from({ length: 12 }, (_, i) => ({ column: i + 1, name: `Team ${i + 1}` })) },
    picks: [], summary: { total_detected: 0, avg_confidence: 1.0, processing_time_ms: 0 },
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>(undefined);

  const handleConfirmReset = () => {
    const teamsList = Array.from({ length: draftSettings.total_teams }, (_, i) => ({ column: i + 1, name: draftSettings.team_names[i + 1] || `Team ${i + 1}` }));
    setOcrResult({ draft_info: { league_name: 'Fresh Draft', total_teams: draftSettings.total_teams, total_rounds: draftSettings.total_rounds, teams: teamsList }, picks: [], summary: { total_picks_detected: 0, avg_confidence: 1.0, processing_time_ms: 0 } });
    setImagePreviewUrl(undefined);
    setActiveTab('board');
  };

  const [editingPick, setEditingPick] = useState<DraftPick | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const handleSaveSettings = (newSettings: DraftSettings) => {
    setDraftSettings(newSettings);
    setOcrResult((prev) => {
      const teamsList = Array.from({ length: newSettings.total_teams }, (_, i) => ({ column: i + 1, name: newSettings.team_names[i + 1] || `Team ${i + 1}` }));
      return { ...prev, draft_info: { ...prev.draft_info, total_teams: newSettings.total_teams, total_rounds: newSettings.total_rounds, teams: teamsList } };
    });
  };

  const handleProcessComplete = (result: OCRResult, previewUrl?: string) => {
    const updatedTeams = Array.from({ length: draftSettings.total_teams }, (_, i) => ({ column: i + 1, name: draftSettings.team_names[i + 1] || `Team ${i + 1}` }));
    setOcrResult({ ...result, draft_info: { ...result.draft_info, total_teams: draftSettings.total_teams, total_rounds: draftSettings.total_rounds, teams: updatedTeams } });
    if (previewUrl) setImagePreviewUrl(previewUrl);
    setActiveTab('board');
  };

  const handleUpdatePick = (updatedPick: DraftPick) => {
    setOcrResult((prev) => {
      const existingIndex = prev.picks.findIndex((p) => p.round === updatedPick.round && p.team_column === updatedPick.team_column);
      let newPicks = [...prev.picks];
      if (existingIndex >= 0) newPicks[existingIndex] = updatedPick; else newPicks.push(updatedPick);
      const totalPicks = newPicks.length;
      const avgConf = totalPicks > 0 ? newPicks.reduce((acc, p) => acc + p.confidence, 0) / totalPicks : 1.0;
      const lowConfCount = newPicks.filter((p) => p.confidence < 0.75).length;
      const posCounts: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DST: 0 };
      newPicks.forEach((p) => { if (posCounts[p.position] !== undefined) posCounts[p.position]++; });
      return { ...prev, picks: newPicks, summary: { total_detected: totalPicks, avg_confidence: Number(avgConf.toFixed(2)), low_confidence_count: lowConfCount, positions_breakdown: posCounts } };
    });
  };

  const handleDeletePick = (round: number, col: number) => { setOcrResult((prev) => ({ ...prev, picks: prev.picks.filter((p) => !(p.round === round && p.team_column === col)) })); };
  const handleAddPickClick = (round: number, col: number) => { setManualDefaultRound(round); setManualDefaultCol(col); setIsManualModalOpen(true); };
  const handleOpenManualPick = () => { setManualDefaultRound(1); setManualDefaultCol(draftSettings.my_team_column || 1); setIsManualModalOpen(true); };
  const handleEditPickClick = (pick: DraftPick) => { setEditingPick(pick); setIsEditModalOpen(true); };

  const handleQuickDraftPlayer = (player: NFLPlayer, col: number, round: number) => {
    const totalTeams = draftSettings.total_teams || 12;
    let pickInRound = col;
    if (draftSettings.draft_type === 'snake' && round % 2 === 0) pickInRound = totalTeams - col + 1;
    const overall = (round - 1) * totalTeams + pickInRound;
    const newPick: DraftPick = { round, pick_in_round: pickInRound, overall_pick: overall, team_column: col, team_name: draftSettings.team_names[col] || `Team ${col}`, player_name: player.name, position: player.position, nfl_team: player.nflTeam, raw_text: `${player.name} ${player.position} ${player.nflTeam}`, confidence: 1.0, status: 'confirmed', notes: 'Quick Draft' };
    handleUpdatePick(newPick);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header hasApiKey={!!userApiKey} activeTab={activeTab} setActiveTab={setActiveTab} detectedCount={ocrResult.picks.length} avgConfidence={ocrResult.summary?.avg_confidence} onNewScan={() => setActiveTab('samples')} onOpenSettings={() => setIsSettingsModalOpen(true)} onOpenManualPick={handleOpenManualPick} onStartNewDraft={() => setIsResetModalOpen(true)} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'samples' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <label className="block text-xs font-bold text-slate-400 mb-2">GEMINI API KEY (Saved to Browser Only)</label>
              <input type="password" value={userApiKey} onChange={(e) => setUserApiKey(e.target.value)} placeholder="Paste your Gemini API key here..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none" />
            </div>
            <ImageUploader onProcessComplete={handleProcessComplete} isLoading={isLoading} setIsLoading={setIsLoading} draftSettings={draftSettings} apiKey={userApiKey} />
          </div>
        )}

        {activeTab === 'board' && (
          <div className="space-y-6">
            <DraftLiveStatusBar settings={draftSettings} data={ocrResult} onOpenUploadModal={() => setActiveTab('samples')} onOpenSettingsModal={() => setIsSettingsModalOpen(true)} onResetBoard={() => setIsResetModalOpen(true)} />
            <SummaryStats data={ocrResult} />
            <DraftBoardGrid data={ocrResult} settings={draftSettings} onUpdatePick={handleUpdatePick} onAddPick={handleAddPickClick} onEditPickClick={handleEditPickClick} imagePreviewUrl={imagePreviewUrl} />
          </div>
        )}

        {activeTab === 'available' && (
          <AvailablePlayersTab data={ocrResult} settings={draftSettings} onQuickDraftPlayer={handleQuickDraftPlayer} onOpenManualModalWithPos={(col, round) => { if (col) setManualDefaultCol(col); if (round) setManualDefaultRound(round); setIsManualModalOpen(true); }} apiKey={userApiKey} />
        )}

        {activeTab === 'rosters' && (
          <TeamRostersTab data={ocrResult} settings={draftSettings} onEditPickClick={handleEditPickClick} />
        )}

        {activeTab === 'json' && <RawJsonTab data={ocrResult} />}
      </main>

      <ResetConfirmModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} onConfirmReset={handleConfirmReset} currentPicksCount={ocrResult.picks.length} />
      <ManualPickModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} settings={draftSettings} data={ocrResult} onSavePick={handleUpdatePick} defaultRound={manualDefaultRound} defaultCol={manualDefaultCol} />
      <DraftSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} settings={draftSettings} onSaveSettings={handleSaveSettings} onResetBoard={() => setIsResetModalOpen(true)} />
      <EditPickModal pick={editingPick} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdatePick} onDelete={handleDeletePick} totalTeams={ocrResult.draft_info.total_teams || 12} />
    </div>
  );
}
