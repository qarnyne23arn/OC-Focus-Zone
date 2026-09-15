import React from 'react';
import { AlertOctagon, RotateCcw, X, ShieldAlert } from 'lucide-react';

interface SystemResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const SystemResetModal: React.FC<SystemResetModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0b101d] border border-rose-500/30 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
          <AlertOctagon className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            System Reset
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Are you sure you want to perform a complete system reset? This action will:
          </p>
        </div>

        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside bg-[#060a14] p-3 rounded-2xl border border-slate-800">
          <li>Reset timer to 45:00 study standard</li>
          <li>Clear task checklist and active task</li>
          <li>Clear local study session cache & reflections</li>
          <li>Reset anti-cheat records & distraction blocker</li>
        </ul>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Confirm Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
