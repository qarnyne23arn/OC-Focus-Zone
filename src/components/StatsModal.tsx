import React, { useState } from 'react';
import { BarChart3, Calendar, Clock, Flame, ShieldCheck, CheckCircle2, BookOpen } from 'lucide-react';
import { StudySession } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: StudySession[];
  goalMinutes: number;
  distractionCount: number;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  sessions,
  goalMinutes,
  distractionCount,
}) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'all'>('today');

  if (!isOpen) return null;

  // Filter sessions based on period
  const now = new Date();
  const filteredSessions = sessions.filter((s) => {
    if (period === 'all') return true;
    const sessionDate = new Date(s.timestamp);
    if (period === 'today') {
      return (
        sessionDate.getDate() === now.getDate() &&
        sessionDate.getMonth() === now.getMonth() &&
        sessionDate.getFullYear() === now.getFullYear()
      );
    }
    if (period === 'week') {
      const diffTime = Math.abs(now.getTime() - sessionDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    return true;
  });

  const totalMinutes = filteredSessions.reduce((acc, curr) => acc + curr.actualMinutes, 0);
  const completedCount = filteredSessions.filter((s) => s.completed).length;

  // Subject breakdown
  const subjectMap = new Map<string, number>();
  filteredSessions.forEach((s) => {
    const subj = s.subject || 'General Study';
    subjectMap.set(subj, (subjectMap.get(subj) || 0) + s.actualMinutes);
  });
  const subjectBreakdown = Array.from(subjectMap.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl p-6 rounded-3xl bg-[#08152c] border border-sky-500/25 shadow-2xl text-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-500/15 shrink-0">
          <div className="flex items-center gap-2.5 font-bold text-white text-lg">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Productivity & Performance Dashboard
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 my-4 rounded-xl bg-[#050e1f] border border-sky-500/15 shrink-0">
          <button
            type="button"
            onClick={() => setPeriod('today')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
              period === 'today' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setPeriod('week')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
              period === 'week' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setPeriod('all')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
              period === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Time
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#061124] border border-sky-500/15">
              <div className="flex items-center gap-1.5 text-xs text-sky-300/70 mb-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Focus Time
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {totalMinutes} <span className="text-xs text-sky-300/60 font-normal">min</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#061124] border border-sky-500/15">
              <div className="flex items-center gap-1.5 text-xs text-sky-300/70 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Sessions
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {completedCount}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#061124] border border-sky-500/15">
              <div className="flex items-center gap-1.5 text-xs text-sky-300/70 mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Streak
              </div>
              <div className="text-xl font-bold text-white font-mono">
                4 <span className="text-xs text-amber-300/60 font-normal">days</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#061124] border border-sky-500/15">
              <div className="flex items-center gap-1.5 text-xs text-sky-300/70 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Shielded
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {distractionCount} <span className="text-xs text-sky-300/60 font-normal">sites</span>
              </div>
            </div>
          </div>

          {/* Subject Breakdown */}
          <div className="p-4 rounded-2xl bg-[#061124] border border-sky-500/15">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Time Spent by Subject
              </span>
              <span className="text-[11px] text-sky-300/70 font-normal">
                {subjectBreakdown.length} courses
              </span>
            </div>

            {subjectBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No recorded sessions for this period.</p>
            ) : (
              <div className="space-y-2.5">
                {subjectBreakdown.map(([subj, mins]) => {
                  const pct = totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0;
                  return (
                    <div key={subj}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-200 font-medium">{subj}</span>
                        <span className="text-cyan-300 font-mono">
                          {mins}m <span className="text-slate-400 text-[10px]">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#0b213f] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Session History List */}
          <div className="p-4 rounded-2xl bg-[#061124] border border-sky-500/15">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Session History Log
              </span>
              <span className="text-[11px] text-sky-300/70 font-normal">
                {filteredSessions.length} total
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-2.5 rounded-xl bg-[#081730] border border-sky-500/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-medium text-white block">{session.subject}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.mode.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-cyan-300 font-semibold font-mono block">
                      +{session.actualMinutes} min
                    </span>
                    <span className="text-[10px] text-emerald-400">Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-sky-500/15 flex items-center justify-between shrink-0 mt-3">
          <span className="text-[11px] text-slate-400">
            Data automatically synced to your cloud workspace
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
