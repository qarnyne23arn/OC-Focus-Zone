import React, { useState } from 'react';
import { Cloud, CloudOff, RefreshCw, Smartphone, Laptop, Tablet, CheckCircle, Copy, Check, Wifi, WifiOff } from 'lucide-react';
import { CloudSyncState } from '../types';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: CloudSyncState;
  onTriggerSync: () => Promise<void>;
  onUpdateSyncCode: (newCode: string) => void;
  offlineQueueCount: number;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onTriggerSync,
  onUpdateSyncCode,
  offlineQueueCount,
}) => {
  const [inputCode, setInputCode] = useState(syncState.syncCode);
  const [copied, setCopied] = useState(false);
  const [pairingSuccess, setPairingSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(syncState.syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    onUpdateSyncCode(inputCode.trim().toUpperCase());
    setPairingSuccess(true);
    setTimeout(() => setPairingSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#08152c] border border-sky-500/25 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-sky-500/15">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <Cloud className="w-5 h-5 text-cyan-400" />
            Cross-Device Cloud Sync
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Network & Sync Status Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#061022] border border-sky-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              syncState.isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {syncState.isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  {syncState.isOnline ? 'Network Connected' : 'Offline Mode Active'}
                </span>
                <span className={`w-2 h-2 rounded-full ${syncState.isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              </div>
              <p className="text-[11px] text-sky-200/60">
                {syncState.lastSyncedAt
                  ? `Cloud synced: ${new Date(syncState.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Syncing to secure cloud store'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onTriggerSync}
            disabled={syncState.isSyncing}
            className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 hover:text-white transition cursor-pointer"
            title="Force Cloud Sync"
          >
            <RefreshCw className={`w-4 h-4 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Offline Queue Notification if offline */}
        {offlineQueueCount > 0 && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
            <span>{offlineQueueCount} session(s) pending cloud upload</span>
            <span className="text-[10px] text-amber-400 font-medium">Will auto-sync on reconnect</span>
          </div>
        )}

        {/* Sync Code Pairing */}
        <div className="mt-4 p-4 rounded-2xl bg-[#061022] border border-sky-500/20">
          <span className="text-xs font-semibold text-white block mb-1">
            Device Pairing Sync Code
          </span>
          <p className="text-xs text-sky-200/60 mb-3">
            Use this code to link your phone, tablet, and laptop so your study time, goals, and blocked sites remain synchronized everywhere.
          </p>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 px-3 py-2 rounded-xl bg-[#0a1b38] border border-cyan-500/40 font-mono text-cyan-300 font-bold text-center tracking-widest text-sm">
              {syncState.syncCode}
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
              title="Copy Sync Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Join existing code */}
          <form onSubmit={handleApplyCode} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter code from other device"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-1.5 rounded-xl bg-[#08152c] border border-sky-500/20 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition cursor-pointer"
            >
              Pair Device
            </button>
          </form>

          {pairingSuccess && (
            <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Connected to cloud workspace successfully!
            </div>
          )}
        </div>

        {/* Connected Devices List */}
        <div className="mt-4">
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            Active Devices in Workspace
          </span>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#061022] border border-sky-500/15 text-xs">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-cyan-400" />
                <span className="font-medium text-white">Desktop / Laptop</span>
                <span className="text-[10px] text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded">This Device</span>
              </div>
              <span className="text-[11px] text-slate-400">Active Now</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#061022] border border-sky-500/15 text-xs">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span className="text-slate-300">iPhone / Mobile</span>
              </div>
              <span className="text-[11px] text-slate-400">Synced 10m ago</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#061022] border border-sky-500/15 text-xs">
              <div className="flex items-center gap-2">
                <Tablet className="w-4 h-4 text-sky-400" />
                <span className="text-slate-300">Tablet / iPad</span>
              </div>
              <span className="text-[11px] text-slate-400">Synced 1h ago</span>
            </div>
          </div>
        </div>

        <div className="mt-5 text-right">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-sky-300/80 hover:text-white px-4 py-2 rounded-xl hover:bg-slate-800 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
