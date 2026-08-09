import React from 'react';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
  currentPicksCount: number;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen, onClose, onConfirmReset, currentPicksCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Reset Draft Board?</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start space-x-3 p-3 rounded-lg bg-red-950/20 border border-red-500/20 text-red-200 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p>Warning: This will permanently clear all <strong>{currentPicksCount}</strong> recorded picks. This action cannot be undone.</p>
          </div>
          <p className="text-slate-400 text-sm">Are you sure you want to start a fresh draft?</p>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition">Cancel</button>
          <button onClick={onConfirmReset} className="px-6 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg transition active:scale-95">Yes, Reset Board</button>
        </div>
      </div>
    </div>
  );
};
