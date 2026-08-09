import React, { useState, useEffect } from 'react';
import { DraftPick, Position } from '../types';
import { X, Check, Trash2, AlertCircle, Sparkles } from 'lucide-react';
import { PositionBadge } from './PositionBadge';

interface EditPickModalProps {
  pick: DraftPick | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pick: DraftPick) => void;
  onDelete?: (round: number, col: number) => void;
  totalTeams: number;
}

const COMMON_POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];

export const EditPickModal: React.FC<EditPickModalProps> = ({
  pick,
  isOpen,
  onClose,
  onSave,
  onDelete,
  totalTeams
}) => {
  if (!isOpen || !pick) return null;

  const [playerName, setPlayerName] = useState(pick.player_name || '');
  const [position, setPosition] = useState<Position>(pick.position || 'WR');
  const [nflTeam, setNflTeam] = useState(pick.nfl_team || 'NFL');
  const [rawText, setRawText] = useState(pick.raw_text || '');
  const [confidence, setConfidence] = useState<number>(pick.confidence ?? 1.0);
  const [notes, setNotes] = useState(pick.notes || '');

  useEffect(() => {
    if (pick) {
      setPlayerName(pick.player_name || '');
      setPosition(pick.position || 'WR');
      setNflTeam(pick.nfl_team || 'NFL');
      setRawText(pick.raw_text || '');
      setConfidence(pick.confidence ?? 1.0);
      setNotes(pick.notes || '');
    }
  }, [pick]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const updatedPick: DraftPick = {
      ...pick,
      player_name: playerName.trim(),
      position,
      nfl_team: nflTeam.trim().toUpperCase(),
      raw_text: rawText.trim() || `${playerName} ${position} ${nflTeam}`,
      confidence: Math.min(1.0, Math.max(0.0, Number(confidence))),
      status: 'confirmed',
      notes: notes.trim(),
    };

    onSave(updatedPick);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Edit Sticker Pick</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Round {pick.round}, Pick {pick.pick_in_round} (#{pick.overall_pick})
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Column {pick.team_column} ({pick.team_name})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Normalized Player Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g. Justin Jefferson"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Standard Position
              </label>
              <div className="flex flex-wrap gap-1">
                {COMMON_POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                      position === pos
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                NFL Team Abbreviation
              </label>
              <input
                type="text"
                value={nflTeam}
                onChange={(e) => setNflTeam(e.target.value.toUpperCase())}
                placeholder="MIN, KC, SF, PHI"
                maxLength={4}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Raw Text on Sticker
            </label>
            <input
              type="text"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Text as printed or written on sticker"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confidence Rating (0.0 - 1.0)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value) || 1.0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notes / Correction Log
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for edit or correction"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(pick.round, pick.team_column);
                  onClose();
                }}
                className="text-xs font-semibold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-950/30 flex items-center space-x-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Pick</span>
              </button>
            )}

            <div className="flex items-center space-x-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg shadow-md flex items-center space-x-1.5 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Confirm Pick</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
