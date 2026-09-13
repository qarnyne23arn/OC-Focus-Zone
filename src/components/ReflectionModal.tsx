import React, { useState } from 'react';
import { Sparkles, Zap, BookOpen, Check, X, Tag, Award, Calendar } from 'lucide-react';
import { SessionReflection } from '../types';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reflection: Omit<SessionReflection, 'id' | 'timestamp'>) => void;
  currentTaskName: string;
  sessionMinutes: number;
}

const COMMON_TAGS = ['#coding', '#exam_prep', '#math', '#reading', '#problem_solving', '#writing', '#assignment'];

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentTaskName,
  sessionMinutes,
}) => {
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [notes, setNotes] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['#exam_prep']);
  const [newTagInput, setNewTagInput] = useState<string>('');

  if (!isOpen) return null;

  const energyLabels = {
    1: '😴 Distracted & Drained',
    2: '🥱 Sluggish / Struggled',
    3: '👍 Steady Focus',
    4: '⚡ High Flow State',
    5: '🔥 Unstoppable Zone',
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const formatted = newTagInput.startsWith('#') ? newTagInput.trim() : `#${newTagInput.trim()}`;
    if (!selectedTags.includes(formatted)) {
      setSelectedTags([...selectedTags, formatted]);
    }
    setNewTagInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      taskName: currentTaskName || 'General Focus Block',
      date: new Date().toISOString().split('T')[0],
      energyLevel,
      notes: notes.trim(),
      tags: selectedTags,
      durationMinutes: sessionMinutes || 25,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#040c1a] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Session Reflection</h2>
            <p className="text-xs text-slate-400">
              {sessionMinutes}m focused on <span className="text-cyan-300 font-semibold">{currentTaskName || 'General Focus'}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Energy & Focus Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Focus & Energy Level</span>
              <span className="text-cyan-400 font-medium normal-case">{energyLabels[energyLevel]}</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setEnergyLevel(level)}
                  className={`py-3 rounded-2xl flex flex-col items-center justify-center gap-1 border transition cursor-pointer ${
                    energyLevel === level
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg'
                      : 'bg-[#061226] border-sky-500/15 text-slate-400 hover:border-sky-500/40'
                  }`}
                >
                  <Zap className={`w-5 h-5 ${energyLevel >= level ? 'fill-cyan-400 text-cyan-400' : 'text-slate-600'}`} />
                  <span className="text-xs font-bold">{level}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accomplishment / Journal Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              What did you accomplish or learn?
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Finished 3 dynamic programming problems, understood memoization table..."
              rows={3}
              className="w-full p-3 rounded-2xl bg-[#030914] border border-sky-500/20 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {/* Quick Tags */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Categorize Your Session
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-[#061226] border-sky-500/15 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="+ Add custom tag (e.g. physics)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#030914] border border-sky-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 font-medium cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Skip
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 cursor-pointer transition"
            >
              <Check className="w-4 h-4" />
              Save Reflection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
