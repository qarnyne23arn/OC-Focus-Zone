import React, { useState } from 'react';
import { TaskItem } from '../types';
import { CheckCircle2, Circle, Plus, Trash2, Edit2, Check, BookOpen, Sparkles } from 'lucide-react';

interface TaskManagerProps {
  tasks: TaskItem[];
  activeTaskName: string;
  onSelectActiveTask: (name: string) => void;
  onUpdateActiveTaskName: (newName: string) => void;
  onAddTask: (name: string, targetPomodoros?: number) => void;
  onToggleTaskComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  activeTaskName,
  onSelectActiveTask,
  onUpdateActiveTaskName,
  onAddTask,
  onToggleTaskComplete,
  onDeleteTask,
}) => {
  const [isEditingActiveName, setIsEditingActiveName] = useState(false);
  const [tempName, setTempName] = useState(activeTaskName);
  const [newTaskInput, setNewTaskInput] = useState('');

  const handleSaveActiveName = () => {
    if (tempName.trim()) {
      onUpdateActiveTaskName(tempName.trim());
    }
    setIsEditingActiveName(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    onAddTask(newTaskInput.trim(), 4);
    setNewTaskInput('');
  };

  return (
    <div className="w-full space-y-3.5 text-slate-200">
      {/* 1. Active Focus Task Card with Inline Edit */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#091a38] to-[#071328] border border-cyan-500/30 shadow-sm">
        <div className="flex items-center justify-between text-[11px] text-sky-300/80 mb-1.5">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            Enter / Active Task
          </span>
          <span className="text-slate-400 text-[10px]">Click to edit name</span>
        </div>

        {isEditingActiveName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveActiveName();
                if (e.key === 'Escape') setIsEditingActiveName(false);
              }}
              className="flex-1 px-3 py-1.5 rounded-xl bg-[#061022] border border-cyan-400 text-white font-semibold text-sm focus:outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSaveActiveName}
              className="p-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white cursor-pointer"
              title="Save Task Name"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => {
              setTempName(activeTaskName);
              setIsEditingActiveName(true);
            }}
            className="flex items-center justify-between group cursor-pointer p-1 -m-1 rounded-lg hover:bg-sky-500/10 transition"
          >
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-bold text-base text-white truncate tracking-tight">
                {activeTaskName}
              </span>
            </div>
            <button
              type="button"
              className="opacity-60 group-hover:opacity-100 text-cyan-300 p-1 rounded hover:bg-cyan-500/20 transition cursor-pointer"
              title="Edit Task Name"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Quick Task List & Switcher */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 px-1">
          <span>Study Tasks & Goals</span>
          <span className="text-[11px] text-slate-500 font-normal">
            {tasks.filter((t) => t.completed).length} / {tasks.length} done
          </span>
        </div>

        {/* Task Items */}
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {tasks.map((task) => {
            const isActive = task.name.toLowerCase() === activeTaskName.toLowerCase();
            return (
              <div
                key={task.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-cyan-950/30 border-cyan-500/40 shadow-sm'
                    : 'bg-[#08152c]/70 border-sky-500/10 hover:border-sky-500/25'
                }`}
              >
                {/* Complete checkbox */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggleTaskComplete(task.id)}
                    className="text-slate-400 hover:text-cyan-400 transition cursor-pointer shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div 
                    onClick={() => onSelectActiveTask(task.name)}
                    className="truncate cursor-pointer flex-1"
                    title="Click to set as current focus task"
                  >
                    <span className={`text-xs block truncate ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-200 font-medium'
                    }`}>
                      {task.name}
                    </span>
                    {task.subject && (
                      <span className="text-[10px] text-sky-400/70 font-normal block">
                        {task.subject}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge & Delete */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {isActive ? (
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 rounded-full border border-cyan-500/30">
                      Active
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectActiveTask(task.name)}
                      className="text-[10px] text-slate-400 hover:text-cyan-300 hover:underline cursor-pointer"
                    >
                      Focus
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Task Input Form */}
        <form onSubmit={handleCreateTask} className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="Add new study assignment or exam prep..."
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-[#061022] border border-sky-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1 transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
};
