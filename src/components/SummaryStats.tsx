import React from 'react';
import { OCRResult, Position } from '../types';
import { Layers, AlertTriangle, CheckCircle2, Cpu, BarChart3 } from 'lucide-react';
import { POSITION_COLORS } from './PositionBadge';

interface SummaryStatsProps {
  data: OCRResult;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ data }) => {
  const posCountsFromPicks = React.useMemo(() => {
    const counts: Record<Position, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DST: 0 };
    data.picks.forEach((p) => {
      if (counts[p.position] !== undefined) counts[p.position]++;
    });
    return counts;
  }, [data.picks]);

  const summary = {
    total_detected: data.summary?.total_detected ?? data.picks.length,
    avg_confidence: data.summary?.avg_confidence ?? (data.picks.length > 0
      ? Number((data.picks.reduce((a, b) => a + b.confidence, 0) / data.picks.length).toFixed(2))
      : 1.0),
    low_confidence_count: data.summary?.low_confidence_count ?? data.picks.filter((p) => p.confidence < 0.75).length,
    positions_breakdown: data.summary?.positions_breakdown || posCountsFromPicks,
  };

  const positions: Position[] = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Picks */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Detected Picks</div>
          <div className="text-xl font-extrabold text-white">{data.picks.length}</div>
        </div>
      </div>

      {/* Avg Confidence */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Confidence</div>
          <div className="text-xl font-extrabold text-white">
            {(summary.avg_confidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Low Confidence Review */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center space-x-3">
        <div className={`p-2.5 rounded-xl border ${
          summary.low_confidence_count > 0
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Flagged Stickers</div>
          <div className="text-xl font-extrabold text-white">{summary.low_confidence_count}</div>
        </div>
      </div>

      {/* Grid Specs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Board Grid</div>
          <div className="text-sm font-extrabold text-white">
            {data.draft_info.total_teams} Teams × {data.draft_info.total_rounds} Rnds
          </div>
        </div>
      </div>

      {/* Positional Distribution Bar */}
      <div className="col-span-2 lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1.5 flex flex-col justify-center">
        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
          Positional Split
        </div>
        <div className="flex items-center space-x-1">
          {positions.map((pos) => {
            const count = summary.positions_breakdown?.[pos] || 0;
            const style = POSITION_COLORS[pos];
            return (
              <div
                key={pos}
                className={`flex-1 text-center py-1 rounded text-[10px] font-extrabold ${style.bg} ${style.text} border ${style.border}`}
                title={`${pos}: ${count} picks`}
              >
                {pos}:{count}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
