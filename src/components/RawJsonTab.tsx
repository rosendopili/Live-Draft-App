import React, { useState } from 'react';
import { OCRResult } from '../types';
import { Copy, Check, Download, FileCode, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface RawJsonTabProps {
  data: OCRResult;
}

export const RawJsonTab: React.FC<RawJsonTabProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  // Clean JSON string matching exact schema required
  const cleanJsonPayload = {
    draft_info: data.draft_info,
    picks: data.picks.map((p) => ({
      round: p.round,
      pick_in_round: p.pick_in_round,
      overall_pick: p.overall_pick,
      team_column: p.team_column,
      team_name: p.team_name,
      player_name: p.player_name,
      position: p.position,
      nfl_team: p.nfl_team,
      raw_text: p.raw_text,
      confidence: p.confidence,
      ...(p.notes ? { notes: p.notes } : {})
    }))
  };

  const jsonString = JSON.stringify(cleanJsonPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `draft_board_ocr_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Check compliance against rules
  const positionsAllowed = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];
  const allPosValid = data.picks.every((p) => positionsAllowed.includes(p.position));
  const allTeamsValid = data.picks.every((p) => p.nfl_team && p.nfl_team.length >= 2);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileCode className="w-4 h-4" />
            <span>Structured JSON Output</span>
          </div>
          <h2 className="text-xl font-bold text-white">Transcribed Draft Board JSON</h2>
          <p className="text-xs text-slate-400 mt-1">
            Strictly validated JSON conforming to spatial grid & player normalization rules.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopy}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow hover:border-emerald-500/50 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>Copy Raw JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download .json</span>
          </button>
        </div>
      </div>

      {/* Compliance Validation Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-200">Position Normalization</div>
            <div className="text-[11px] text-slate-400">
              {allPosValid ? '100% strictly QB, RB, WR, TE, K, DST' : 'Non-standard positions present'}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-200">NFL Team Standards</div>
            <div className="text-[11px] text-slate-400">
              {allTeamsValid ? 'Normalized 2-3 letter abbreviations' : 'Check team abbreviations'}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-200">Spatial Grid Integrity</div>
            <div className="text-[11px] text-slate-400">
              {data.draft_info.detected_picks} picks across {data.draft_info.total_teams} teams
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-emerald-400 text-[11px]">draft_board_ocr_result.json</span>
          <span>{data.picks.length} picks encoded</span>
        </div>

        <pre className="p-6 text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto max-h-[600px] selection:bg-emerald-900 selection:text-white">
          {jsonString}
        </pre>
      </div>
    </div>
  );
};
