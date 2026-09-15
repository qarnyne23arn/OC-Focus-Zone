import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, Zap, Target } from 'lucide-react';

interface AntiCheatModalProps {
  isOpen: boolean;
  onClose: () => void;
  strayDurationSeconds: number;
  totalViolationsCount: number;
  currentTaskName: string;
}

export const AntiCheatModal: React.FC<AntiCheatModalProps> = ({
  isOpen,
  onClose,
  strayDurationSeconds,
  totalViolationsCount,
  currentTaskName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0c0f1d] border-2 border-rose-500/40 rounded-3xl p-6 shadow-[0_25px_60px_rgba(225,29,72,0.3)] text-slate-200 space-y-4">
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 mx-auto rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-inner">
          <ShieldAlert className="w-8 h-8 animate-bounce" />
        </div>

        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3" /> Anti-Cheat Focus Lock
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Study Tab Stray Detected!
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You navigated away from your OC study sanctuary during an active focus block.
          </p>
        </div>

        {/* Stray Metrics */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#070a14] border border-rose-500/20">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Time Away</div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              {strayDurationSeconds}s
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Strays</div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              #{totalViolationsCount}
            </div>
          </div>
        </div>

        {/* Task reminder */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs flex items-center gap-2.5">
          <Target className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="truncate">
            <span className="text-slate-400">Enter Task: </span>
            <span className="font-bold text-white">{currentTaskName || 'No task active'}</span>
          </div>
        </div>

        {/* Return Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer transition"
        >
          <span>Return to Focus Block</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
