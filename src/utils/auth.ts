import { auth } from './firebase';
import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from 'firebase/auth';

// Storage helpers expected by App.tsx
export function loadStoredAuth(): any {
  try {
    const raw = localStorage.getItem('oc_auth_data');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error loading stored auth:', e);
    return null;
  }
}

export function saveStoredAuth(data: any): void {
  try {
    localStorage.setItem('oc_auth_data', JSON.stringify(data));
  } catch (e) {
    console.error('Error saving stored auth:', e);
  }
}

export function clearStoredAuth(): void {
  try {
    localStorage.removeItem('oc_auth_data');
  } catch (e) {
    console.error('Error clearing stored auth:', e);
  }
}

// Password update helper
export async function apiChangePassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No user currently logged in');
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

// Error mapping helper
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
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before finishing.';
    default:
      return 'Authentication failed. Please try again.';
  }
}
