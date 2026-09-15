export type TimerMode = 'focus' | 'short_break' | 'long_break';

export interface StudySession {
  id: string;
  mode: TimerMode;
  subject: string;
  durationMinutes: number; // Planned duration
  actualMinutes: number;   // Elapsed minutes
  completed: boolean;
  timestamp: string;       // ISO string
  date: string;            // YYYY-MM-DD
  hour: number;            // 0-23
}

export interface BlockedWebsite {
  id: string;
  domain: string;
  name: string;
  category: 'social' | 'video' | 'gaming' | 'shopping' | 'news' | 'custom';
  enabled: boolean;
}

export interface DailyGoal {
  targetMinutes: number;
  date: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  platform: 'desktop' | 'mobile' | 'tablet';
  lastActive: string;
  isCurrent: boolean;
}

export interface SessionSnapshot {
  remainingSeconds: number;
  totalSeconds: number;
  mode: TimerMode;
  subject: string;
  elapsedSeconds: number;
  timestamp: number;
}

export interface CloudSyncState {
  syncCode: string;
  lastSyncedAt: string | null;
  isOnline: boolean;
  isSyncing: boolean;
  hasUnsavedChanges: boolean;
  connectedDevices: DeviceInfo[];
}

export interface TaskItem {
  id: string;
  name: string;
  completed: boolean;
  pomodorosLogged: number;
  pomodorosTarget: number;
  subject?: string;
}

export interface ProductivityDataPoint {
  hour: number;
  label: string;
  minutes: number;
  sessions: number;
  sessionsList?: StudySession[];
}

export interface SessionReflection {
  id: string;
  sessionId?: string;
  taskName: string;
  timestamp: string;
  date: string;
  energyLevel: 1 | 2 | 3 | 4 | 5; // 1 = Distracted, 5 = Deep Flow
  notes: string;
  tags: string[];
  durationMinutes: number;
}

export type AmbientSoundMode = 'none' | 'alpha' | 'theta' | 'brown_noise' | 'rain' | 'custom_file' | 'custom_url';

export interface CustomAudioConfig {
  sourceType: 'file' | 'url';
  fileName?: string;
  url?: string;
  volume: number; // 0 to 1
  isPlaying: boolean;
}

export interface AntiCheatRecord {
  timestamp: number;
  durationSeconds: number;
  taskName: string;
}

export type ThemeMode = 'dark' | 'light';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AppSettings {
  focusDurationMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  dailyGoalMinutes: number;
  autoStartBreaks: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  strictBlockerMode: boolean;
  strictAntiCheatMode: boolean;
  themeMode?: ThemeMode;
}

export interface MilestoneAlert {
  id: string;
  title: string;
  message: string;
  type: 'milestone' | 'goal_completed' | 'session_finished' | 'streak' | 'anti_cheat';
  timestamp: number;
}

export interface FocusProtocol {
  id: 'ultradian' | 'oc_standard' | 'pomodoro' | 'sprint';
  name: string;
  tagline: string;
  focusMinutes: number;
  breakMinutes: number;
  iconName: 'zap' | 'flame' | 'clock' | 'target';
  description: string;
  recommendedFor: string;
}
