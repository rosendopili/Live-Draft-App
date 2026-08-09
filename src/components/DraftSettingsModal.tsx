import React, { useState } from 'react';
import { Settings, Sliders, Users, Award, Shield, User, Check, X, ChevronRight, Hash, Sparkles, RotateCcw, ShieldAlert, Layers } from 'lucide-react';
import { DraftSettings, RosterSettings } from '../types';

interface DraftSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DraftSettings;
  onSaveSettings: (newSettings: DraftSettings) => void;
  onResetBoard?: () => void;
}

export const DraftSettingsModal: React.FC<DraftSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetBoard,
}) => {
  const [rounds, setRounds] = useState<number>(settings.total_rounds || 16);
  const [teams, setTeams] = useState<number>(settings.total_teams || 12);
  const [scoringFormat, setScoringFormat] = useState<DraftSettings['scoring_format']>(
    settings.scoring_format || 'PPR'
  );
  const [draftType, setDraftType] = useState<DraftSettings['draft_type']>(settings.draft_type || 'snake');
  const [myTeamColumn, setMyTeamColumn] = useState<number>(settings.my_team_column || 4);
  const [rosterSettings, setRosterSettings] = useState<RosterSettings>(() => ({
    qb: settings.roster_settings?.qb ?? 1,
    rb: settings.roster_settings?.rb ?? 2,
    wr: settings.roster_settings?.wr ?? 2,
    te: settings.roster_settings?.te ?? 1,
    flex: settings.roster_settings?.flex ?? 1,
    k: settings.roster_settings?.k ?? 1,
    dst: settings.roster_settings?.dst ?? 1,
    bench: settings.roster_settings?.bench ?? 6,
  }));

  const [teamNames, setTeamNames] = useState<Record<number, string>>(() => {
    const defaultMap: Record<number, string> = {
      1: 'Nikko',
      2: 'Jay',
      3: 'Nate',
      4: 'Peewee',
      5: 'Bo',
      6: 'Carlo',
      7: 'Jon',
      8: 'Jaime',
      9: 'Ro',
      10: 'Dave',
      11: 'John',
      12: 'Ariel',
    };
    return { ...defaultMap, ...settings.team_names };
  });

  if (!isOpen) return null;

  const handleRosterChange = (key: keyof RosterSettings, delta: number) => {
    setRosterSettings((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] ?? 0) + delta),
    }));
  };

  const applyRosterPreset = (type: 'standard' | 'custom3wr2flex' | 'superflex') => {
    if (type === 'standard') {
      setRosterSettings({ qb: 1, rb: 2, wr: 2, te: 1, flex: 1, k: 1, dst: 1, bench: 6 });
    } else if (type === 'custom3wr2flex') {
      setRosterSettings({ qb: 1, rb: 2, wr: 3, te: 1, flex: 2, k: 0, dst: 0, bench: 6 });
    } else if (type === 'superflex') {
      setRosterSettings({ qb: 2, rb: 2, wr: 2, te: 1, flex: 1, k: 1, dst: 1, bench: 6 });
      setScoringFormat('2QB / Superflex');
    }
  };

  const handleTeamNameChange = (col: number, name: string) => {
    setTeamNames((prev) => ({
      ...prev,
      [col]: name,
    }));
  };

  const handleSave = () => {
    // Ensure all team columns have a string name
    const updatedTeamNames: Record<number, string> = {};
    for (let i = 1; i <= teams; i++) {
      updatedTeamNames[i] = teamNames[i] || `Team ${i}`;
    }

    onSaveSettings({
      total_rounds: rounds,
      total_teams: teams,
      scoring_format: scoringFormat,
      draft_type: draftType,
      my_team_column: Math.min(myTeamColumn, teams),
      team_names: updatedTeamNames,
      roster_settings: rosterSettings,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Draft & League Settings
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Pre-Draft Configuration
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure league scoring, total rounds, draft format, and select your pick position.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: Core Draft Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Sliders className="w-4 h-4" />
              <span>1. General League Parameters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Number of Rounds */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Total Draft Rounds
                </label>
                <select
                  value={rounds}
                  onChange={(e) => setRounds(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {[8, 10, 12, 14, 15, 16, 18, 20].map((num) => (
                    <option key={num} value={num}>
                      {num} Rounds ({num * teams} total picks)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Sets row depth on the draft board grid.
                </p>
              </div>

              {/* Number of Teams */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Number of Teams
                </label>
                <select
                  value={teams}
                  onChange={(e) => {
                    const newTeams = Number(e.target.value);
                    setTeams(newTeams);
                    if (myTeamColumn > newTeams) setMyTeamColumn(newTeams);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {[8, 10, 12, 14, 16].map((num) => (
                    <option key={num} value={num}>
                      {num} Teams ({num} Board Columns)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Sets column width on physical board.
                </p>
              </div>

              {/* League Scoring Format */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Scoring Format
                </label>
                <select
                  value={scoringFormat}
                  onChange={(e) => setScoringFormat(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="PPR">Full PPR (1.0 Point Per Reception)</option>
                  <option value="Half-PPR">Half PPR (0.5 Point Per Reception)</option>
                  <option value="Standard">Standard Non-PPR (0.0 Reception Points)</option>
                  <option value="TE Premium">TE Premium (1.5 PPR for Tight Ends)</option>
                  <option value="2QB / Superflex">2QB / Superflex (Heavy QB Priority)</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Influences draft target recommendations & positional priorities.
                </p>
              </div>

              {/* Draft Format */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Draft Format Order
                </label>
                <select
                  value={draftType}
                  onChange={(e) => setDraftType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="snake">Snake Draft (Round 1: 1➔12, Round 2: 12➔1)</option>
                  <option value="linear">Linear Draft (Every Round: 1➔12)</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Determines overall pick number sequencing across rounds.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Select My Team / Draft Position */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <User className="w-4 h-4" />
              <span>2. Select Your Pick / Draft Position</span>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-emerald-300">
                    My Team Column & Draft Slot
                  </label>
                  <p className="text-xs text-slate-300">
                    Which column on the draft board represents your team?
                  </p>
                </div>

                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-extrabold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Column {myTeamColumn}: {teamNames[myTeamColumn] || `Team ${myTeamColumn}`}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                {Array.from({ length: teams }, (_, i) => {
                  const colNum = i + 1;
                  const isSelected = colNum === myTeamColumn;
                  const name = teamNames[colNum] || `Team ${colNum}`;

                  return (
                    <button
                      key={colNum}
                      type="button"
                      onClick={() => setMyTeamColumn(colNum)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30 font-bold scale-[1.02]'
                          : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      <div className="text-[10px] opacity-80 font-bold uppercase">
                        Pick #{colNum}
                      </div>
                      <div className="text-xs truncate font-extrabold mt-0.5">
                        {name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: League Roster Construction */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Layers className="w-4 h-4" />
                <span>3. League Roster Requirements</span>
              </div>
              <div className="text-[11px] font-extrabold text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
                Starters: {rosterSettings.qb + rosterSettings.rb + rosterSettings.wr + rosterSettings.te + rosterSettings.flex + rosterSettings.k + rosterSettings.dst} | Bench: {rosterSettings.bench} | Total: {rosterSettings.qb + rosterSettings.rb + rosterSettings.wr + rosterSettings.te + rosterSettings.flex + rosterSettings.k + rosterSettings.dst + rosterSettings.bench}
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Customize starting roster positions and bench spots. Set Defense and Kicker to 0 if your league does not use them.
            </p>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 mr-1">Presets:</span>
              <button
                type="button"
                onClick={() => applyRosterPreset('standard')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition"
              >
                Standard (1 QB, 2 RB, 2 WR, 1 TE, 1 Flex, K, DST)
              </button>
              <button
                type="button"
                onClick={() => applyRosterPreset('custom3wr2flex')}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 text-[11px] font-bold transition flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>3 WR + 2 Flex (No K/DST)</span>
              </button>
              <button
                type="button"
                onClick={() => applyRosterPreset('superflex')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition"
              >
                Superflex (2 QB, 2 RB, 2 WR, 1 TE, 1 Flex)
              </button>
            </div>

            {/* Position Controls Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'QB (Quarterback)', key: 'qb' as const, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
                { label: 'RB (Running Back)', key: 'rb' as const, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
                { label: 'WR (Wide Receiver)', key: 'wr' as const, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
                { label: 'TE (Tight End)', key: 'te' as const, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
                { label: 'FLEX (W/R/T)', key: 'flex' as const, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
                { label: 'K (Kicker)', key: 'k' as const, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
                { label: 'DST (Defense)', key: 'dst' as const, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
                { label: 'Bench Spots', key: 'bench' as const, color: 'text-slate-300 bg-slate-800 border-slate-700' },
              ].map(({ label, key, color }) => (
                <div key={key} className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 flex flex-col justify-between space-y-2">
                  <div className="text-[11px] font-bold text-slate-300 truncate">{label}</div>
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-700/90 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => handleRosterChange(key, -1)}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 rounded-md flex items-center justify-center font-bold text-sm transition"
                    >
                      -
                    </button>
                    <span className={`text-sm font-extrabold px-2 ${color.split(' ')[0]}`}>
                      {rosterSettings[key]}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRosterChange(key, 1)}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 rounded-md flex items-center justify-center font-bold text-sm transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Team Owner Names Customization */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Users className="w-4 h-4" />
              <span>4. Board Column Team Names (1 to {teams})</span>
            </div>

            <p className="text-xs text-slate-400">
              Customize the owner/team names displayed at the top of each draft board column.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: teams }, (_, i) => {
                const colNum = i + 1;
                const isMyTeam = colNum === myTeamColumn;

                return (
                  <div
                    key={colNum}
                    className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
                      isMyTeam
                        ? 'bg-emerald-950/40 border-emerald-500/50'
                        : 'bg-slate-800/70 border-slate-700/80'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 ${
                        isMyTeam
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-900 text-slate-300 border border-slate-700'
                      }`}
                    >
                      C{colNum}
                    </span>
                    <input
                      type="text"
                      value={teamNames[colNum] || ''}
                      placeholder={`Team ${colNum}`}
                      onChange={(e) => handleTeamNameChange(colNum, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div>
            {onResetBoard && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onResetBoard();
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-red-950/50 hover:bg-red-900/80 text-red-300 border border-red-800/80 transition flex items-center space-x-1.5 shadow-sm active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span>Reset Board & Clear Picks</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Draft Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
