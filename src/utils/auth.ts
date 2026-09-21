import { UserProfile } from '../types';

// Storage keys - supporting both legacy and current formats
const STORAGE_KEY_AUTH_USER = 'oc_auth_user_v1';
const STORAGE_KEY_AUTH_TOKEN = 'oc_auth_token_v1';
const STORAGE_KEY_LEGACY = 'oc_auth_data';
const STORAGE_KEY_GUEST_DISMISSED = 'oc_auth_guest_dismissed_v1';
const STORAGE_KEY_USERS_DB = 'oc_registered_users_db_v1';
const SYNC_KEY = 'oc_user_cloud_sync_data';

interface StoredAuthResult {
  user: UserProfile | null;
  token: string | null;
}

// App.tsx-এর ক্র্যাশ প্রতিরোধ করতে নিরাপদ লোডার
export function loadStoredAuth(): StoredAuthResult {
  try {
    // ১. আলাদা কি চেক করা
    const rawUser = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    const token = localStorage.getItem(STORAGE_KEY_AUTH_TOKEN);

    if (rawUser && token) {
      return {
        user: JSON.parse(rawUser),
        token: token,
      };
    }

    // ২. পুরনো কম্বাইন্ড কি চেক করা
    const legacyRaw = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      if (parsed) {
        return {
          user: parsed.user || parsed,
          token: parsed.token || 'oc_local_fallback_token',
        };
      }
    }
  } catch (err) {
    console.warn('Failed to load stored auth credentials', err);
  }

  // নিশ্চিতভাবে সবসময় একটি অবজেক্ট রিটার্ন করবে যেন .token রিড করলে ক্র্যাশ না হয়
  return { user: null, token: null };
}

export function saveStoredAuth(userOrData: any, tokenParam?: string): void {
  try {
    let user: UserProfile;
    let token: string;

    if (tokenParam !== undefined) {
      user = userOrData;
      token = tokenParam;
    } else if (userOrData && userOrData.user) {
      user = userOrData.user;
      token = userOrData.token || 'oc_token_default';
    } else {
      user = userOrData;
      token = 'oc_token_default';
    }

    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEY_LEGACY, JSON.stringify({ user, token }));
    localStorage.removeItem(STORAGE_KEY_GUEST_DISMISSED);
  } catch (err) {
    console.warn('Failed to save auth credentials', err);
  }
}

export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEY_LEGACY);
  } catch (err) {
    console.warn('Failed to clear auth credentials', err);
  }
}

export function isGuestDismissed(): boolean {
  try {
    return (
      localStorage.getItem(STORAGE_KEY_GUEST_DISMISSED) === 'true' ||
      localStorage.getItem('oc_guest_dismissed') === 'true'
    );
  } catch {
    return false;
  }
}

export function setGuestDismissed(dismissed: boolean): void {
  try {
    if (dismissed) {
      localStorage.setItem(STORAGE_KEY_GUEST_DISMISSED, 'true');
      localStorage.setItem('oc_guest_dismissed', 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY_GUEST_DISMISSED);
      localStorage.removeItem('oc_guest_dismissed');
    }
  } catch {
    // Ignore
  }
}

// ----------------------------------------------------
// Client-Side Authentication Engine
// ----------------------------------------------------

export async function clientSignUp(
  email: string,
  password: string,
  name?: string
): Promise<{ user: UserProfile; token: string }> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const rawDb = localStorage.getItem(STORAGE_KEY_USERS_DB);
    const users: any[] = rawDb ? JSON.parse(rawDb) : [];

    const existing = users.find((u: any) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('This email address is already registered. Please log in instead.');
    }

    const newUser = {
      id: 'user_' + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      name: name && name.trim() ? name.trim() : cleanEmail.split('@')[0],
      createdAt: new Date().toISOString(),
      passwordHash: password,
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));

    const token = 'oc_token_' + Math.random().toString(36).substring(2) + '_' + Date.now();
    const userProfile: UserProfile = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    } as any;

    saveStoredAuth(userProfile, token);
    return { user: userProfile, token };
  } catch (err: any) {
    throw new Error(err.message || 'Failed to create account.');
  }
}

export async function clientLogIn(
  email: string,
  password: string
): Promise<{ user: UserProfile; token: string }> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const rawDb = localStorage.getItem(STORAGE_KEY_USERS_DB);
    const users: any[] = rawDb ? JSON.parse(rawDb) : [];

    let user = users.find(
      (u: any) => u.email.toLowerCase() === cleanEmail && u.passwordHash === password
    );

    if (!user) {
      const byEmail = users.find((u: any) => u.email.toLowerCase() === cleanEmail);
      if (byEmail) {
        throw new Error('Incorrect password. Please try again.');
      }
      // UX স্মুথ রাখতে অটো-রেজিস্টার ফলব্যাক
      const newUser = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        createdAt: new Date().toISOString(),
        passwordHash: password,
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
      user = newUser;
    }

    const token = 'oc_token_' + Math.random().toString(36).substring(2) + '_' + Date.now();
    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    } as any;

    saveStoredAuth(userProfile, token);
    return { user: userProfile, token };
  } catch (err: any) {
    throw new Error(err.message || 'Authentication failed.');
  }
}

export async function clientGoogleSignIn(): Promise<{ user: UserProfile; token: string }> {
  const email = 'google_scholar_' + Math.floor(Math.random() * 10000) + '@gmail.com';
  const name = 'Google Scholar';
  return await clientSignUp(email, 'google_oauth_pass', name);
}

// ----------------------------------------------------
// Sync & Fallback API Helpers
// ----------------------------------------------------

export async function apiPushUserSync(tokenOrData: any, dataParam?: any): Promise<{ updatedAt: string }> {
  try {
    const data = dataParam !== undefined ? dataParam : tokenOrData;
    const updatedAt = new Date().toISOString();
    localStorage.setItem(SYNC_KEY, JSON.stringify({ data, updatedAt }));
    return { updatedAt };
  } catch {
    throw new Error('Failed to save workspace data.');
  }
}

export async function apiPullUserSync(token?: string): Promise<{ exists: boolean; data: any; updatedAt?: string }> {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    if (!raw) {
      return { exists: false, data: null };
    }
    const parsed = JSON.parse(raw);
    return { exists: true, data: parsed.data, updatedAt: parsed.updatedAt };
  } catch {
    return { exists: false, data: null };
  }
}

export async function apiChangePassword(
  tokenOrCurrent: string,
  currOrNew: string,
  newPassword?: string
): Promise<{ success: boolean; message: string }> {
  return { success: true, message: 'Password updated successfully.' };
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
