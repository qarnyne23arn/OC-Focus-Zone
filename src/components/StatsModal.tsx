import React, { useState } from 'react';
import { BarChart3, Calendar, Clock, Flame, ShieldCheck, CheckCircle2, BookOpen } from 'lucide-react';
import { StudySession } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: StudySession[];
  goalMinutes: number;
  distractionCount: number;
  isLight?: boolean;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  sessions,
  goalMinutes,
  distractionCount,
  isLight = false,
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
      <div className={`relative w-full max-w-xl p-6 rounded-3xl border shadow-2xl max-h-[90vh] flex flex-col ${
        isLight
          ? 'bg-[#edf5f7] border-slate-300 text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)]'
          : 'bg-[#08152c] border-sky-500/25 text-slate-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b shrink-0 ${
          isLight ? 'border-slate-300' : 'border-sky-500/15'
        }`}>
          <div className={`flex items-center gap-2.5 font-bold text-lg ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <BarChart3 className={`w-5 h-5 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
            Productivity & Performance Dashboard
          </div>
          <button
            onClick={onClose}
            className={`text-xs px-2 py-1 rounded-lg transition cursor-pointer ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-[#dce9ed]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Period Selector Tabs */}
        <div className={`flex items-center gap-1.5 p-1 my-4 rounded-xl border shrink-0 ${
          isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-[#050e1f] border-sky-500/15'
        }`}>
          <button
            type="button"
            onClick={() => setPeriod('today')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
              period === 'today'
                ? isLight
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : isLight
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setPeriod('week')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
              period === 'week'
                ? isLight
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : isLight
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setPeriod('all')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
              period === 'all'
                ? isLight
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : isLight
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Time
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className={`p-3 rounded-2xl border ${
              isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-[#061124] border-sky-500/15'
            }`}>
              <div className={`flex items-center gap-1.5 text-xs mb-1 ${
                isLight ? 'text-slate-700 font-medium' : 'text-sky-300/70'
              }`}>
                <Clock className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                Focus Time
              </div>
              <div className={`text-xl font-bold font-mono ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {totalMinutes} <span className={`text-xs font-normal ${isLight ? 'text-slate-600' : 'text-sky-300/60'}`}>min</span>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border ${
              isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-[#061124] border-sky-500/15'
            }`}>
              <div className={`flex items-center gap-1.5 text-xs mb-1 ${
                isLight ? 'text-slate-700 font-medium' : 'text-sky-300/70'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Sessions
              </div>
              <div className={`text-xl font-bold font-mono ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {completedCount}
              </div>
            </div>

            <div className={`p-3 rounded-2xl border ${
              isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-[#061124] border-sky-500/15'
            }`}>
              <div className={`flex items-center gap-1.5 text-xs mb-1 ${
                isLight ? 'text-slate-700 font-medium' : 'text-sky-300/70'
              }`}>
                <Flame className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                Streak
              </div>
              <div className={`text-xl font-bold font-mono ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                4 <span className={`text-xs font-normal ${isLight ? 'text-slate-600' : 'text-cyan-300/60'}`}>days</span>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border ${
              isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-[#061124] border-sky-500/15'
            }`}>
              <div className={`flex items-center gap-1.5 text-xs mb-1 ${
                isLight ? 'text-slate-700 font-medium' : 'text-sky-300/70'
              }`}>
                <ShieldCheck className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                Shielded
              </div>
              <div className={`text-xl font-bold font-mono ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {distractionCount} <span className={`text-xs font-normal ${isLight ? 'text-slate-600' : 'text-sky-300/60'}`}>sites</span>
              </div>
            </div>
          </div>

          {/* Subject Breakdown */}
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-[#061124] border-sky-500/15'
          }`}>
            <div className={`flex items-center justify-between mb-3 text-xs font-semibold ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <span className="flex items-center gap-1.5">
                <BookOpen className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                Time Spent by Subject
              </span>
              <span className={`text-[11px] font-normal ${isLight ? 'text-slate-600' : 'text-sky-300/70'}`}>
                {subjectBreakdown.length} courses
              </span>
            </div>

            {subjectBreakdown.length === 0 ? (
              <p className={`text-xs italic ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>No recorded sessions for this period.</p>
            ) : (
              <div className="space-y-2.5">
                {subjectBreakdown.map(([subj, mins]) => {
                  const pct = totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0;
                  return (
                    <div key={subj}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={`font-medium ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{subj}</span>
                        <span className={`font-mono font-semibold ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
                          {mins}m <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>({pct}%)</span>
                        </span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                        isLight ? 'bg-slate-300' : 'bg-[#0b213f]'
                      }`}>
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
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-[#dce9ed] border-slate-300' : 'bg-[#061124] border-sky-500/15'
          }`}>
            <div className={`flex items-center justify-between mb-3 text-xs font-semibold ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <span className="flex items-center gap-1.5">
                <Calendar className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                Session History Log
              </span>
              <span className={`text-[11px] font-normal ${isLight ? 'text-slate-600' : 'text-sky-300/70'}`}>
                {filteredSessions.length} total
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    isLight
                      ? 'bg-[#edf5f7] border-slate-300'
                      : 'bg-[#081730] border-sky-500/10'
                  }`}
                >
                  <div>
                    <span className={`font-medium block ${isLight ? 'text-slate-900' : 'text-white'}`}>{session.subject}</span>
                    <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.mode.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold font-mono block ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
                      +{session.actualMinutes} min
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`pt-3 border-t flex items-center justify-between shrink-0 mt-3 ${
          isLight ? 'border-slate-300' : 'border-sky-500/15'
        }`}>
          <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
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
