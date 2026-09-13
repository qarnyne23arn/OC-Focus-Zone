import React from 'react';
import { PlusCircle, RotateCcw, Clock, History, Check } from 'lucide-react';
import { SessionSnapshot } from '../types';

interface ExtendRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtend: (extraMinutes: number) => void;
  onRestore: () => void;
  hasSavedSnapshot: boolean;
  lastSnapshot: SessionSnapshot | null;
  remainingSeconds: number;
}

export const ExtendRestoreModal: React.FC<ExtendRestoreModalProps> = ({
  isOpen,
  onClose,
  onExtend,
  onRestore,
  hasSavedSnapshot,
  lastSnapshot,
  remainingSeconds,
}) => {
  if (!isOpen) return null;

  const currentMins = Math.floor(remainingSeconds / 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#08152c] border border-sky-500/25 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-sky-500/15">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <History className="w-5 h-5 text-cyan-400" />
            Workflow Modes: Extend & Restore
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* 1. Extend Mode (Flow state booster) */}
        <div className="mt-4 p-4 rounded-2xl bg-[#061022] border border-sky-500/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-white flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              Extend Mode (Flow State)
            </span>
            <span className="text-xs text-cyan-300 font-mono">Current: {currentMins}m left</span>
          </div>
          <p className="text-xs text-sky-200/60 mb-3">
            In the zone? Extend your active study session seamlessly without interrupting stats or breaking concentration.
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => { onExtend(5); onClose(); }}
              className="py-2.5 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 hover:text-white font-medium text-xs transition cursor-pointer text-center"
            >
              +5 Minutes
            </button>
            <button
              type="button"
              onClick={() => { onExtend(10); onClose(); }}
              className="py-2.5 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-cyan-300 hover:text-white font-medium text-xs transition cursor-pointer text-center"
            >
              +10 Minutes
            </button>
            <button
              type="button"
              onClick={() => { onExtend(15); onClose(); }}
              className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-200 hover:text-white font-medium text-xs transition cursor-pointer text-center"
            >
              +15 Minutes
            </button>
          </div>
        </div>

        {/* 2. Restore Mode (Undo accidental reset / recover session) */}
        <div className="mt-4 p-4 rounded-2xl bg-[#061022] border border-sky-500/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-white flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              Restore Mode (Session Recovery)
            </span>
            {hasSavedSnapshot && (
              <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Snapshot Ready
              </span>
            )}
          </div>
          <p className="text-xs text-sky-200/60 mb-3">
            Accidentally hit reset or interrupted your timer? Restore your exact remaining minutes and elapsed focus time.
          </p>

          {lastSnapshot ? (
            <div className="p-2.5 rounded-xl bg-[#091730] border border-sky-500/10 mb-3 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>
                  Saved {Math.floor(lastSnapshot.remainingSeconds / 60)}m {lastSnapshot.remainingSeconds % 60}s
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {new Date(lastSnapshot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic mb-3">
              No recent interrupted session snapshot found. Snapshots are auto-created when sessions pause or pause unexpectedly.
            </div>
          )}

          <button
            type="button"
            disabled={!hasSavedSnapshot}
            onClick={() => { onRestore(); onClose(); }}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              hasSavedSnapshot
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore Interrupted Session
          </button>
        </div>

        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-sky-300/80 hover:text-white px-4 py-2 rounded-xl hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
