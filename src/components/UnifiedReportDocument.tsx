import React, { forwardRef } from 'react';
import { StudySession, BlockedWebsite, DistractionLogItem } from '../types';
import { calculateDailyReport, calculateMonthlyReport } from '../utils/reports';

interface UnifiedReportDocumentProps {
  sessions: StudySession[];
  blockedSites?: BlockedWebsite[];
  distractionCount?: number;
  distractionLog?: DistractionLogItem[];
  dateStr?: string;
  year?: number;
  month?: number;
  goalMinutes?: number;
}

export const UnifiedReportDocument = forwardRef<HTMLDivElement, UnifiedReportDocumentProps>(({
  sessions,
  blockedSites = [],
  distractionCount = 0,
  distractionLog = [],
  dateStr = new Date().toISOString().slice(0, 10),
  year = new Date().getFullYear(),
  month = new Date().getMonth(),
  goalMinutes = 240, // 4 hours target
}, ref) => {
  const daily = calculateDailyReport(sessions, dateStr, blockedSites, goalMinutes, distractionLog);
  const monthly = calculateMonthlyReport(sessions, year, month, blockedSites);

  const dailyHours = (daily.focusedMinutes / 60).toFixed(1);
  const targetHours = (goalMinutes / 60).toFixed(1);

  // Helper for SVG Pie Chart Arc calculation (handling single category full circle correctly)
  const renderPieChart = (categories: [string, number][], totalMins: number) => {
    if (totalMins === 0 || categories.length === 0) {
      return (
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="45" fill="#1a1d24" stroke="#2a2e39" strokeWidth="6" />
          <text x="55" y="59" textAnchor="middle" fill="#9ca3af" fontSize="10" fontFamily="sans-serif">No data</text>
        </svg>
      );
    }

    if (categories.length === 1) {
      return (
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="45" fill="#4a8fd6" stroke="#0f1115" strokeWidth="3" />
          <text x="55" y="59" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="sans-serif">100%</text>
        </svg>
      );
    }

    let cumulativeAngle = 0;
    const colors = ['#4a8fd6', '#6b9b37', '#d99a3d', '#d96b6b', '#a8c97f'];

    return (
      <svg width="110" height="110" viewBox="0 0 110 110" className="transform -rotate-90">
        {categories.map(([name, mins], idx) => {
          const percentage = mins / totalMins;
          const angle = percentage * 360;
          const x1 = 55 + 45 * Math.cos((Math.PI * cumulativeAngle) / 180);
          const y1 = 55 + 45 * Math.sin((Math.PI * cumulativeAngle) / 180);
          
          cumulativeAngle += angle;
          const x2 = 55 + 45 * Math.cos((Math.PI * cumulativeAngle) / 180);
          const y2 = 55 + 45 * Math.sin((Math.PI * cumulativeAngle) / 180);

          const largeArcFlag = angle > 180 ? 1 : 0;
          const pathData = `M 55 55 L ${x1} ${y1} A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

          return (
            <path
              key={name}
              d={pathData}
              fill={colors[idx % colors.length]}
              stroke="#0f1115"
              strokeWidth="2.5"
            />
          );
        })}
      </svg>
    );
  };

  // Monthly polyline points calculation
  const maxMonthlyMin = Math.max(1, ...monthly.dailyTrend.map(d => d.mins));
  const monthlyPolylinePoints = monthly.dailyTrend.map((d, i) => {
    const x = (i / Math.max(1, monthly.dailyTrend.length - 1)) * 640 + 20;
    const y = 80 - (d.mins / maxMonthlyMin) * 60;
    return `${x},${Math.max(15, y)}`;
  }).join(' ');

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #report-container, #report-container * {
            visibility: visible;
          }
          #report-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background-color: #0f1115 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            background: #0f1115;
            margin: 0.5in;
          }
        }
      `}</style>
      <div
        ref={ref}
        id="report-container"
        style={{ width: '760px', backgroundColor: '#0f1115', color: '#ffffff' }}
        className="p-8 font-sans rounded-2xl border border-white/10 shadow-2xl space-y-8 select-none"
      >
      {/* ================= DAILY REPORT SECTION ================= */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1a1d24] border border-white/10 text-[#6b9b37]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">Today's match report</h2>
              <p className="text-xs text-[#9ca3af]">Daily performance & focus telemetry</p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-[#4a8fd6] bg-[#1a1d24] px-3 py-1.5 rounded-lg border border-white/10">
            {dateStr}
          </span>
        </div>

        {/* Scoreboard Row (6 cards in 3x2 grid) */}
        <div className="grid grid-cols-3 gap-3">
          {/* Card 1: Focused time */}
          <div className="p-3.5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-1">
            <span className="text-xs text-[#9ca3af] block">Focused time</span>
            <div className="text-lg font-bold font-mono text-white">{dailyHours}h</div>
            <span className={`text-[10px] ${daily.focusedMinutes >= goalMinutes ? 'text-[#6b9b37]' : 'text-[#d96b6b]'}`}>
              {daily.focusedMinutes >= goalMinutes ? 'Goal achieved' : `Target: ${targetHours}h`}
            </span>
          </div>

          {/* Card 2: Sessions won */}
          <div className="p-3.5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-1">
            <span className="text-xs text-[#9ca3af] block">Sessions won</span>
            <div className="text-lg font-bold font-mono text-white">{daily.sessionsWon}/{daily.sessionsTotal}</div>
            <span className="text-[10px] text-[#6b9b37]">{Math.round(daily.successRate * 100)}% completion</span>
          </div>

          {/* Card 3: Best streak */}
          <div className="p-3.5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-1">
            <span className="text-xs text-[#9ca3af] block">Best streak</span>
            <div className="text-lg font-bold font-mono text-white">{daily.bestStreakMinutes}m</div>
            <span className="text-[10px] text-[#a8c97f]">Unbroken focus</span>
          </div>

          {/* Card 4: Shielded */}
          <div className="p-3.5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-1">
            <span className="text-xs text-[#9ca3af] block">Shielded sites</span>
            <div className="text-lg font-bold font-mono text-white">{daily.shieldedCount} active</div>
            <span className="text-[10px] text-[#4a8fd6]">Distractions blocked</span>
          </div>

          {/* Card 5: Energy shift */}
          <div className="p-3.5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-1">
            <span className="text-xs text-[#9ca3af] block">Energy shift</span>
            <div className="text-lg font-bold font-mono text-[#a8c97f]">
              {daily.energy_shift.start} → {daily.energy_shift.end}
            </div>
            <span className="text-[10px] text-[#9ca3af]">Scale 1–5 average</span>
          </div>

          {/* Card 6: Break adherence */}
          <div className="p-3.5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-1">
            <span className="text-xs text-[#9ca3af] block">Break adherence</span>
            <div className="text-lg font-bold font-mono text-white">
              {daily.break_adherence.taken}/{daily.break_adherence.scheduled}
            </div>
            <span className="text-[10px] text-[#d99a3d]">{Math.round(daily.break_adherence.rate * 100)}% rating</span>
          </div>
        </div>

        {/* Focused minutes by hour (12 bars: 8am - 7pm) */}
        <div className="p-5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#9ca3af]">
            <span>Focused minutes by hour (8am – 7pm)</span>
            <span className="text-white font-mono">Intensity graded</span>
          </div>
          <div className="flex items-end justify-between h-24 pt-4 px-2">
            {(() => {
              console.log("[UnifiedReportDocument] Render hourlyBars array:", daily.hourlyBars);
              const maxHourMins = Math.max(1, ...daily.hourlyBars.map(b => b.mins), 60);
              return daily.hourlyBars.map((item, idx) => {
                const heightPct = Math.max(item.mins > 0 ? 15 : 4, Math.min(100, (item.mins / maxHourMins) * 100));
                const color = item.mins >= 45 ? '#6b9b37' : item.mins >= 15 ? '#a8c97f' : (item.mins > 0 ? '#3b82f6' : '#2a2e39');
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 mx-1">
                    <div
                      className="w-full rounded-t transition-all min-h-[4px]"
                      style={{ height: `${heightPct}%`, backgroundColor: color }}
                      title={`${item.hour}: ${item.mins} mins`}
                    />
                    <span className="text-[9px] text-[#9ca3af] font-mono">{item.hour}</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Session energy timeline */}
        <div className="p-5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#9ca3af]">
            <span>Session energy timeline</span>
            <span className="text-white font-mono">Chronological progression</span>
          </div>
          <div className="grid grid-cols-6 gap-2 pt-2">
            {daily.timeline.length === 0 ? (
              <div className="col-span-6 text-xs text-[#9ca3af] italic py-2">No session blocks recorded today.</div>
            ) : (
              daily.timeline.map((s, idx) => {
                const hasEnergy = s.energy !== null && s.energy !== undefined;
                const bg = !hasEnergy ? '#2a2e39' : s.energy >= 4 ? '#6b9b37' : s.energy === 3 ? '#d99a3d' : '#d96b6b';
                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#0f1115] border border-white/5 text-center space-y-1.5">
                    <div className="h-3 rounded" style={{ backgroundColor: bg }} />
                    <span className="text-[9px] font-mono text-[#9ca3af] block">{s.time}</span>
                    <span className="text-[11px] font-bold text-white block">
                      {hasEnergy ? `${s.energy}/5` : 'Not Rated'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Time by task (Pie chart + legend) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-[#1a1d24] border border-white/10 flex items-center justify-between">
            <div className="space-y-3">
              <span className="text-xs text-[#9ca3af] block">Time by task/category</span>
              <div className="space-y-1.5">
                {daily.categories.length === 0 ? (
                  <span className="text-xs text-[#9ca3af] italic">No categories logged</span>
                ) : (
                  daily.categories.map(([cat, mins], idx) => {
                    const colors = ['bg-[#4a8fd6]', 'bg-[#6b9b37]', 'bg-[#d99a3d]', 'bg-[#d96b6b]', 'bg-[#a8c97f]'];
                    return (
                      <div key={cat} className="flex items-center gap-2 text-xs">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                        <span className="text-white font-medium">{cat}</span>
                        <span className="text-[#9ca3af] font-mono ml-auto">{mins}m</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div>
              {renderPieChart(daily.categories, daily.focusedMinutes)}
            </div>
          </div>

          {/* MVP vs Missed */}
          <div className="p-5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-4">
            <div className="space-y-1">
              <span className="text-xs text-[#6b9b37] uppercase tracking-wider font-bold">MVP Session</span>
              {daily.mvpSession ? (
                <div className="text-sm font-bold text-white">
                  {daily.mvpSession.subject} <span className="text-xs font-mono text-[#9ca3af]">({daily.mvpSession.duration}m)</span>
                </div>
              ) : (
                <div className="text-xs text-[#9ca3af] italic">No completed MVP session yet</div>
              )}
            </div>
            <div className="space-y-1 pt-2 border-t border-white/10">
              <span className="text-xs text-[#d96b6b] uppercase tracking-wider font-bold">Most Fragile Session</span>
              {daily.missedSession ? (
                <div className="text-sm font-bold text-white">
                  {daily.missedSession.subject} <span className="text-xs font-mono text-[#9ca3af]">({daily.missedSession.duration}m)</span>
                  <p className="text-[10px] text-[#9ca3af] font-normal mt-0.5">{daily.missedSession.reason}</p>
                </div>
              ) : (
                <div className="text-xs text-[#9ca3af] italic">Zero interrupted or fragile sessions</div>
              )}
            </div>
          </div>
        </div>

        {/* Distraction log */}
        <div className="p-5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#9ca3af]">
            <span>Distraction & intercepted site log</span>
            <span className="text-white font-mono">Real-time shield logs</span>
          </div>
          {daily.distractionLog.length === 0 ? (
            <div className="text-xs text-[#9ca3af] italic py-2">No distractions logged today. Shield is clean!</div>
          ) : (
            <div className="space-y-2">
              {daily.distractionLog.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0f1115] border border-white/5 text-xs">
                  <span className="font-mono text-white font-medium">{log.domain}</span>
                  <div className="flex items-center gap-4 text-[#9ca3af]">
                    <span>{log.visits} visits</span>
                    <span className="font-mono text-[#d96b6b]">{log.totalSec}s intercepted</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pattern note */}
        <div className="p-4 rounded-xl bg-[#1a1d24] border border-white/10 flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-lg bg-[#6b9b37]/20 text-[#6b9b37] text-xs font-bold font-mono">
            Pattern
          </span>
          <p className="text-xs text-[#d1d5db] font-medium">{daily.pattern_note}</p>
        </div>
      </div>

      {/* ================= MONTHLY SEASON REVIEW SECTION ================= */}
      <div className="space-y-6 pt-6 border-t border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1a1d24] border border-white/10 text-[#4a8fd6]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">Season review & telemetry</h2>
              <p className="text-xs text-[#9ca3af]">Monthly aggregate performance & trends</p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-white bg-[#1a1d24] px-3 py-1.5 rounded-lg border border-white/10">
            {monthly.totalMinutes}m Total Output
          </span>
        </div>

        {/* Monthly Scoreboard */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-1">
            <span className="text-xs text-[#9ca3af] block">Monthly total</span>
            <div className="text-lg font-bold font-mono text-white">{(monthly.totalMinutes / 60).toFixed(1)}h</div>
            <span className="text-[10px] text-[#6b9b37]">+{monthly.percentChange}% vs prior</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-1">
            <span className="text-xs text-[#9ca3af] block">Daily average</span>
            <div className="text-lg font-bold font-mono text-white">{monthly.avgDailyMinutes}m</div>
            <span className="text-[10px] text-[#4a8fd6]">Across {monthly.activeDaysCount} active days</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-1">
            <span className="text-xs text-[#9ca3af] block">Peak day</span>
            <div className="text-lg font-bold font-mono text-white">{monthly.peakDay.mins}m</div>
            <span className="text-[10px] text-[#a8c97f]">Day {monthly.peakDay.day} of month</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-1">
            <span className="text-xs text-[#9ca3af] block">Break rate</span>
            <div className="text-lg font-bold font-mono text-white">{Math.round(monthly.break_adherence_rate * 100)}%</div>
            <span className="text-[10px] text-[#d99a3d]">Monthly adherence</span>
          </div>
        </div>

        {/* Monthly Daily Trend Sparkline */}
        <div className="p-5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#9ca3af]">
            <span>Monthly daily output trend</span>
            <span className="text-white font-mono">20-day cadence</span>
          </div>
          <div className="h-24 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 680 90">
              <polyline
                fill="none"
                stroke="#6b9b37"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={monthlyPolylinePoints}
              />
            </svg>
          </div>
        </div>

        {/* Weekly Adherence & Top Distractions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-3">
            <span className="text-xs text-[#9ca3af] block">Weekly break adherence rate</span>
            <div className="space-y-2">
              {monthly.break_adherence_by_week.map(w => (
                <div key={w.week_number} className="flex items-center justify-between text-xs">
                  <span className="text-white">Week {w.week_number}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 rounded-full bg-[#0f1115] overflow-hidden">
                      <div className="h-full bg-[#6b9b37]" style={{ width: `${w.rate * 100}%` }} />
                    </div>
                    <span className="font-mono text-[#9ca3af] w-8 text-right">{Math.round(w.rate * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#1a1d24] border border-white/10 space-y-3">
            <span className="text-xs text-[#9ca3af] block">Configured shield & distractions</span>
            {monthly.topDistractions.length === 0 ? (
              <div className="text-xs text-[#9ca3af] italic py-4">No blocked sites configured.</div>
            ) : (
              <div className="space-y-2">
                {monthly.topDistractions.map(d => (
                  <div key={d.rank} className="flex items-center justify-between p-2 rounded-lg bg-[#0f1115] border border-white/5 text-xs">
                    <span className="font-mono text-white">#{d.rank} {d.domain}</span>
                    <span className="text-[10px] text-[#9ca3af] font-mono">Active shield</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Season Summary & Next Move */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#1a1d24] border border-white/10 space-y-1">
            <span className="text-[10px] text-[#6b9b37] uppercase font-mono tracking-wider">Player of the Month</span>
            <div className="text-sm font-bold text-white">{monthly.playerOfTheMonth.title}</div>
            <p className="text-xs text-[#9ca3af]">{monthly.playerOfTheMonth.subtitle}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#1a1d24] border border-white/10 space-y-1">
            <span className="text-[10px] text-[#4a8fd6] uppercase font-mono tracking-wider">Next Month's Move</span>
            <div className="text-sm font-bold text-white">{monthly.nextMonthsMove.title}</div>
            <p className="text-xs text-[#9ca3af]">{monthly.nextMonthsMove.subtitle}</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
});

UnifiedReportDocument.displayName = 'UnifiedReportDocument';
