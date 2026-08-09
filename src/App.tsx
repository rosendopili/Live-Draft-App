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
import { NFLPlayer } from './data/nflPlayers';

export default function App() {
  const [activeTab, setActiveTab] = useState<'board' | 'available' | 'rosters' | 'settings'>('board');
  const [userApiKey, setUserApiKey] = useState<string>(localStorage.getItem('gemini_api_key') || '');
  
  useEffect(() => {
    localStorage.setItem('gemini_api_key', userApiKey);
  }, [userApiKey]);

  const [draftSettings, setDraftSettings] = useState<DraftSettings>({
    total_teams: 12, total_rounds: 16, draft_type: 'snake', scoring_format: 'PPR', my_team_column: 4,
    team_names: Object.fromEntries(Array.from({length: 16}, (_, i) => [i+1, `Team ${i+1}`])),
  });

  const [ocrResult, setOcrResult] = useState<OCRResult>({
    draft_info: { league_name: 'My Draft', total_teams: 12, total_rounds: 16, teams: Array.from({ length: 12 }, (_, i) => ({ column: i + 1, name: `Team ${i + 1}` })) },
    picks: [], summary: { total_detected: 0, avg_confidence: 1.0, processing_time_ms: 0 },
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
      return { ...prev, picks: newPicks, summary: { ...prev.summary, total_detected: newPicks.length } };
    });
  };

  const handleConfirmReset = () => {
    setOcrResult(prev => ({ ...prev, picks: [] }));
    setIsResetModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header hasApiKey={!!userApiKey} activeTab={activeTab} setActiveTab={setActiveTab} detectedCount={ocrResult.picks.length} onNewScan={() => setActiveTab('settings')} onOpenSettings={() => setIsSettingsModalOpen(true)} onOpenManualPick={() => setIsManualModalOpen(true)} onStartNewDraft={() => setIsResetModalOpen(true)} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
              <h2 className="text-xl font-bold mb-4">AI Advisor Settings</h2>
              <p className="text-sm text-slate-400 mb-6">Enter your Gemini API Key to enable live draft strategy recommendations. Key is stored locally only.</p>
              <input type="password" value={userApiKey} onChange={(e) => setUserApiKey(e.target.value)} placeholder="Paste Gemini API Key here..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              <button onClick={() => setActiveTab('board')} className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition">Return to Board</button>
            </div>
          </div>
        )}

        {activeTab === 'board' && (
          <div className="space-y-6">
            <DraftLiveStatusBar settings={draftSettings} data={ocrResult} onOpenUploadModal={() => setIsManualModalOpen(true)} onOpenSettingsModal={() => setIsSettingsModalOpen(true)} onResetBoard={() => setIsResetModalOpen(true)} />
            <SummaryStats data={ocrResult} />
            <DraftBoardGrid data={ocrResult} settings={draftSettings} onUpdatePick={handleUpdatePick} onAddPick={(r, c) => { setManualDefaultRound(r); setManualDefaultCol(c); setIsManualModalOpen(true); }} onEditPickClick={(p) => { setEditingPick(p); setIsEditModalOpen(true); }} />
          </div>
        )}

        {activeTab === 'available' && (
          <AvailablePlayersTab data={ocrResult} settings={draftSettings} onQuickDraftPlayer={(player, col, round) => {
            handleUpdatePick({ round, pick_in_round: col, overall_pick: ((round-1)*draftSettings.total_teams+col), team_column: col, team_name: draftSettings.team_names[col], player_name: player.name, position: player.position, nfl_team: player.nflTeam, raw_text: '', confidence: 1, status: 'confirmed' });
          }} apiKey={userApiKey} />
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
