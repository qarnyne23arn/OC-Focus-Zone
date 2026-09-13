import React from 'react';
import { FocusProtocol } from '../types';
import { FOCUS_PROTOCOLS } from '../utils/storage';
import { Flame, Target, Clock, Zap, Check, ArrowRight } from 'lucide-react';

interface FocusProtocolsCardProps {
  currentFocusMinutes: number;
  onSelectProtocol: (protocol: FocusProtocol) => void;
}

export const FocusProtocolsCard: React.FC<FocusProtocolsCardProps> = ({
  currentFocusMinutes,
  onSelectProtocol,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'flame':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'target':
        return <Target className="w-4 h-4 text-cyan-400" />;
      case 'clock':
        return <Clock className="w-4 h-4 text-sky-400" />;
      case 'zap':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      default:
        return <Target className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-[#061022] border border-sky-500/20 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
            <Target className="w-4 h-4 text-cyan-400" />
            Science-Backed Focus Protocols
          </h3>
          <p className="text-[11px] text-sky-200/60 mt-0.5">
            1-click presets calibrating both focus endurance and neural recovery intervals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {FOCUS_PROTOCOLS.map((proto) => {
          const isActive = currentFocusMinutes === proto.focusMinutes;
          return (
            <div
              key={proto.id}
              onClick={() => onSelectProtocol(proto)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isActive
                  ? 'bg-gradient-to-b from-cyan-950/60 to-[#061022] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                  : 'bg-[#040c1a] border-sky-500/15 hover:border-cyan-500/40 hover:bg-[#071329]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      {getIcon(proto.iconName)}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white group-hover:text-cyan-300 transition">
                        {proto.name}
                      </h4>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        {proto.tagline}
                      </span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px]">
                      <Check className="w-3 h-3 stroke-[3]" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 group-hover:text-cyan-300 transition flex items-center gap-0.5">
                      Apply <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                  {proto.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span className="truncate max-w-[190px]">
                  Best for: {proto.recommendedFor}
                </span>
                <span className="font-mono text-cyan-300 font-bold shrink-0">
                  {proto.focusMinutes}m / {proto.breakMinutes}m
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
