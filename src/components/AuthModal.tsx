import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile 
} from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
import { getFriendlyAuthError } from '../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(userCredential.user, { displayName: name.trim() });
        }
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(getFriendlyAuthError(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(getFriendlyAuthError(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0b1329] border border-cyan-900/40 p-6 shadow-2xl text-white">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-2">
          {isLogin ? 'Welcome Back' : 'Create Your Account'}
        </h2>
        <p className="text-xs text-gray-400 text-center mb-6">
          Sync your study sessions, goals, and focus tasks across devices.
        </p>

        <div className="flex rounded-lg bg-gray-800/60 p-1 mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${!isLogin ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
            onClick={() => { setIsLogin(false); setError(null); }}
          >
            Create Account
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${isLogin ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
            onClick={() => { setIsLogin(true); setError(null); }}
          >
            Log In
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-lg bg-[#070b19] border border-gray-700 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-lg bg-[#070b19] border border-gray-700 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg bg-[#070b19] border border-gray-700 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg bg-[#070b19] border border-gray-700 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-95 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In & Start Syncing' : 'Create Account & Start Syncing')}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
          <span className="relative bg-[#0b1329] px-3 text-xs text-gray-400 uppercase">Or continue with</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 rounded-xl border border-gray-700 bg-gray-800/40 hover:bg-gray-800 font-medium text-sm flex items-center justify-center gap-2 transition"
        >
          Google Sign In
        </button>
      </div>
    </div>
  );
};
