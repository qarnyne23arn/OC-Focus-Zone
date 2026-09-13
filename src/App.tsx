import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  BarChart2, 
  ChevronDown, 
  Shield, 
  ShieldAlert,
  ShieldCheck,
  Cloud, 
  History, 
  Plus, 
  Sparkles, 
  CheckCircle,
  WifiOff,
  Sliders,
  BookOpen,
  Edit2,
  Check,
  Laptop,
  Flame,
  Target,
  Maximize2,
  Minimize2,
  AlertOctagon,
  Headphones,
  Zap,
  Tag
} from 'lucide-react';
import { 
  TimerMode, 
  StudySession, 
  BlockedWebsite, 
  SessionSnapshot, 
  CloudSyncState,
  MilestoneAlert,
  TaskItem,
  SessionReflection
} from './types';
import { 
  loadLocalSessions, 
  saveLocalSessions, 
  loadLocalSettings, 
  saveLocalSettings,
  loadLocalBlockedSites,
  saveLocalBlockedSites,
  loadLocalTasks,
  saveLocalTasks,
  loadSyncCode,
  saveSyncCode,
  loadSessionSnapshot,
  saveSessionSnapshot,
  queueOfflineSession,
  getOfflineQueue,
  clearOfflineQueue,
  getTodayDateString,
  getInitialSeedSessions,
  DEFAULT_TASKS,
  DEFAULT_BLOCKED_SITES,
  DEFAULT_SETTINGS,
  loadLocalReflections,
  saveLocalReflections,
  performSystemReset
} from './utils/storage';
import { 
  playStartChime, 
  playToggleTick, 
  playCompletionFanfare, 
  playMilestoneChime 
} from './utils/audio';
import { CircularTimer } from './components/CircularTimer';
import { ProductivityChart } from './components/ProductivityChart';
import { GoalProgressBar } from './components/GoalProgressBar';
import { WebsiteBlocker } from './components/WebsiteBlocker';
import { BlockedSiteModal } from './components/BlockedSiteModal';
import { ExtendRestoreModal } from './components/ExtendRestoreModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { StatsModal } from './components/StatsModal';
import { NotificationToast } from './components/NotificationToast';
import { TaskManager } from './components/TaskManager';
import { AmbientSoundPlayer } from './components/AmbientSoundPlayer';
import { ReflectionModal } from './components/ReflectionModal';
import { AntiCheatModal } from './components/AntiCheatModal';
import { SystemResetModal } from './components/SystemResetModal';
import { ZenSanctuaryModal } from './components/ZenSanctuaryModal';
import { MiniFloatingTimer } from './components/MiniFloatingTimer';
import { FocusProtocolsCard } from './components/FocusProtocolsCard';
import { FocusProtocol } from './types';

export default function App() {
  // Persistence state
  const [sessions, setSessions] = useState<StudySession[]>(loadLocalSessions);
  const [settings, setSettings] = useState(loadLocalSettings);
  const [blockedSites, setBlockedSites] = useState<BlockedWebsite[]>(loadLocalBlockedSites);
  const [tasks, setTasks] = useState<TaskItem[]>(loadLocalTasks);
  const [syncCode, setSyncCode] = useState<string>(loadSyncCode);

  // Active task name (explicitly requested: Algorithms & Data Structures -> editable)
  const [activeTaskName, setActiveTaskName] = useState<string>('Algorithms & Data Structures');
  const [isEditingTaskInline, setIsEditingTaskInline] = useState<boolean>(false);
  const [tempTaskName, setTempTaskName] = useState<string>('Algorithms & Data Structures');

  // Timer state
  const [mode, setMode] = useState<TimerMode>('focus');
  // Initialize to 45 minutes (45 * 60 = 2700 seconds)
  const [totalSeconds, setTotalSeconds] = useState<number>(settings.focusDurationMinutes * 60 || 45 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(settings.focusDurationMinutes * 60 || 45 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // UI Modals & Popups
  const [dateFilter, setDateFilter] = useState<'Today' | 'Yesterday' | 'This Week'>('Today');
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [showBlockerModal, setShowBlockerModal] = useState<boolean>(false);
  const [showExtendRestoreModal, setShowExtendRestoreModal] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [simulatedBlockedDomain, setSimulatedBlockedDomain] = useState<string | null>(null);

  // Right column tab for PC webpage view (Consolidated 3 Views: workspace, insights, protocols_shield)
  type DesktopTab = 'workspace' | 'insights' | 'protocols_shield';
  const [desktopTab, setDesktopTab] = useState<DesktopTab>('workspace');

  // New Requested Feature States
  const [isClockExpanded, setIsClockExpanded] = useState<boolean>(false);
  const [showZenSanctuary, setShowZenSanctuary] = useState<boolean>(false);
  const [showSystemResetModal, setShowSystemResetModal] = useState<boolean>(false);
  const [showReflectionModal, setShowReflectionModal] = useState<boolean>(false);
  const [reflections, setReflections] = useState<SessionReflection[]>(loadLocalReflections);
  const [strictAntiCheatMode, setStrictAntiCheatMode] = useState<boolean>(true);
  const [showAntiCheatModal, setShowAntiCheatModal] = useState<boolean>(false);
  const [strayDurationSeconds, setStrayDurationSeconds] = useState<number>(0);
  const [totalViolationsCount, setTotalViolationsCount] = useState<number>(0);
  const strayStartTimeRef = useRef<number | null>(null);

  // Stats & Distraction counters
  const [distractionCount, setDistractionCount] = useState<number>(14);
  const [alerts, setAlerts] = useState<MilestoneAlert[]>([]);
  const [savedSnapshot, setSavedSnapshot] = useState<SessionSnapshot | null>(loadSessionSnapshot);

  // Cloud Sync & Offline State
  const [syncState, setSyncState] = useState<CloudSyncState>({
    syncCode: loadSyncCode(),
    lastSyncedAt: new Date().toISOString(),
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    hasUnsavedChanges: false,
    connectedDevices: [
      { id: '1', name: 'PC / Desktop Workstation', platform: 'desktop', lastActive: 'Active Now', isCurrent: true },
      { id: '2', name: 'iPhone 15 Pro', platform: 'mobile', lastActive: 'Synced 10m ago', isCurrent: false },
    ],
  });
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(() => getOfflineQueue().length);

  // Ref for timer interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);

  // Calculate metrics for Today matching the image
  const todayStr = getTodayDateString();
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const todayFocusMinutes = todaySessions.reduce((acc, curr) => acc + curr.actualMinutes, 0);
  const todaySessionCount = todaySessions.length;

  // Add notification helper
  const addAlert = useCallback((title: string, message: string, type: MilestoneAlert['type']) => {
    const newAlert: MilestoneAlert = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: Date.now(),
    };
    setAlerts((prev) => [...prev, newAlert]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== newAlert.id));
    }, 5000);
  }, []);

  // Save tasks and sessions locally
  useEffect(() => {
    saveLocalSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveLocalTasks(tasks);
  }, [tasks]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setSyncState((prev) => ({ ...prev, isOnline: true }));
      addAlert('Network Restored', 'Back online! Syncing cached sessions to the cloud...', 'milestone');
      flushOfflineQueue();
    };

    const handleOffline = () => {
      setSyncState((prev) => ({ ...prev, isOnline: false }));
      addAlert('Offline Mode Active', 'No internet connection. All study data safely cached locally.', 'milestone');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addAlert]);

  // PC Keyboard Shortcuts (Space = Play/Pause, R = Reset, E = Extend +5m, F = Zen Sanctuary)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';
      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleTimer();
      } else if (e.key === 'r' || e.key === 'R') {
        handleReset();
      } else if (e.key === 'e' || e.key === 'E') {
        handleExtend(5);
      } else if (e.key === 'f' || e.key === 'F') {
        setShowZenSanctuary((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Anti-Cheat: Visibility Change & Window Blur Listener (Strict Study Mode)
  useEffect(() => {
    if (!strictAntiCheatMode) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isRunning && mode === 'focus' && !strayStartTimeRef.current) {
          strayStartTimeRef.current = Date.now();
        }
      } else {
        if (strayStartTimeRef.current) {
          const elapsed = Math.max(1, Math.round((Date.now() - strayStartTimeRef.current) / 1000));
          strayStartTimeRef.current = null;
          setStrayDurationSeconds(elapsed);
          setTotalViolationsCount((prev) => prev + 1);
          setDistractionCount((prev) => prev + 1);
          setShowAntiCheatModal(true);
          addAlert('Anti-Cheat Warning', `Study sanctuary lost for ${elapsed}s! Stay focused.`, 'anti_cheat');
        }
      }
    };

    const handleWindowBlur = () => {
      if (isRunning && mode === 'focus' && !strayStartTimeRef.current) {
        strayStartTimeRef.current = Date.now();
      }
    };

    const handleWindowFocus = () => {
      if (strayStartTimeRef.current) {
        const elapsed = Math.max(1, Math.round((Date.now() - strayStartTimeRef.current) / 1000));
        strayStartTimeRef.current = null;
        setStrayDurationSeconds(elapsed);
        setTotalViolationsCount((prev) => prev + 1);
        setDistractionCount((prev) => prev + 1);
        setShowAntiCheatModal(true);
        addAlert('Anti-Cheat Warning', `Study sanctuary lost for ${elapsed}s! Stay focused.`, 'anti_cheat');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [strictAntiCheatMode, isRunning, mode, addAlert]);

  // Flush offline queue to server
  const flushOfflineQueue = useCallback(async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true }));
      await fetch(`/api/sync/${syncCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            sessions,
            settings,
            blockedSites,
            tasks,
          },
        }),
      });
      clearOfflineQueue();
      setOfflineQueueCount(0);
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
      }));
    } catch {
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [sessions, settings, blockedSites, tasks, syncCode]);

  // Force Cloud Sync Push
  const handleTriggerSync = async () => {
    if (!syncState.isOnline) {
      addAlert('Offline', 'Cannot sync with cloud while offline. Saved locally.', 'milestone');
      return;
    }

    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true }));
      const res = await fetch(`/api/sync/${syncCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            sessions,
            settings,
            blockedSites,
            tasks,
            activeTaskName,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSyncState((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncedAt: new Date().toISOString(),
        }));
        addAlert('Cloud Synced', 'Your focus stats are synchronized across all devices.', 'milestone');
      }
    } catch {
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
      addAlert('Sync Error', 'Failed to reach cloud endpoint. Using local storage.', 'milestone');
    }
  };

  // Sync Code Change
  const handleUpdateSyncCode = async (newCode: string) => {
    setSyncCode(newCode);
    saveSyncCode(newCode);
    setSyncState((prev) => ({ ...prev, syncCode: newCode }));

    if (syncState.isOnline) {
      try {
        const res = await fetch(`/api/sync/${newCode}`);
        const json = await res.json();
        if (json.success && json.exists && json.data) {
          if (json.data.sessions) setSessions(json.data.sessions);
          if (json.data.settings) setSettings(json.data.settings);
          if (json.data.blockedSites) setBlockedSites(json.data.blockedSites);
          if (json.data.tasks) setTasks(json.data.tasks);
          addAlert('Device Paired', `Pulled workspace data for ${newCode}!`, 'milestone');
        }
      } catch {
        // Ignore
      }
    }
  };

  // Session completion handler
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    playCompletionFanfare();

    const elapsedMins = Math.max(1, Math.round((totalSeconds - remainingSeconds) / 60));
    const newSession: StudySession = {
      id: 'session-' + Date.now(),
      mode,
      subject: activeTaskName,
      durationMinutes: Math.round(totalSeconds / 60),
      actualMinutes: elapsedMins,
      completed: true,
      timestamp: new Date().toISOString(),
      date: getTodayDateString(),
      hour: new Date().getHours(),
    };

    setSessions((prev) => [newSession, ...prev]);

    // Update pomodoros on active task
    setTasks((prev) =>
      prev.map((t) =>
        t.name.toLowerCase() === activeTaskName.toLowerCase()
          ? { ...t, pomodorosLogged: t.pomodorosLogged + 1 }
          : t
      )
    );

    // Handle offline queue
    if (!navigator.onLine) {
      queueOfflineSession(newSession);
      setOfflineQueueCount(getOfflineQueue().length);
    }

    addAlert(
      '🎉 Focus Session Completed!',
      `Great job! You completed ${elapsedMins} minutes of study on "${activeTaskName}".`,
      'session_finished'
    );

    // Prompt Study Session Reflection & Energy Journaling
    if (mode === 'focus') {
      setTimeout(() => {
        setShowReflectionModal(true);
      }, 700);
    }

    // Auto prompt break
    if (mode === 'focus') {
      setTimeout(() => {
        setMode('short_break');
        setTotalSeconds(settings.shortBreakMinutes * 60);
        setRemainingSeconds(settings.shortBreakMinutes * 60);
        addAlert('Break Time', 'Rest your eyes, hydrate, and relax for 5 minutes.', 'milestone');
      }, 1500);
    }
  }, [totalSeconds, remainingSeconds, mode, activeTaskName, settings.shortBreakMinutes, addAlert]);

  // Main Timer Interval Loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSessionComplete();
            return 0;
          }

          // Check for 25-minute milestone
          const elapsed = totalSeconds - prev;
          if (elapsed === 25 * 60 && mode === 'focus') {
            playMilestoneChime();
            addAlert('🏆 25-Minute Flow Milestone', 'Quarter-hour milestone reached! You are locked in.', 'milestone');
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, totalSeconds, mode, handleSessionComplete, addAlert]);

  // Toggle Start / Pause
  const handleToggleTimer = () => {
    playToggleTick();
    if (!isRunning) {
      playStartChime();
      sessionStartTimeRef.current = Date.now();
      setIsRunning(true);
      const snapshot: SessionSnapshot = {
        remainingSeconds,
        totalSeconds,
        mode,
        subject: activeTaskName,
        elapsedSeconds: totalSeconds - remainingSeconds,
        timestamp: Date.now(),
      };
      setSavedSnapshot(snapshot);
      saveSessionSnapshot(snapshot);
    } else {
      setIsRunning(false);
      const snapshot: SessionSnapshot = {
        remainingSeconds,
        totalSeconds,
        mode,
        subject: activeTaskName,
        elapsedSeconds: totalSeconds - remainingSeconds,
        timestamp: Date.now(),
      };
      setSavedSnapshot(snapshot);
      saveSessionSnapshot(snapshot);
    }
  };

  // Reset Timer
  const handleReset = () => {
    playToggleTick();
    if (remainingSeconds < totalSeconds) {
      const snapshot: SessionSnapshot = {
        remainingSeconds,
        totalSeconds,
        mode,
        subject: activeTaskName,
        elapsedSeconds: totalSeconds - remainingSeconds,
        timestamp: Date.now(),
      };
      setSavedSnapshot(snapshot);
      saveSessionSnapshot(snapshot);
    }

    setIsRunning(false);
    let defaultTime = settings.focusDurationMinutes * 60;
    if (mode === 'short_break') defaultTime = settings.shortBreakMinutes * 60;
    if (mode === 'long_break') defaultTime = settings.longBreakMinutes * 60;

    setTotalSeconds(defaultTime);
    setRemainingSeconds(defaultTime);
  };

  // Set Timer Time by Yourself (requested by user)
  const handleSetCustomDuration = (minutes: number) => {
    playToggleTick();
    setIsRunning(false);
    const secs = minutes * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);

    if (mode === 'focus') {
      const updatedSettings = { ...settings, focusDurationMinutes: minutes };
      setSettings(updatedSettings);
      saveLocalSettings(updatedSettings);
    }

    addAlert('Timer Adjusted', `Duration set to ${minutes} minutes. Ready to start!`, 'milestone');
  };

  // Switch Modes (Focus / Short Break / Long Break)
  const handleSwitchMode = (newMode: TimerMode) => {
    playToggleTick();
    setIsRunning(false);
    setMode(newMode);

    let secs = settings.focusDurationMinutes * 60;
    if (newMode === 'short_break') secs = settings.shortBreakMinutes * 60;
    if (newMode === 'long_break') secs = settings.longBreakMinutes * 60;

    setTotalSeconds(secs);
    setRemainingSeconds(secs);
  };

  // Extend Mode (+5m, +10m, +15m)
  const handleExtend = (extraMinutes: number) => {
    playMilestoneChime();
    const addSecs = extraMinutes * 60;
    setTotalSeconds((prev) => prev + addSecs);
    setRemainingSeconds((prev) => prev + addSecs);
    addAlert(
      '⚡ Flow State Extended',
      `Added +${extraMinutes} minutes to your active session. Keep focused!`,
      'milestone'
    );
  };

  // Restore Mode
  const handleRestore = () => {
    if (!savedSnapshot) return;
    playToggleTick();
    setMode(savedSnapshot.mode);
    setTotalSeconds(savedSnapshot.totalSeconds);
    setRemainingSeconds(savedSnapshot.remainingSeconds);
    setActiveTaskName(savedSnapshot.subject);
    setIsRunning(false);
    addAlert(
      '↺ Session Restored',
      `Restored previous session (${Math.floor(savedSnapshot.remainingSeconds / 60)}m remaining).`,
      'milestone'
    );
  };

  // Save Inline Task Name
  const handleSaveInlineTask = () => {
    if (tempTaskName.trim()) {
      setActiveTaskName(tempTaskName.trim());
      // Also add or update in tasks list
      if (!tasks.some((t) => t.name.toLowerCase() === tempTaskName.trim().toLowerCase())) {
        const newTask: TaskItem = {
          id: 'task-' + Date.now(),
          name: tempTaskName.trim(),
          completed: false,
          pomodorosLogged: 0,
          pomodorosTarget: 4,
          subject: 'Academic Study',
        };
        setTasks((prev) => [newTask, ...prev]);
      }
    }
    setIsEditingTaskInline(false);
  };

  // Task List Handlers
  const handleAddTask = (name: string, targetPomodoros = 4) => {
    const newTask: TaskItem = {
      id: 'task-' + Date.now(),
      name,
      completed: false,
      pomodorosLogged: 0,
      pomodorosTarget: targetPomodoros,
      subject: 'General Study',
    };
    setTasks((prev) => [newTask, ...prev]);
    setActiveTaskName(name);
    addAlert('Task Added', `"${name}" is now your active study task!`, 'milestone');
  };

  const handleToggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Website Blocker Actions
  const handleToggleBlockedSite = (id: string) => {
    const updated = blockedSites.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setBlockedSites(updated);
    saveLocalBlockedSites(updated);
  };

  const handleAddBlockedSite = (domain: string, name: string) => {
    const newSite: BlockedWebsite = {
      id: 'site-' + Date.now(),
      domain,
      name,
      category: 'custom',
      enabled: true,
    };
    const updated = [newSite, ...blockedSites];
    setBlockedSites(updated);
    saveLocalBlockedSites(updated);
    addAlert('Shield Updated', `Added ${domain} to blocked websites list.`, 'milestone');
  };

  const handleRemoveBlockedSite = (id: string) => {
    const updated = blockedSites.filter((s) => s.id !== id);
    setBlockedSites(updated);
    saveLocalBlockedSites(updated);
  };

  const handleSimulateBlock = (domain: string) => {
    setDistractionCount((prev) => prev + 1);
    setSimulatedBlockedDomain(domain);
  };

  // Full System Reset Handler
  const handleConfirmSystemReset = () => {
    performSystemReset();
    setSessions([]);
    setTasks(DEFAULT_TASKS);
    setBlockedSites(DEFAULT_BLOCKED_SITES);
    setSettings(DEFAULT_SETTINGS);
    setActiveTaskName('Algorithms & Data Structures');
    setTotalSeconds(45 * 60);
    setRemainingSeconds(45 * 60);
    setIsRunning(false);
    setMode('focus');
    setDistractionCount(0);
    setTotalViolationsCount(0);
    setIsClockExpanded(false);
    setReflections([]);
    setSavedSnapshot(null);
    addAlert('System Reset Complete', 'All study data, tasks, and settings restored to factory defaults.', 'milestone');
  };

  // Save Session Reflection
  const handleSaveReflection = (newRef: Omit<SessionReflection, 'id' | 'timestamp'>) => {
    const reflection: SessionReflection = {
      ...newRef,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };
    const updated = [reflection, ...reflections];
    setReflections(updated);
    saveLocalReflections(updated);
    addAlert('Reflection Recorded', `Energy rating ${reflection.energyLevel}/5 saved for "${reflection.taskName}"`, 'milestone');
  };

  // 1-Click Science-Backed Focus Protocol Activation
  const handleSelectProtocol = (proto: FocusProtocol) => {
    setIsRunning(false);
    setSettings((prev) => ({
      ...prev,
      focusDurationMinutes: proto.focusMinutes,
      shortBreakMinutes: proto.breakMinutes,
    }));
    setTotalSeconds(proto.focusMinutes * 60);
    setRemainingSeconds(proto.focusMinutes * 60);
    setMode('focus');
    addAlert(
      `${proto.name} Activated`,
      `${proto.focusMinutes}m Focus + ${proto.breakMinutes}m Break. ${proto.description}`,
      'milestone'
    );
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-start p-3 sm:p-6 lg:p-8 relative overflow-x-hidden font-['Plus_Jakarta_Sans'] selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Atmospheric Obsidian Deep Space Ambient Glows */}
      <div className="fixed top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-gradient-to-b from-sky-600/10 via-cyan-700/5 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-[550px] h-[550px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.12] pointer-events-none" />

      {/* Top PC Webpage Header & Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto mb-5 p-3.5 sm:p-4 rounded-3xl bg-[#061022]/85 border border-sky-500/20 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.7)]">
        {/* Brand: Just the clean name 'OC' (No logo image) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-lg tracking-wider font-['Plus_Jakarta_Sans'] shadow-[0_0_20px_rgba(6,182,212,0.35)] border border-cyan-300/40 select-none">
            OC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-lg sm:text-xl tracking-wider font-['Plus_Jakarta_Sans']">
                OC
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                Focus Sanctuary
              </span>
            </div>
            <p className="text-[11px] text-sky-200/60 hidden sm:block">
              Deep study timer with anti-cheat & distraction shield
            </p>
          </div>
        </div>

        {/* Center Task Pill (Enter Task - Editable) */}
        {isEditingTaskInline ? (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-[#061022] border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-cyan-300 text-xs font-semibold shrink-0">Enter Task:</span>
            <input
              type="text"
              value={tempTaskName}
              onChange={(e) => setTempTaskName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveInlineTask();
                if (e.key === 'Escape') setIsEditingTaskInline(false);
              }}
              placeholder="Enter task name..."
              className="bg-transparent text-xs text-white font-semibold focus:outline-none w-44"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSaveInlineTask}
              className="p-1 rounded bg-cyan-500 hover:bg-cyan-400 text-white text-[10px] font-bold cursor-pointer"
              title="Save task"
            >
              <Check className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => {
              setTempTaskName(activeTaskName);
              setIsEditingTaskInline(true);
            }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#061022] hover:bg-[#0b1c3a] border border-sky-500/20 hover:border-cyan-400/50 text-xs cursor-pointer transition shadow-sm group"
            title="Click to enter or change study task"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-slate-400">Enter Task:</span>
            <span className="font-bold text-white truncate max-w-[200px] group-hover:text-cyan-200 transition">
              {activeTaskName || 'Enter task...'}
            </span>
            <Edit2 className="w-3 h-3 text-cyan-400 opacity-60 group-hover:opacity-100 transition" />
          </div>
        )}

        {/* Right Status Badges & Quick Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Zen Sanctuary Fullscreen Trigger */}
          <button
            type="button"
            onClick={() => setShowZenSanctuary(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-900/70 to-cyan-900/70 hover:from-sky-800 hover:to-cyan-800 border border-cyan-500/30 text-cyan-200 text-xs font-semibold cursor-pointer shadow-sm"
            title="Ambient Fullscreen Focus Mode (Zen Study Sanctuary) - Shortcut: F"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-[11px] hidden sm:inline">Zen Sanctuary (F)</span>
          </button>

          {/* Strict Mode / Focus Lock (Anti-Cheat) Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !strictAntiCheatMode;
              setStrictAntiCheatMode(next);
              addAlert(
                next ? 'Anti-Cheat Locked' : 'Anti-Cheat Disabled',
                next ? 'Tab strays will be recorded and penalized.' : 'Tab stray monitoring paused.',
                'anti_cheat'
              );
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              strictAntiCheatMode
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : 'bg-[#061022] border-sky-500/20 text-slate-400 hover:text-slate-200'
            }`}
            title="Strict Mode / Focus Lock: Detects when you leave study tab"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${strictAntiCheatMode ? 'text-rose-400' : 'text-slate-400'}`} />
            <span className="text-[11px] hidden sm:inline">
              Anti-Cheat: {strictAntiCheatMode ? 'Strict' : 'Off'}
            </span>
          </button>

          {/* System Reset Button */}
          <button
            type="button"
            onClick={() => setShowSystemResetModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#061022] hover:bg-rose-950/30 border border-sky-500/20 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-medium cursor-pointer transition"
            title="System Reset: Restore initial 47:00 study standard & reset settings"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[11px] hidden md:inline">System Reset</span>
          </button>

          {/* Cloud Sync Status */}
          <button
            type="button"
            onClick={() => setShowSyncModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#061022] border border-sky-500/20 text-sky-300 hover:text-white hover:border-cyan-400 transition cursor-pointer text-xs"
            title="Cloud Sync Across Devices"
          >
            {syncState.isOnline ? (
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="text-[11px] font-medium hidden lg:inline">
              {syncState.isOnline ? 'Cloud' : 'Offline'}
            </span>
          </button>

          {/* Website Blocker Shield */}
          <button
            type="button"
            onClick={() => setShowBlockerModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs transition cursor-pointer ${
              isRunning
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                : 'bg-[#061022] border-sky-500/20 text-slate-400 hover:text-sky-300'
            }`}
            title="Website Distraction Shield"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-medium hidden lg:inline">
              Shield: {isRunning ? 'Active' : 'Standby'}
            </span>
          </button>

          {/* Productivity Stats */}
          <button
            type="button"
            onClick={() => setShowStatsModal(true)}
            className="p-2 rounded-xl bg-[#061022] border border-sky-500/20 text-slate-400 hover:text-white hover:border-sky-500/40 transition cursor-pointer"
            title="Productivity Statistics & Performance Trends"
          >
            <BarChart2 className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Workflow Modes: Extend & Restore */}
          <button
            type="button"
            onClick={() => setShowExtendRestoreModal(true)}
            className="p-2 rounded-xl bg-[#061022] border border-sky-500/20 text-slate-400 hover:text-white hover:border-sky-500/40 transition cursor-pointer"
            title="Extend Flow / Restore Session"
          >
            <History className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Global System Reset Button */}
          <button
            type="button"
            onClick={() => setShowSystemResetModal(true)}
            className="p-2 rounded-xl bg-[#061022] border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:border-rose-500/50 transition cursor-pointer"
            title="System Reset (Restore all settings and data to factory default)"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </header>

      {/* Main PC Webpage Layout */}
      <div className={`w-full max-w-7xl mx-auto ${isClockExpanded ? 'flex flex-col items-center justify-center py-4' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start'} transition-all duration-300`}>
        
        {/* The Focus Time Card from image.png (Centered on page when expanded) */}
        <div className={`${isClockExpanded ? 'w-full max-w-[460px] flex flex-col items-center' : 'lg:col-span-5 flex flex-col items-center w-full'} transition-all duration-300`}>
          <main 
            id="focus-time-main-card"
            className={`w-full ${isClockExpanded ? 'max-w-[460px] shadow-[0_30px_90px_rgba(0,0,0,0.95)] border-cyan-500/35' : 'max-w-[440px] shadow-[0_25px_70px_rgba(0,0,0,0.85)] border-sky-500/20'} rounded-[2.5rem] bg-[#081326]/95 backdrop-blur-2xl border p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between transition-all duration-300`}
          >
            {/* Subtle internal gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-sky-500/10 via-transparent to-transparent pointer-events-none" />

            {/* 1. Header: Title & Subtitle + Expand/Restore Option & Date Dropdown */}
            <div className="flex items-start justify-between relative z-10 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight">
                    Focus Time
                  </h1>
                  {isClockExpanded && (
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                      Enlarged Clock
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-sky-200/60 mt-0.5 font-normal">
                  Stay consistent. See your progress.
                </p>
              </div>

              {/* Action Buttons: Expand / Restore & Date Filter */}
              <div className="flex items-center gap-2">
                {/* Expand / Restore Button */}
                <button
                  type="button"
                  onClick={() => setIsClockExpanded(!isClockExpanded)}
                  className="px-3 py-1.5 rounded-2xl bg-[#0d203e]/90 hover:bg-[#132d56] border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  title={isClockExpanded ? 'Restore clock to normal size' : 'Expand focus clock'}
                >
                  {isClockExpanded ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Restore Size</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Expand</span>
                    </>
                  )}
                </button>

                {/* "Today ⌵" Dropdown Pill Button */}
                <div className="relative">
                  <button
                    type="button"
                    id="period-dropdown-button"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="px-3 py-1.5 rounded-2xl bg-[#0d203e]/90 hover:bg-[#132d56] border border-sky-500/25 text-sky-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <span>{dateFilter}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                  </button>

                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-32 rounded-xl bg-[#091833] border border-sky-500/30 shadow-2xl py-1 z-30 text-xs text-slate-200">
                      {(['Today', 'Yesterday', 'This Week'] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => {
                            setDateFilter(filter);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-sky-500/20 flex items-center justify-between cursor-pointer ${
                            dateFilter === filter ? 'text-cyan-300 font-bold bg-sky-500/10' : ''
                          }`}
                        >
                          {filter}
                          {dateFilter === filter && <CheckCircle className="w-3 h-3 text-cyan-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Work & Break Quick Segmented Switcher */}
            <div className="my-3 flex items-center p-1 rounded-xl bg-[#061022] border border-sky-500/15 relative z-10">
              <button
                type="button"
                onClick={() => handleSwitchMode('focus')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  mode === 'focus'
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎯 Focus ({Math.floor(settings.focusDurationMinutes)}m)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('short_break')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  mode === 'short_break'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ☕ Break (5m)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('long_break')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  mode === 'long_break'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌴 Long (15m)
              </button>
            </div>

            {/* EDITABLE TASK NAME (Explicitly requested by user!) */}
            <div className="mb-2 relative z-10">
              {isEditingTaskInline ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#061022] border border-cyan-400">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <input
                    type="text"
                    value={tempTaskName}
                    onChange={(e) => setTempTaskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveInlineTask();
                      if (e.key === 'Escape') setIsEditingTaskInline(false);
                    }}
                    placeholder="Enter study task name..."
                    className="flex-1 bg-transparent text-xs text-white font-semibold focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveInlineTask}
                    className="p-1 rounded bg-cyan-500 hover:bg-cyan-400 text-white text-[10px] font-bold cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => {
                    setTempTaskName(activeTaskName);
                    setIsEditingTaskInline(true);
                  }}
                  className="flex items-center justify-center gap-1.5 text-xs text-sky-200 hover:text-white group cursor-pointer py-1 px-2 rounded-lg hover:bg-sky-500/10 transition"
                  title="Click to enter or edit task name"
                >
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-slate-400 text-xs font-medium">Enter Task:</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[240px] underline decoration-sky-500/40 decoration-dashed underline-offset-4 group-hover:text-cyan-200 transition">
                    {activeTaskName || 'Enter task...'}
                  </span>
                  <Edit2 className="w-3 h-3 text-cyan-400 opacity-60 group-hover:opacity-100 transition" />
                </div>
              )}
            </div>

            {/* 2. Prominent Circular Countdown Timer Dial (Exact Match to Image) */}
            <div className="my-1 relative z-10 flex justify-center">
              <CircularTimer
                remainingSeconds={remainingSeconds}
                totalSeconds={totalSeconds}
                isRunning={isRunning}
                mode={mode}
                onToggle={handleToggleTimer}
                onSetCustomDuration={handleSetCustomDuration}
                size={isClockExpanded ? 380 : 310}
                isExpanded={isClockExpanded}
                onToggleExpand={() => setIsClockExpanded(!isClockExpanded)}
                onEnterZenMode={() => setShowZenSanctuary(true)}
              />
            </div>

            {/* 3. Productivity Flow Graph with Live Data & Interactive Hours */}
            <div className="relative z-10">
              <ProductivityChart
                sessions={sessions}
                activeDateFilter={dateFilter}
              />
            </div>

            {/* 4. Action Buttons (Pause / Start & Reset - Exact Match) */}
            <div className="mt-5 grid grid-cols-2 gap-3 relative z-10">
              <button
                type="button"
                id="timer-primary-toggle-button"
                onClick={handleToggleTimer}
                className="py-3 px-6 rounded-full bg-gradient-to-r from-[#006aff] to-[#00b4ff] hover:from-[#0059e6] hover:to-[#009ee0] active:scale-[0.98] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(0,110,255,0.45)] transition-all cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="timer-reset-button"
                onClick={handleReset}
                className="py-3 px-6 rounded-full bg-[#0a1832]/90 hover:bg-[#0f244c] active:scale-[0.98] border border-[#1b3a69] hover:border-sky-500/40 text-sky-200 hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>

            {/* Quick Flow booster bar */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-sky-300/60 px-1 relative z-10">
              <button
                type="button"
                onClick={() => handleExtend(5)}
                className="hover:text-cyan-300 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-cyan-400" />
                +5m Extend
              </button>
              <button
                type="button"
                onClick={() => handleExtend(10)}
                className="hover:text-cyan-300 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-cyan-400" />
                +10m Extend
              </button>
              <button
                type="button"
                onClick={handleRestore}
                disabled={!savedSnapshot}
                className={`transition flex items-center gap-1 cursor-pointer ${
                  savedSnapshot ? 'hover:text-emerald-300 text-emerald-400/80' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <History className="w-3 h-3" />
                Restore Session
              </button>
            </div>

            {/* 5. Two Bottom Stats Cards (Exact Match to Image) */}
            <div className="mt-5 grid grid-cols-2 gap-3.5 relative z-10">
              {/* Focus Time Card */}
              <div 
                id="stat-card-focus-time"
                className="p-4 rounded-2xl bg-[#091833]/90 border border-sky-500/15 flex items-center gap-3.5 hover:border-sky-500/30 transition shadow-sm"
              >
                <div className="w-11 h-11 rounded-full bg-[#051a3a] border border-[#0d3b6f] flex items-center justify-center text-cyan-400 shrink-0">
                  <Clock className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-[11px] text-sky-300/70 font-medium">Focus Time</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
                    {todayFocusMinutes} min
                  </div>
                </div>
              </div>

              {/* Sessions Card */}
              <div 
                id="stat-card-sessions"
                className="p-4 rounded-2xl bg-[#091833]/90 border border-sky-500/15 flex items-center gap-3.5 hover:border-sky-500/30 transition shadow-sm"
              >
                <div className="w-11 h-11 rounded-full bg-[#051a3a] border border-[#0d3b6f] flex items-center justify-center text-cyan-400 shrink-0">
                  <BarChart2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-[11px] text-sky-300/70 font-medium">Sessions</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
                    {todaySessionCount}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Goal Progress Bar Component */}
            <div className="relative z-10">
              <GoalProgressBar
                currentMinutes={todayFocusMinutes}
                goalMinutes={settings.dailyGoalMinutes}
                remainingSeconds={remainingSeconds}
                totalSeconds={totalSeconds}
                isFocusMode={mode === 'focus'}
              />
            </div>
          </main>
        </div>

        {/* RIGHT COLUMN: PC Webpage Expansive Study Suite (Columns 6-12 on Desktop) */}
        {!isClockExpanded && (
          <div className="lg:col-span-7 flex flex-col gap-6 w-full animate-in fade-in duration-200">
          
          {/* CONSOLIDATED 3 CLEAN TABS SELECTOR */}
          <nav aria-label="Study Suite Views" className="p-1.5 rounded-2xl bg-[#081326]/90 border border-sky-500/20 backdrop-blur-xl grid grid-cols-3 gap-1.5 sm:gap-2 shadow-lg">
            <button
              type="button"
              onClick={() => setDesktopTab('workspace')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                desktopTab === 'workspace'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Workspace &</span> Tasks
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${desktopTab === 'workspace' ? 'bg-slate-950/20 text-slate-900 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                {tasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDesktopTab('insights')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                desktopTab === 'insights'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Insights &</span> Reflections
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${desktopTab === 'insights' ? 'bg-slate-950/20 text-slate-900 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                {reflections.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDesktopTab('protocols_shield')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                desktopTab === 'protocols_shield'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Protocols &</span> Shield
            </button>
          </nav>

          {/* PC Desktop Content Panel */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#081326]/90 border border-sky-500/20 backdrop-blur-2xl shadow-xl min-h-[480px] flex flex-col justify-between">
            
            {/* VIEW 1: Workspace & Tasks (Tasks + Flow Audio Visualizer) */}
            {desktopTab === 'workspace' && (
              <div className="space-y-6">
                {/* Academic Task List */}
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-sky-500/15">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        Academic Task List & Checklist
                      </h2>
                      <p className="text-[11px] text-sky-200/60 mt-0.5">
                        Select any task to set it as active focus task, or edit directly.
                      </p>
                    </div>
                    <span className="text-[11px] text-cyan-300 font-mono bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                      Active: {activeTaskName}
                    </span>
                  </div>

                  <TaskManager
                    tasks={tasks}
                    activeTaskName={activeTaskName}
                    onSelectActiveTask={(name) => {
                      setActiveTaskName(name);
                      addAlert('Active Task Changed', `Switched focus to "${name}"`, 'milestone');
                    }}
                    onUpdateActiveTaskName={(newName) => {
                      setActiveTaskName(newName);
                      setTasks((prev) =>
                        prev.map((t) =>
                          t.name.toLowerCase() === activeTaskName.toLowerCase()
                            ? { ...t, name: newName }
                            : t
                        )
                      );
                      addAlert('Task Renamed', `Task name updated to "${newName}"`, 'milestone');
                    }}
                    onAddTask={handleAddTask}
                    onToggleTaskComplete={handleToggleTaskComplete}
                    onDeleteTask={handleDeleteTask}
                  />
                </div>

                {/* Embedded Ambient Sound Engine & Wave Visualizer */}
                <div className="pt-3 border-t border-sky-500/15">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-cyan-400" />
                        Ambient Audio & Binaural Soundscape
                      </h3>
                      <p className="text-[11px] text-sky-200/60 mt-0.5">
                        Binaural beats, ambient noise layers, or insert custom audio streams with live visualizer.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowZenSanctuary(true)}
                      className="px-2.5 py-1 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Zen Mode</span>
                    </button>
                  </div>

                  <AmbientSoundPlayer isTimerRunning={isRunning} compact={true} />
                </div>
              </div>
            )}

            {/* VIEW 2: Insights & Reflections (Hourly Chart + Metrics + Energy Journal) */}
            {desktopTab === 'insights' && (
              <div className="space-y-5">
                {/* Summary Metric Badges */}
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#061022] border border-sky-500/15 text-center">
                    <div className="text-[10px] text-sky-300/70 font-semibold">Today's Focus</div>
                    <div className="text-xl font-bold text-white font-mono mt-0.5">
                      {todayFocusMinutes}<span className="text-xs text-sky-400 font-normal">m</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#061022] border border-sky-500/15 text-center">
                    <div className="text-[10px] text-sky-300/70 font-semibold">Sessions</div>
                    <div className="text-xl font-bold text-white font-mono mt-0.5">
                      {todaySessionCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#061022] border border-sky-500/15 text-center">
                    <div className="text-[10px] text-sky-300/70 font-semibold">Shielded Blocks</div>
                    <div className="text-xl font-bold text-cyan-300 font-mono mt-0.5">
                      {distractionCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#061022] border border-sky-500/15 text-center">
                    <div className="text-[10px] text-sky-300/70 font-semibold">Reflections</div>
                    <div className="text-xl font-bold text-emerald-300 font-mono mt-0.5">
                      {reflections.length}
                    </div>
                  </div>
                </div>

                {/* Hourly Productivity Wave Visualizer (Redesigned) */}
                <div className="p-4 rounded-2xl bg-[#061022] border border-sky-500/15">
                  <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                      Hourly Chronotype Productivity Wave
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowStatsModal(true)}
                      className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                    >
                      Detailed Analytics →
                    </button>
                  </div>
                  <ProductivityChart
                    sessions={sessions}
                    activeDateFilter={dateFilter}
                  />
                </div>

                {/* Energy Journaling & Session Reflections */}
                <div className="pt-2">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-sky-500/15">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        Session Reflections & Energy Journal
                      </h3>
                      <p className="text-[10px] text-sky-200/60">
                        Subjective energy ratings (1-5), accomplishments, and study notes.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowReflectionModal(true)}
                      className="px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>Log Reflection</span>
                    </button>
                  </div>

                  {reflections.length === 0 ? (
                    <div className="text-center py-6 rounded-2xl bg-[#061022] border border-sky-500/15 space-y-1.5">
                      <Sparkles className="w-6 h-6 text-cyan-400/50 mx-auto" />
                      <p className="text-xs font-semibold text-white">No reflections recorded yet</p>
                      <p className="text-[10px] text-slate-400 max-w-sm mx-auto">
                        Complete a focus session or click "Log Reflection" to log mental focus and energy metrics.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {reflections.map((ref) => (
                        <div
                          key={ref.id}
                          className="p-3 rounded-xl bg-[#061022] border border-sky-500/20 hover:border-cyan-500/40 transition text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs flex items-center gap-1.5">
                              <BookOpen className="w-3 h-3 text-cyan-400" />
                              {ref.taskName}
                            </span>
                            <div className="flex items-center gap-1 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30 text-cyan-300 font-bold text-[10px]">
                              <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              <span>Energy: {ref.energyLevel}/5</span>
                            </div>
                          </div>
                          {ref.notes && (
                            <p className="text-slate-300 bg-[#040914] p-2 rounded-lg border border-slate-800 text-[10px] leading-relaxed">
                              {ref.notes}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-[9px] text-slate-500">
                            <div className="flex items-center gap-1">
                              {ref.tags?.map((tag) => (
                                <span key={tag} className="px-1.5 py-0.2 rounded-full bg-slate-800 text-sky-300 font-mono">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <span>
                              {new Date(ref.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {ref.durationMinutes}m
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 3: Protocols & Shield (Science Protocols + Custom Slider + Website Blocker + Anti-Cheat) */}
            {desktopTab === 'protocols_shield' && (
              <div className="space-y-5">
                {/* 1-Click Science Protocols */}
                <FocusProtocolsCard
                  currentFocusMinutes={Math.floor(totalSeconds / 60)}
                  onSelectProtocol={handleSelectProtocol}
                />

                {/* Custom Duration Slider */}
                <div className="p-4 rounded-2xl bg-[#061022] border border-sky-500/15 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-bold flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      Custom Duration Slider
                    </span>
                    <span className="text-cyan-400 font-bold font-mono text-sm">
                      {Math.floor(totalSeconds / 60)} minutes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={Math.floor(totalSeconds / 60)}
                    onChange={(e) => handleSetCustomDuration(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>5m</span>
                    <span>25m (Pomodoro)</span>
                    <span>50m (OC)</span>
                    <span>90m (Ultradian)</span>
                    <span>120m</span>
                  </div>
                </div>

                {/* Student Distraction Shield & Anti-Cheat */}
                <div className="p-4 rounded-2xl bg-[#061022] border border-sky-500/15 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-sky-500/15">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-cyan-400" />
                        Student Distraction Shield & Focus Lock
                      </h3>
                      <p className="text-[10px] text-sky-200/60 mt-0.5">
                        Blocks distracting websites and logs tab switches while studying.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSimulateBlock('youtube.com')}
                      className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-semibold cursor-pointer"
                    >
                      Test Shield
                    </button>
                  </div>

                  <WebsiteBlocker
                    blockedSites={blockedSites}
                    onToggleSite={handleToggleBlockedSite}
                    onAddSite={handleAddBlockedSite}
                    onRemoveSite={handleRemoveBlockedSite}
                    isTimerRunning={isRunning && mode === 'focus'}
                    onSimulateBlock={handleSimulateBlock}
                    distractionCount={distractionCount}
                  />
                </div>
              </div>
            )}

            {/* Desktop PC Footer Bar with Shortcuts */}
            <div className="pt-4 border-t border-sky-500/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400 mt-4">
              <div className="flex items-center gap-3">
                <span>PC Keyboard Shortcuts:</span>
                <span className="font-mono bg-[#061022] border border-sky-500/20 px-1.5 py-0.5 rounded text-sky-300">Space</span> Play/Pause
                <span className="font-mono bg-[#061022] border border-sky-500/20 px-1.5 py-0.5 rounded text-sky-300">R</span> Reset
                <span className="font-mono bg-[#061022] border border-sky-500/20 px-1.5 py-0.5 rounded text-sky-300">E</span> +5m
              </div>
              <span className="text-slate-500">Auto-saved to local offline storage & cloud</span>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Modals & Overlays */}
      {/* 1. Website Blocker Modal */}
      {showBlockerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#08152c] border border-sky-500/25 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-sky-500/15">
              <div className="flex items-center gap-2 font-bold text-white text-base">
                <Shield className="w-5 h-5 text-cyan-400" />
                Student Distraction Blocker
              </div>
              <button
                onClick={() => setShowBlockerModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="mt-4">
              <WebsiteBlocker
                blockedSites={blockedSites}
                onToggleSite={handleToggleBlockedSite}
                onAddSite={handleAddBlockedSite}
                onRemoveSite={handleRemoveBlockedSite}
                isTimerRunning={isRunning && mode === 'focus'}
                onSimulateBlock={handleSimulateBlock}
                distractionCount={distractionCount}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Interactive Blocked Site Screen Simulator */}
      <BlockedSiteModal
        isOpen={Boolean(simulatedBlockedDomain)}
        domain={simulatedBlockedDomain || ''}
        remainingSeconds={remainingSeconds}
        onClose={() => setSimulatedBlockedDomain(null)}
        onEmergencyBypass={() => {
          setSimulatedBlockedDomain(null);
          addAlert('60s Bypass Activated', 'Remember to return to your study material after checking.', 'milestone');
        }}
      />

      {/* 3. Extend and Restore Mode Modal */}
      <ExtendRestoreModal
        isOpen={showExtendRestoreModal}
        onClose={() => setShowExtendRestoreModal(false)}
        onExtend={handleExtend}
        onRestore={handleRestore}
        hasSavedSnapshot={Boolean(savedSnapshot)}
        lastSnapshot={savedSnapshot}
        remainingSeconds={remainingSeconds}
      />

      {/* 4. Cross-Device Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        syncState={syncState}
        onTriggerSync={handleTriggerSync}
        onUpdateSyncCode={handleUpdateSyncCode}
        offlineQueueCount={offlineQueueCount}
      />

      {/* 5. Statistics & Productivity Dashboard Modal */}
      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        sessions={sessions}
        goalMinutes={settings.dailyGoalMinutes}
        distractionCount={distractionCount}
      />

      {/* 6. Milestone & Celebration Notification Toast */}
      <NotificationToast
        alerts={alerts}
        onDismiss={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
      />

      {/* 7. Ambient Fullscreen "Focus Mode" (Zen Study Sanctuary) */}
      <ZenSanctuaryModal
        isOpen={showZenSanctuary}
        onClose={() => setShowZenSanctuary(false)}
        remainingSeconds={remainingSeconds}
        totalSeconds={totalSeconds}
        isRunning={isRunning}
        mode={mode}
        activeTaskName={activeTaskName}
        onToggleTimer={handleToggleTimer}
        onReset={handleReset}
        onExtend={handleExtend}
        onSetCustomDuration={handleSetCustomDuration}
        strictAntiCheatMode={strictAntiCheatMode}
      />

      {/* 8. Strict Mode / Focus Lock (Anti-Cheat Protection Modal) */}
      <AntiCheatModal
        isOpen={showAntiCheatModal}
        onClose={() => setShowAntiCheatModal(false)}
        strayDurationSeconds={strayDurationSeconds}
        totalViolationsCount={totalViolationsCount}
        currentTaskName={activeTaskName}
      />

      {/* 9. Global System Reset Confirmation Modal */}
      <SystemResetModal
        isOpen={showSystemResetModal}
        onClose={() => setShowSystemResetModal(false)}
        onConfirmReset={handleConfirmSystemReset}
      />

      {/* 10. Study Session Reflection & Energy Journaling Modal */}
      <ReflectionModal
        isOpen={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
        taskName={activeTaskName}
        sessionDurationMinutes={Math.max(1, Math.round(totalSeconds / 60))}
        onSaveReflection={handleSaveReflection}
      />

      {/* 11. Mini Floating Picture-in-Picture Sticky Timer */}
      <MiniFloatingTimer
        remainingSeconds={remainingSeconds}
        totalSeconds={totalSeconds}
        isRunning={isRunning}
        mode={mode}
        activeTaskName={activeTaskName}
        onToggleTimer={handleToggleTimer}
        onExtend={handleExtend}
        onOpenZen={() => setShowZenSanctuary(true)}
      />
    </div>
  );
}
