import React from 'react';
import { Position } from '../types';

interface PositionBadgeProps {
  position: Position | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const POSITION_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  QB: { bg: 'bg-red-500/10 dark:bg-red-950/40', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/30', label: 'Quarterback' },
  RB: { bg: 'bg-blue-500/10 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/30', label: 'Running Back' },
  WR: { bg: 'bg-emerald-500/10 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30', label: 'Wide Receiver' },
  TE: { bg: 'bg-amber-500/10 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30', label: 'Tight End' },
  K: { bg: 'bg-purple-500/10 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30', label: 'Kicker' },
  DST: { bg: 'bg-slate-500/10 dark:bg-slate-900/40', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/30', label: 'Defense/ST' }
};

export const PositionBadge: React.FC<PositionBadgeProps> = ({ position, size = 'md', className = '' }) => {
  const normPos = (position || 'WR').toUpperCase();
  const style = POSITION_COLORS[normPos] || POSITION_COLORS.WR;

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] font-bold rounded',
    md: 'px-2 py-0.5 text-xs font-bold rounded-md',
    lg: 'px-2.5 py-1 text-sm font-bold rounded-md'
  };

  return (
    <span
      className={`inline-flex items-center justify-center tracking-wide border uppercase ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]} ${className}`}
      title={style.label}
    >
      {normPos}
    </span>
  );
};
