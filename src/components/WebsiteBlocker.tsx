import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Plus, Trash2, Globe, ExternalLink, Sparkles } from 'lucide-react';
import { BlockedWebsite } from '../types';

interface WebsiteBlockerProps {
  blockedSites: BlockedWebsite[];
  onToggleSite: (id: string) => void;
  onAddSite: (domain: string, name: string) => void;
  onRemoveSite: (id: string) => void;
  isTimerRunning: boolean;
  onSimulateBlock: (domain: string) => void;
  distractionCount: number;
}

export const WebsiteBlocker: React.FC<WebsiteBlockerProps> = ({
  blockedSites,
  onToggleSite,
  onAddSite,
  onRemoveSite,
  isTimerRunning,
  onSimulateBlock,
  distractionCount,
}) => {
  const [newDomain, setNewDomain] = useState('');
  const [newName, setNewName] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    const cleanDomain = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const cleanName = newName.trim() || cleanDomain.split('.')[0].toUpperCase();
    onAddSite(cleanDomain, cleanName);
    setNewDomain('');
    setNewName('');
  };

  const activeCount = blockedSites.filter((s) => s.enabled).length;

  const copyHostsScript = () => {
    const list = blockedSites.filter((s) => s.enabled).map((s) => `127.0.0.1 ${s.domain}\n127.0.0.1 www.${s.domain}`).join('\n');
    navigator.clipboard.writeText(`# Focus Time Blocklist\n${list}`);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-4 text-slate-200">
      {/* Blocker Status Card */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isTimerRunning 
          ? 'bg-gradient-to-br from-[#0c2448] to-[#08152c] border-cyan-500/40 shadow-[0_0_20px_rgba(0,180,255,0.15)]' 
          : 'bg-[#09152b]/90 border-sky-500/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isTimerRunning ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {isTimerRunning ? <ShieldCheck className="w-5 h-5 animate-pulse" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">Student Focus Shield</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isTimerRunning ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isTimerRunning ? 'ACTIVE SHIELD' : 'STANDBY'}
                </span>
              </div>
              <p className="text-xs text-sky-200/60 mt-0.5">
                {isTimerRunning 
                  ? `Intercepting ${activeCount} distracting domains`
                  : 'Activates automatically when you start your focus timer'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-cyan-300">{distractionCount}</div>
            <div className="text-[10px] text-sky-300/60">Interceptions</div>
          </div>
        </div>
      </div>

      {/* Simulator Quick Action */}
      <div className="p-3 rounded-xl bg-[#061022] border border-sky-500/15 flex items-center justify-between">
        <div className="text-xs text-sky-200">
          <span className="font-medium text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Test Shield Interceptor
          </span>
          <span className="text-sky-300/60 text-[11px] block">See what happens when a student tries to open a blocked website</span>
        </div>
        <button
          type="button"
          onClick={() => onSimulateBlock('youtube.com')}
          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Test Block
        </button>
      </div>

      {/* Add Custom Site Form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="e.g. reddit.com or twitch.tv"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl bg-[#071328] border border-sky-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1 transition shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Site
        </button>
      </form>

      {/* Blocked Websites List */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {blockedSites.map((site) => (
          <div
            key={site.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-[#08152e]/80 border border-sky-500/10 hover:border-sky-500/25 transition"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Globe className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="truncate">
                <span className="text-xs font-medium text-white block truncate">{site.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{site.domain}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSimulateBlock(site.domain)}
                title="Test block interception for this site"
                className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-sky-500/10 transition text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              
              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => onToggleSite(site.id)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  site.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    site.enabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => onRemoveSite(site.id)}
                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / Hosts file export button */}
      <div className="pt-2 border-t border-sky-500/10 flex items-center justify-between text-[11px] text-slate-400">
        <span>Desktop DNS / Hosts Integration</span>
        <button
          type="button"
          onClick={copyHostsScript}
          className="text-cyan-400 hover:underline cursor-pointer"
        >
          {copiedScript ? '✓ Copied /etc/hosts rules!' : 'Copy Hosts File Rules'}
        </button>
      </div>
    </div>
  );
};
