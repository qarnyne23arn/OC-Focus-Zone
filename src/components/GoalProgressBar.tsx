import React from 'react';
import { Target, Trophy } from 'lucide-react';

interface GoalProgressBarProps {
  currentMinutes: number;
  goalMinutes: number;
  remainingSeconds: number;
  totalSeconds: number;
  isFocusMode: boolean;
}

export const GoalProgressBar: React.FC<GoalProgressBarProps> = ({
  currentMinutes,
  goalMinutes,
  remainingSeconds,
  totalSeconds,
  isFocusMode,
}) => {
  const goalPercentage = Math.min(100, Math.round((currentMinutes / Math.max(1, goalMinutes)) * 100));
  const sessionElapsed = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className="w-full mt-4 p-3 rounded-2xl bg-[#071328]/90 border border-sky-500/15 text-slate-200">
      {/* Daily Goal Header */}
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="flex items-center gap-1.5 font-medium text-sky-200">
          <Target className="w-3.5 h-3.5 text-cyan-400" />
          Daily Study Goal
        </span>
        <span className="font-semibold text-cyan-300">
          {currentMinutes} / {goalMinutes} min <span className="text-sky-300/60 font-normal">({goalPercentage}%)</span>
        </span>
      </div>

      {/* Goal Progress Bar with Milestones */}
      <div className="relative w-full h-2 rounded-full bg-[#0d2244] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${goalPercentage}%` }}
        />
        {/* Milestone markers at 25%, 50%, 75% */}
        <div className="absolute top-0 bottom-0 left-1/4 w-[1px] bg-slate-900/60 pointer-events-none" />
        <div className="absolute top-0 bottom-0 left-2/4 w-[1px] bg-slate-900/60 pointer-events-none" />
        <div className="absolute top-0 bottom-0 left-3/4 w-[1px] bg-slate-900/60 pointer-events-none" />
      </div>

      {/* Milestone Label Badges */}
      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
        <span>0m</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span className="flex items-center gap-0.5 text-cyan-400 font-medium">
          <Trophy className="w-2.5 h-2.5" /> 100%
        </span>
      </div>

      {/* Active Session Mini Progress if running */}
      {isFocusMode && totalSeconds > 0 && (
        <div className="mt-2 pt-2 border-t border-sky-500/10 flex items-center justify-between text-[11px] text-sky-300/70">
          <span>Active Session Elapsed</span>
          <span className="font-mono text-cyan-300 font-medium">{Math.round(sessionElapsed)}%</span>
        </div>
      )}
    </div>
  );
};
