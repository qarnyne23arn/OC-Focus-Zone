import { UserProfile } from '../types';

// Storage keys
const AUTH_KEY = 'oc_auth_data';
const GUEST_KEY = 'oc_guest_dismissed';
const SYNC_KEY = 'oc_synced_user_data';
const LOCAL_USERS_KEY = 'oc_local_registered_users';

interface StoredAuth {
  user: UserProfile;
  token: string;
}

// ----------------------------------------------------
// Storage & Session Helpers (Required by App.tsx & AuthModal.tsx)
// ----------------------------------------------------

export function loadStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to load stored auth:', e);
    return null;
  }
}

export function saveStoredAuth(user: UserProfile, token: string): void {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ user, token }));
  } catch (e) {
    console.error('Failed to save stored auth:', e);
  }
}

export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (e) {
    console.error('Failed to clear stored auth:', e);
  }
}

export function isGuestDismissed(): boolean {
  try {
    return localStorage.getItem(GUEST_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setGuestDismissed(dismissed: boolean): void {
  try {
    localStorage.setItem(GUEST_KEY, dismissed ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to update guest dismissal state:', e);
  }
}

// ----------------------------------------------------
// Client-Side Authentication Engine (Required by AuthModal.tsx)
// ----------------------------------------------------

function getStoredUsers(): Record<string, { user: UserProfile; passwordHash: string }> {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, { user: UserProfile; passwordHash: string }>): void {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users database:', e);
  }
}

export async function clientSignUp(
  email: string,
  password: string,
  name?: string
): Promise<{ user: UserProfile; token: string }> {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users[normalizedEmail]) {
    throw new Error('An account with this email already exists.');
  }

  const displayName = name?.trim() || normalizedEmail.split('@')[0];
  const newUser: UserProfile = {
    id: 'user_' + Math.random().toString(36).substring(2, 11),
    email: normalizedEmail,
    name: displayName,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
    createdAt: new Date().toISOString(),
  } as any;

  users[normalizedEmail] = {
    user: newUser,
    passwordHash: btoa(password), // Simple client-side hash for offline persistence
  };
  saveUsers(users);

  const token = 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  return { user: newUser, token };
}

export async function clientLogIn(
  email: string,
  password: string
): Promise<{ user: UserProfile; token: string }> {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const record = users[normalizedEmail];

  if (!record || record.passwordHash !== btoa(password)) {
    throw new Error('Invalid email or password.');
  }

  const token = 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  return { user: record.user, token };
}

export async function clientGoogleSignIn(): Promise<{ user: UserProfile; token: string }> {
  // Offline/client-side simulated Google sign-in handler
  const googleUser: UserProfile = {
    id: 'g_user_' + Math.random().toString(36).substring(2, 9),
    email: 'google.user@example.com',
    name: 'Google Scholar',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GoogleScholar',
    createdAt: new Date().toISOString(),
  } as any;

  const token = 'g_token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  return { user: googleUser, token };
}

// ----------------------------------------------------
// Sync & Fallback Helpers (Required by App.tsx)
// ----------------------------------------------------

export async function apiPushUserSync(data: any): Promise<boolean> {
  try {
    localStorage.setItem(SYNC_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Error syncing user data locally:', e);
    return false;
  }
}

export async function apiPullUserSync(): Promise<any> {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error loading synced user data:', e);
    return null;
  }
}

export async function apiChangePassword(currentPassword: string, newPassword: string): Promise<void> {
  const authData = loadStoredAuth();
  if (!authData || !authData.user.email) {
    throw new Error('No user currently logged in.');
  }

  const users = getStoredUsers();
  const email = authData.user.email.toLowerCase();
  const record = users[email];

  if (!record || record.passwordHash !== btoa(currentPassword)) {
    throw new Error('Current password is incorrect.');
  }

  record.passwordHash = btoa(newPassword);
  users[email] = record;
  saveUsers(users);
}

export function getFriendlyAuthError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please provide a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    default:
      return errorCode || 'Authentication failed. Please try again.';
  }
}
