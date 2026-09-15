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
  isLight?: boolean;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  activeTaskName,
  onSelectActiveTask,
  onUpdateActiveTaskName,
  onAddTask,
  onToggleTaskComplete,
  onDeleteTask,
  isLight = false,
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
    <div className={`w-full space-y-3.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
      {/* 1. Active Focus Task Card with Inline Edit */}
      <div className={`p-4 rounded-2xl border shadow-sm ${
        isLight
          ? 'bg-slate-50 border-slate-200'
          : 'bg-gradient-to-r from-[#091a38] to-[#071328] border-cyan-500/30'
      }`}>
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className={`flex items-center gap-1.5 font-bold uppercase tracking-wider ${
            isLight ? 'text-cyan-700' : 'text-cyan-400'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            Enter Task
          </span>
          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Click to edit</span>
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
              placeholder="Enter task name..."
              className={`flex-1 px-3 py-1.5 rounded-xl text-sm font-semibold focus:outline-none ${
                isLight
                  ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                  : 'bg-[#061022] border border-cyan-400 text-white placeholder-slate-500'
              }`}
              autoFocus
            />
            <button
              type="button"
              onClick={handleSaveActiveName}
              className="p-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer transition shadow-sm"
              title="Save Task Name"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => {
              setTempName(activeTaskName);
              setIsEditingActiveName(true);
            }}
            className={`flex items-center justify-between group cursor-pointer p-1 -m-1 rounded-lg transition ${
              isLight ? 'hover:bg-cyan-50' : 'hover:bg-sky-500/10'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className={`w-4 h-4 shrink-0 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
              <span className={`font-bold text-base truncate tracking-tight ${
                activeTaskName 
                  ? isLight ? 'text-slate-900' : 'text-white'
                  : isLight ? 'text-slate-400 italic' : 'text-slate-400 italic'
              }`}>
                {activeTaskName || 'Enter Task'}
              </span>
            </div>
            <button
              type="button"
              className={`opacity-70 group-hover:opacity-100 p-1 rounded transition cursor-pointer ${
                isLight ? 'text-cyan-700 hover:bg-cyan-100' : 'text-cyan-300 hover:bg-cyan-500/20'
              }`}
              title="Edit Task Name"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Quick Task List & Switcher */}
      <div className="space-y-2">
        <div className={`flex items-center justify-between text-xs font-semibold px-1 ${
          isLight ? 'text-slate-800' : 'text-slate-300'
        }`}>
          <span>Study Tasks & Goals</span>
          <span className={`text-[11px] font-normal ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            {tasks.filter((t) => t.completed).length} / {tasks.length} done
          </span>
        </div>

        {/* Task Items */}
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <div className={`p-4 rounded-xl border text-center text-xs ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-600'
                : 'bg-[#08152c]/50 border-sky-500/10 text-slate-400'
            }`}>
              No tasks added yet. Enter your task below to get started.
            </div>
          ) : (
            tasks.map((task) => {
              const isActive = activeTaskName && task.name.toLowerCase() === activeTaskName.toLowerCase();
              return (
                <div
                  key={task.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    isActive
                      ? isLight
                        ? 'bg-cyan-50 border-cyan-400 shadow-sm'
                        : 'bg-cyan-950/30 border-cyan-500/40 shadow-sm'
                      : isLight
                        ? 'bg-white border-slate-200 hover:border-slate-300'
                        : 'bg-[#08152c]/70 border-sky-500/10 hover:border-sky-500/25'
                  }`}
                >
                  {/* Complete checkbox */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleTaskComplete(task.id)}
                      className="text-slate-400 hover:text-cyan-500 transition cursor-pointer shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
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
                        task.completed 
                          ? 'line-through text-slate-400' 
                          : isLight ? 'text-slate-900 font-semibold' : 'text-slate-200 font-medium'
                      }`}>
                        {task.name}
                      </span>
                      {task.subject && (
                        <span className={`text-[10px] font-normal block ${
                          isLight ? 'text-sky-700' : 'text-sky-400/70'
                        }`}>
                          {task.subject}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge & Delete */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {isActive ? (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isLight
                          ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}>
                        Active
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectActiveTask(task.name)}
                        className={`text-[10px] hover:underline cursor-pointer ${
                          isLight ? 'text-cyan-700' : 'text-slate-400 hover:text-cyan-300'
                        }`}
                      >
                        Focus
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add New Task Input Form */}
        <form onSubmit={handleCreateTask} className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="Add new study assignment or exam prep..."
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            className={`flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-cyan-500 ${
              isLight
                ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                : 'bg-[#061022] border border-sky-500/20 text-white placeholder-slate-500'
            }`}
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
};
