import React, { useState } from 'react';
import { Play, Pause, Maximize2, Sparkles, Plus, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { TimerMode } from '../types';

interface MiniFloatingTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  mode: TimerMode;
  activeTaskName: string;
  onToggleTimer: () => void;
  onExtend: (minutes: number) => void;
  onOpenZen: () => void;
}

export const MiniFloatingTimer: React.FC<MiniFloatingTimerProps> = ({
  remainingSeconds,
  totalSeconds,
  isRunning,
  mode,
  activeTaskName,
  onToggleTimer,
  onExtend,
  onOpenZen,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <aside 
      aria-label="Floating Focus Dock"
      className="fixed bottom-5 right-5 z-40 select-none animate-in slide-in-from-bottom-5 duration-300"
    >
      {isMinimized ? (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#061022]/95 border border-cyan-500/40 text-white shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:border-cyan-400 transition cursor-pointer group"
          title="Expand Mini Floating Timer"
        >
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
          <span className="font-mono font-extrabold text-xs tracking-wider text-cyan-300">
            {timeFormatted}
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
        </button>
      ) : (
        <div className="w-72 sm:w-80 rounded-2xl bg-[#061022]/95 border border-cyan-500/30 p-3 shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative overflow-hidden space-y-2.5">
          {/* Subtle top progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Top row: Mode tag & task name + minimize button */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1.5 truncate">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                mode === 'focus' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {mode === 'focus' ? 'Focus' : 'Break'}
              </span>
              <span className="text-[11px] text-slate-300 font-medium truncate max-w-[130px]">
                {activeTaskName}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenZen}
                className="p-1 rounded-lg hover:bg-slate-800 text-cyan-300 hover:text-white cursor-pointer transition"
                title="Zen Sanctuary (F)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition"
                title="Minimize Dock"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Center row: Large digital timer + controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <Clock className={`w-4 h-4 ${isRunning ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
              </div>
              <span className="font-mono text-2xl font-black text-white tracking-wider">
                {timeFormatted}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onExtend(5)}
                className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 text-[11px] font-bold cursor-pointer transition flex items-center gap-0.5"
                title="Add 5 minutes"
              >
                <Plus className="w-3 h-3" />
                <span>5m</span>
              </button>

              <button
                type="button"
                onClick={onToggleTimer}
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 active:scale-95 text-slate-950 font-black text-xs cursor-pointer shadow-md flex items-center gap-1 transition"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3 h-3 fill-slate-950" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-slate-950" />
                    <span>Start</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
