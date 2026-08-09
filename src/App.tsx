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
import { Sparkles, Layers, ArrowLeft } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'board' | 'available' | 'rosters' | 'json' | 'samples'>('samples');
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Draft League Configuration Settings
  const [draftSettings, setDraftSettings] = useState<DraftSettings>({
    total_teams: 12,
    total_rounds: 16,
    draft_type: 'snake',
    scoring_format: 'PPR',
    my_team_column: 4,
    team_names: {
      1: 'Team 1',
      2: 'Team 2',
      3: 'Team 3',
      4: 'Team 4',
      5: 'Team 5',
      6: 'Team 6',
      7: 'Team 7',
      8: 'Team 8',
      9: 'Team 9',
      10: 'Team 10',
      11: 'Team 11',
      12: 'Team 12',
    },
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Manual Pick Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [manualDefaultRound, setManualDefaultRound] = useState<number>(1);
  const [manualDefaultCol, setManualDefaultCol] = useState<number>(1);

  // Current active draft board data (Initialize empty)
  const [ocrResult, setOcrResult] = useState<OCRResult>({
    draft_info: {
      league_name: 'My Draft',
      total_teams: 12,
      total_rounds: 16,
      teams: Array.from({ length: 12 }, (_, i) => ({ column: i + 1, name: `Team ${i + 1}` })),
    },
    picks: [],
    summary: {
      total_detected: 0,
      avg_confidence: 1.0,
      processing_time_ms: 0,
    },
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>(undefined);

  // Reset Board / Start New Draft handler
  const handleConfirmReset = () => {
    const teamsList = Array.from({ length: draftSettings.total_teams }, (_, i) => {
      const col = i + 1;
      return {
        column: col,
        name: draftSettings.team_names[col] || `Team ${col}`,
      };
    });

    setOcrResult({
      draft_info: {
        league_name: 'Fresh Draft',
        total_teams: draftSettings.total_teams,
        total_rounds: draftSettings.total_rounds,
        teams: teamsList,
      },
      picks: [],
      summary: {
        total_picks_detected: 0,
        avg_confidence: 1.0,
        processing_time_ms: 0,
      },
    });

    setImagePreviewUrl(undefined);
    setActiveTab('board');
  };

  // Edit Modal State
  const [editingPick, setEditingPick] = useState<DraftPick | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Check health endpoint on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasApiKey !== undefined) {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch((err) => console.log('Server health check response:', err));
  }, []);

  const handleSaveSettings = (newSettings: DraftSettings) => {
    setDraftSettings(newSettings);

    // Update current ocrResult draft_info to reflect team names, total_teams, total_rounds
    setOcrResult((prev) => {
      const teamsList = Array.from({ length: newSettings.total_teams }, (_, i) => {
        const col = i + 1;
        return {
          column: col,
          name: newSettings.team_names[col] || `Team ${col}`,
        };
      });

      return {
        ...prev,
        draft_info: {
          ...prev.draft_info,
          total_teams: newSettings.total_teams,
          total_rounds: newSettings.total_rounds,
          teams: teamsList,
        },
      };
    });
  };

  const handleProcessComplete = (result: OCRResult, previewUrl?: string) => {
    // Preserve custom team names if returned
    const updatedTeams = Array.from({ length: draftSettings.total_teams }, (_, i) => {
      const col = i + 1;
      return {
        column: col,
        name: draftSettings.team_names[col] || `Team ${col}`,
      };
    });

    setOcrResult({
      ...result,
      draft_info: {
        ...result.draft_info,
        total_teams: draftSettings.total_teams,
        total_rounds: draftSettings.total_rounds,
        teams: updatedTeams,
      },
    });

    if (previewUrl) setImagePreviewUrl(previewUrl);
    setActiveTab('board');
  };

  const handleUpdatePick = (updatedPick: DraftPick) => {
    setOcrResult((prev) => {
      const existingIndex = prev.picks.findIndex(
        (p) => p.round === updatedPick.round && p.team_column === updatedPick.team_column
      );

      let newPicks = [...prev.picks];
      if (existingIndex >= 0) {
        newPicks[existingIndex] = updatedPick;
      } else {
        newPicks.push(updatedPick);
      }

      // Recalculate summary
      const totalPicks = newPicks.length;
      const avgConf = totalPicks > 0
        ? newPicks.reduce((acc, p) => acc + p.confidence, 0) / totalPicks
        : 1.0;
      const lowConfCount = newPicks.filter((p) => p.confidence < 0.75).length;

      const posCounts: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DST: 0 };
      newPicks.forEach((p) => {
        if (posCounts[p.position] !== undefined) posCounts[p.position]++;
      });

      return {
        ...prev,
        picks: newPicks,
        summary: {
          total_detected: totalPicks,
          avg_confidence: Number(avgConf.toFixed(2)),
          low_confidence_count: lowConfCount,
          positions_breakdown: posCounts,
        },
      };
    });
  };

  const handleDeletePick = (round: number, col: number) => {
    setOcrResult((prev) => {
      const newPicks = prev.picks.filter((p) => !(p.round === round && p.team_column === col));
      return {
        ...prev,
        picks: newPicks,
      };
    });
  };

  const handleAddPickClick = (round: number, col: number) => {
    setManualDefaultRound(round);
    setManualDefaultCol(col);
    setIsManualModalOpen(true);
  };

  const handleOpenManualPick = () => {
    setManualDefaultRound(1);
    setManualDefaultCol(draftSettings.my_team_column || 1);
    setIsManualModalOpen(true);
  };

  const handleQuickDraftPlayer = (player: NFLPlayer, col: number, round: number) => {
    const totalTeams = draftSettings.total_teams || 12;
    let pickInRound = col;
    if (draftSettings.draft_type === 'snake' && round % 2 === 0) {
      pickInRound = totalTeams - col + 1;
    }
    const overall = (round - 1) * totalTeams + pickInRound;
    const teamName = draftSettings.team_names[col] || `Team ${col}`;

    const newPick: DraftPick = {
      round,
      pick_in_round: pickInRound,
      overall_pick: overall,
      team_column: col,
      team_name: teamName,
      player_name: player.name,
      position: player.position,
      nfl_team: player.nflTeam,
      raw_text: `${player.name} ${player.position} ${player.nflTeam}`,
      confidence: 1.0,
      status: 'confirmed',
      notes: 'Logged via Available Players advisor',
    };

    handleUpdatePick(newPick);
  };

  const handleEditPickClick = (pick: DraftPick) => {
    setEditingPick(pick);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
      {/* Header */}
      <Header
        hasApiKey={hasApiKey}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        detectedCount={ocrResult.picks.length}
        avgConfidence={ocrResult.summary?.avg_confidence}
        onNewScan={() => setActiveTab('samples')}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenManualPick={handleOpenManualPick}
        onStartNewDraft={() => setIsResetModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Active Tab Views */}
        {activeTab === 'samples' && (
          <ImageUploader
            onProcessComplete={handleProcessComplete}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            draftSettings={draftSettings}
          />
        )}

        {activeTab === 'board' && (
          <div className="space-y-6">
            <DraftLiveStatusBar
              settings={draftSettings}
              data={ocrResult}
              onOpenUploadModal={() => setActiveTab('samples')}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
              onResetBoard={() => setIsResetModalOpen(true)}
            />
            <SummaryStats data={ocrResult} />
            <DraftBoardGrid
              data={ocrResult}
              settings={draftSettings}
              onUpdatePick={handleUpdatePick}
              onAddPick={handleAddPickClick}
              onEditPickClick={handleEditPickClick}
              imagePreviewUrl={imagePreviewUrl}
            />
          </div>
        )}

        {activeTab === 'available' && (
          <div className="space-y-6">
            <DraftLiveStatusBar
              settings={draftSettings}
              data={ocrResult}
              onOpenUploadModal={() => setActiveTab('samples')}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
              onResetBoard={() => setIsResetModalOpen(true)}
            />
            <AvailablePlayersTab
              data={ocrResult}
              settings={draftSettings}
              onQuickDraftPlayer={handleQuickDraftPlayer}
              onOpenManualModalWithPos={(col, round) => {
                if (col) setManualDefaultCol(col);
                if (round) setManualDefaultRound(round);
                setIsManualModalOpen(true);
              }}
            />
          </div>
        )}

        {activeTab === 'rosters' && (
          <div className="space-y-6">
            <DraftLiveStatusBar
              settings={draftSettings}
              data={ocrResult}
              onOpenUploadModal={() => setActiveTab('samples')}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
              onResetBoard={() => setIsResetModalOpen(true)}
            />
            <TeamRostersTab
              data={ocrResult}
              settings={draftSettings}
              onEditPickClick={handleEditPickClick}
            />
          </div>
        )}

        {activeTab === 'json' && <RawJsonTab data={ocrResult} />}
      </main>

      {/* Reset Board Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={handleConfirmReset}
        currentPicksCount={ocrResult.picks.length}
      />

      {/* Manual Pick Modal */}
      <ManualPickModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        settings={draftSettings}
        data={ocrResult}
        onSavePick={handleUpdatePick}
        defaultRound={manualDefaultRound}
        defaultCol={manualDefaultCol}
      />

      {/* Draft Settings Modal */}
      <DraftSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={draftSettings}
        onSaveSettings={handleSaveSettings}
        onResetBoard={() => setIsResetModalOpen(true)}
      />

      {/* Edit Pick Modal */}
      <EditPickModal
        pick={editingPick}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdatePick}
        onDelete={handleDeletePick}
        totalTeams={ocrResult.draft_info.total_teams || 12}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            DraftBoard OCR Vision System — Spatial Grid Transcriber & Player Standardization Engine
          </div>
          <div className="text-slate-400 font-medium">
            Powered by Gemini 3.6 Flash
          </div>
        </div>
      </footer>
    </div>
  );
}
