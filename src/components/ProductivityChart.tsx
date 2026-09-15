import React, { useState } from 'react';
import { StudySession } from '../types';
import { getTodayDateString } from '../utils/storage';
import { Sparkles, TrendingUp, Flame, Award, Clock, ChevronRight } from 'lucide-react';

interface ProductivityChartProps {
  sessions: StudySession[];
  activeDateFilter: 'Today' | 'Yesterday' | 'This Week';
  onAddQuickSession?: (minutes: number, hour: number) => void;
  isLight?: boolean;
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({
  sessions,
  activeDateFilter,
  onAddQuickSession,
  isLight = false,
}) => {
  // Selected hour for interactive inspection (defaults to 14 like in the reference image)
  const [selectedHour, setSelectedHour] = useState<number>(14);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [timeSpanMode, setTimeSpanMode] = useState<'core' | 'full'>('core');

  const todayStr = getTodayDateString();

  // Compute yesterday's date string
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  // Filter sessions based on activeDateFilter
  const filteredSessions = sessions.filter((s) => {
    if (activeDateFilter === 'Today') {
      return s.date === todayStr;
    }
    if (activeDateFilter === 'Yesterday') {
      return s.date === yesterdayStr;
    }
    if (activeDateFilter === 'This Week') {
      const now = Date.now();
      const sTime = new Date(s.timestamp).getTime();
      return (now - sTime) <= 7 * 24 * 60 * 60 * 1000;
    }
    return true;
  });

  // Hours to display
  const hours = timeSpanMode === 'core' 
    ? [11, 12, 13, 14, 15, 16] 
    : [8, 10, 12, 14, 16, 18, 20, 22];

  // Calculate actual logged minutes and session details for each hour
  const chartData = hours.map((hr) => {
    const matched = filteredSessions.filter((s) => s.hour === hr);
    const minutes = matched.reduce((acc, curr) => acc + curr.actualMinutes, 0);
    const subjects = Array.from(new Set(matched.map((s) => s.subject)));

    return {
      hour: hr,
      label: `${hr}:00`,
      minutes,
      count: matched.length,
      subjects: subjects.length > 0 ? subjects : ['Deep Study'],
      sessionsList: matched,
    };
  });

  // Calculate dynamic maximum minutes for scaling
  const peakItem = chartData.reduce((max, d) => (d.minutes > max.minutes ? d : max), chartData[0] || { hour: 14, minutes: 45 });
  const maxMinutes = Math.max(50, peakItem.minutes + 5);

  // SVG dimensions
  const width = 420;
  const height = 145;
  const paddingX = 24;
  const bottomY = height - 26;
  const topY = 18;

  // Calculate coordinates for each point
  const points = chartData.map((item, index) => {
    const x = paddingX + (index / (chartData.length - 1)) * (width - 2 * paddingX);
    const ratio = Math.max(0.08, item.minutes / maxMinutes);
    const y = bottomY - ratio * (bottomY - topY);
    return { ...item, x, y };
  });

  // Build smooth cubic bezier curve
  const buildSmoothPath = () => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const curvePath = buildSmoothPath();
  const areaPath = `${curvePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;

  // Active or hovered point
  const activeHourToDisplay = hoveredPoint !== null ? hoveredPoint : selectedHour;
  const activePoint = points.find((p) => p.hour === activeHourToDisplay) || points[3] || points[0];

  const totalStudyMinutes = filteredSessions.reduce((acc, curr) => acc + curr.actualMinutes, 0);

  return (
    <div className="w-full mt-2 relative select-none space-y-3" id="productivity-trend-chart">
      {/* Top Banner with Peak Hour & Total */}
      <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-2 shadow-sm ${
        isLight
          ? 'bg-slate-50 border-slate-200'
          : 'bg-gradient-to-r from-[#08152e] via-[#0b1d3d] to-[#08152e] border-cyan-500/25'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/30">
            <Flame className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Peak Hour: {peakItem.hour}:00
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isLight ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {peakItem.minutes}m Flow
              </span>
            </div>
            <p className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-sky-200/60'}`}>
              {activeDateFilter}: {Math.floor(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m recorded across {filteredSessions.length} sessions
            </p>
          </div>
        </div>

        {/* Span toggle */}
        <div className={`flex items-center gap-1 p-0.5 rounded-xl border text-[10px] ${
          isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-900/80 border-slate-700/60'
        }`}>
          <button
            type="button"
            onClick={() => setTimeSpanMode('core')}
            className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition ${
              timeSpanMode === 'core'
                ? 'bg-cyan-500 text-slate-950 shadow font-extrabold'
                : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
            }`}
          >
            Core (11-16)
          </button>
          <button
            type="button"
            onClick={() => setTimeSpanMode('full')}
            className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer transition ${
              timeSpanMode === 'full'
                ? 'bg-cyan-500 text-slate-950 shadow font-extrabold'
                : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
            }`}
          >
            Full Day
          </button>
        </div>
      </div>

      {/* Header Info Tooltip with live reactive values */}
      <div className={`flex items-center justify-between px-2 text-[11px] ${
        isLight ? 'text-slate-800' : 'text-sky-200/90'
      }`}>
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
          <span>Productivity Wave Timeline</span>
        </span>
        <div className="flex items-center gap-2">
          <span className={`font-extrabold font-mono text-xs px-2 py-0.5 rounded-lg border ${
            isLight
              ? 'text-cyan-900 bg-cyan-100 border-cyan-300'
              : 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30'
          }`}>
            {activePoint.hour}:00 — {activePoint.minutes} min
          </span>
          {activePoint.count > 0 && (
            <span className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-sky-300/80'}`}>
              ({activePoint.count} {activePoint.count === 1 ? 'block' : 'blocks'})
            </span>
          )}
        </div>
      </div>

      {/* Interactive SVG Chart Area with Enhanced Cyan-Cobalt Glow Wave */}
      <div className={`relative w-full h-[145px] overflow-hidden rounded-2xl border p-1 shadow-inner ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-gradient-to-b from-[#071329]/90 to-[#030917]/90 border-sky-500/20'
      }`}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            {/* Glowing Gradient fill for the wave area */}
            <linearGradient id="chartAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.85" />
              <stop offset="30%" stopColor="#0072ff" stopOpacity="0.55" />
              <stop offset="70%" stopColor="#003cd6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#030c1f" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing stroke filter */}
            <filter id="chartLineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Vertical grid lines extending down to each hour */}
          {points.map((p) => {
            const isHighlighted = p.hour === activeHourToDisplay;
            return (
              <line
                key={`grid-${p.hour}`}
                x1={p.x}
                y1={topY}
                x2={p.x}
                y2={bottomY}
                stroke={isHighlighted ? '#38bdf8' : '#122c52'}
                strokeWidth={isHighlighted ? 1.5 : 0.8}
                strokeDasharray={isHighlighted ? 'none' : '2 3'}
                opacity={isHighlighted ? 0.9 : 0.4}
              />
            );
          })}

          {/* Mountain Gradient Wave Area */}
          <path
            d={areaPath}
            fill="url(#chartAreaGradient)"
          />

          {/* Smooth upper glowing stroke curve */}
          <path
            d={curvePath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#chartLineGlow)"
          />

          {/* Selected/Hovered Hour Vertical Highlight Guide Line */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={activePoint.y}
              x2={activePoint.x}
              y2={bottomY}
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="2 2"
              opacity="0.9"
            />
          )}

          {/* Selected Hour Dot Marker with Glowing Outer Halo */}
          {activePoint && (
            <g transform={`translate(${activePoint.x}, ${activePoint.y})`}>
              {/* Outer pulsing ring */}
              <circle
                r="8"
                fill="#00e5ff"
                opacity="0.4"
                className="animate-ping"
              />
              {/* Dark rim with electric cyan border */}
              <circle
                r="6.5"
                fill="#03142e"
                stroke="#00f0ff"
                strokeWidth="2.5"
              />
              {/* Center crisp white core dot */}
              <circle
                r="2.8"
                fill="#ffffff"
              />
            </g>
          )}

          {/* Axis Baseline */}
          <line
            x1={paddingX}
            y1={bottomY}
            x2={width - paddingX}
            y2={bottomY}
            stroke={isLight ? '#cbd5e1' : '#1d3d6e'}
            strokeWidth="1.2"
          />

          {/* Axis Hour Ticks & Numbers */}
          {points.map((p) => {
            const isSelected = p.hour === activeHourToDisplay;
            return (
              <g
                key={`label-${p.hour}`}
                className="cursor-pointer transition-all"
                onClick={() => setSelectedHour(p.hour)}
                onMouseEnter={() => setHoveredPoint(p.hour)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Invisible wider target for easy hovering/clicking */}
                <rect
                  x={p.x - 18}
                  y={topY}
                  width="36"
                  height={height - topY}
                  fill="transparent"
                />

                {/* Vertical tick on axis */}
                <line
                  x1={p.x}
                  y1={bottomY}
                  x2={p.x}
                  y2={bottomY + 4}
                  stroke={isSelected ? '#0ea5e9' : (isLight ? '#94a3b8' : '#334155')}
                  strokeWidth={isSelected ? '2' : '1.2'}
                />

                {/* Hour Number */}
                <text
                  x={p.x}
                  y={bottomY + 16}
                  textAnchor="middle"
                  fill={isSelected ? (isLight ? '#0f172a' : '#ffffff') : (isLight ? '#475569' : '#64748b')}
                  fontSize="11"
                  fontWeight={isSelected ? '800' : '600'}
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {p.hour}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hourly Quick Strip Chips */}
      <div className="grid grid-cols-6 gap-1.5 pt-1">
        {chartData.slice(0, 6).map((item) => {
          const isSelected = item.hour === activeHourToDisplay;
          return (
            <button
              key={`chip-${item.hour}`}
              type="button"
              onClick={() => setSelectedHour(item.hour)}
              className={`p-2 rounded-xl text-center border transition cursor-pointer flex flex-col items-center justify-between ${
                isSelected
                  ? isLight
                    ? 'bg-cyan-500 border-cyan-500 text-slate-950 font-black shadow-sm'
                    : 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                  : isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    : 'bg-[#061022] border-sky-500/15 hover:border-sky-500/35 text-slate-300'
              }`}
            >
              <span className={`text-[10px] font-mono font-bold ${
                isSelected && isLight ? 'text-slate-950' : (isLight ? 'text-slate-600' : 'text-slate-400')
              }`}>
                {item.hour}:00
              </span>
              <span className={`text-xs font-black my-0.5 ${
                isSelected && isLight ? 'text-slate-950' : (isLight ? 'text-cyan-700' : 'text-cyan-300')
              }`}>
                {item.minutes}m
              </span>
              <div className={`w-full h-1 rounded-full overflow-hidden ${
                isSelected && isLight ? 'bg-slate-900/20' : (isLight ? 'bg-slate-200' : 'bg-slate-800')
              }`}>
                <div 
                  className={`h-full rounded-full ${isSelected && isLight ? 'bg-slate-950' : 'bg-cyan-400'}`}
                  style={{ width: `${Math.min(100, Math.round((item.minutes / maxMinutes) * 100))}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Mini details badge below chart */}
      <div className={`flex items-center justify-between text-[11px] px-1 pt-1 border-t ${
        isLight ? 'text-slate-600 border-slate-200' : 'text-slate-400 border-sky-500/10'
      }`}>
        <span className={`truncate max-w-[220px] font-medium ${
          isLight ? 'text-slate-800' : 'text-sky-200/80'
        }`}>
          Subjects: {activePoint.subjects.join(', ')}
        </span>
        <span className={`font-mono text-[10px] ${isLight ? 'text-cyan-700 font-semibold' : 'text-cyan-400'}`}>
          Click any hour point or chip to inspect
        </span>
      </div>
    </div>
  );
};
