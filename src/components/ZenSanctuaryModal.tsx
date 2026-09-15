import React, { useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  X,
  BookOpen, 
  Minimize2
} from 'lucide-react';
import { TimerMode } from '../types';
import { CircularTimer } from './CircularTimer';

interface ZenSanctuaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  mode: TimerMode;
  activeTaskName: string;
  onToggleTimer: () => void;
  onReset: () => void;
  onExtend: (minutes: number) => void;
  onSetCustomDuration: (minutes: number) => void;
  strictAntiCheatMode?: boolean;
}

export const ZenSanctuaryModal: React.FC<ZenSanctuaryModalProps> = ({
  isOpen,
  onClose,
  remainingSeconds,
  totalSeconds,
  isRunning,
  mode,
  activeTaskName,
  onToggleTimer,
  onReset,
  onExtend,
  onSetCustomDuration,
}) => {
  // ESC key to exit
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-300 overflow-hidden"
      id="zen-sanctuary-view"
    >
      {/* Subtle Atmospheric Radial Glow */}
      <div 
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 ${
          isRunning 
            ? 'bg-gradient-to-tr from-cyan-600/15 via-blue-700/10 to-transparent scale-110 animate-pulse' 
            : 'bg-gradient-to-tr from-sky-900/10 via-slate-900/10 to-transparent scale-95'
        }`} 
      />

      {/* Subtle Brand & Logo (Top Left) */}
      <div className="fixed top-5 left-5 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#081836]/60 border border-amber-500/25 backdrop-blur-md shadow-sm">
        <div className="w-5 h-5 rounded-md overflow-hidden bg-black flex items-center justify-center">
          <img
            src="/sandclock.svg"
            alt="OC Sand Clock Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
          />
        </div>
        <span className="text-xs font-bold tracking-wider text-amber-200/90 font-['Plus_Jakarta_Sans']">OC</span>
      </div>

      {/* Subtle Exit / Minimize Button (Top Right) */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-5 right-5 z-20 p-2.5 rounded-full bg-[#081836]/60 hover:bg-[#0c2452] border border-cyan-500/20 text-slate-400 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs group shadow-lg"
        title="Exit Zen Mode (Esc)"
      >
        <X className="w-4 h-4 text-slate-400 group-hover:text-cyan-300" />
        <span className="hidden sm:inline font-mono text-[11px] text-slate-400 group-hover:text-cyan-200">Esc</span>
      </button>

      {/* EXACT Center Piece from image.png: Only the Task pill, the clock, and the 3 action buttons */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-xl my-auto">
        
        {/* 1. Top Pill: [ 📖 Enter Task ] */}
        <div className="mb-6 flex items-center gap-2 px-5 py-2 rounded-full bg-[#081836]/90 border border-cyan-500/30 backdrop-blur-md text-xs sm:text-sm text-cyan-200 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          {activeTaskName ? (
            <>
              <span className="text-slate-400 font-normal">Enter Task:</span>
              <span className="font-extrabold text-white tracking-wide">{activeTaskName}</span>
            </>
          ) : (
            <span className="font-bold text-cyan-200 tracking-wide">Enter Task</span>
          )}
        </div>

        {/* 2. Centerpiece Clock Dial from image.png */}
        <div className="relative">
          <CircularTimer
            remainingSeconds={remainingSeconds}
            totalSeconds={totalSeconds}
            isRunning={isRunning}
            mode={mode}
            onToggle={onToggleTimer}
            onSetCustomDuration={onSetCustomDuration}
            size={380}
            isExpanded={true}
          />
        </div>

        {/* 3. Bottom Action Buttons: [ ▶ Begin Flow ] [ ⟲ Reset ] [ + +5m Flow ] */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {/* Main Glowing Button: Begin Flow / Pause */}
          <button
            type="button"
            onClick={onToggleTimer}
            className="py-3.5 px-8 rounded-full bg-gradient-to-r from-[#006aff] to-[#00c8ff] hover:from-[#0057d9] hover:to-[#00b0e6] active:scale-95 text-white font-extrabold text-base tracking-wide flex items-center gap-2.5 shadow-[0_10px_35px_rgba(0,180,255,0.4)] transition cursor-pointer"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause Study</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Begin Flow</span>
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="py-3.5 px-6 rounded-full bg-[#091733]/90 hover:bg-[#0f2552] border border-[#1b3a69] hover:border-cyan-500/40 text-sky-200 hover:text-white font-bold text-sm flex items-center gap-2 transition cursor-pointer shadow-md"
            title="Reset to planned duration"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <span>Reset</span>
          </button>

          {/* +5m Flow Button */}
          <button
            type="button"
            onClick={() => onExtend(5)}
            className="py-3.5 px-6 rounded-full bg-[#091733]/90 hover:bg-[#0f2552] border border-[#1b3a69] hover:border-cyan-500/40 text-sky-200 hover:text-white font-bold text-sm flex items-center gap-2 transition cursor-pointer shadow-md"
            title="Add 5 more minutes"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>+5m Flow</span>
          </button>
        </div>

      </div>
    </div>
  );
};
