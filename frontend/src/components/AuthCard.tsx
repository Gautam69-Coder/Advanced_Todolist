import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { TactileButton } from './TactileButton';
import { audioService } from '../utils/audio';

interface AuthCardProps {
  onSuccess: (user: { id: string; username: string }) => void;
  apiBaseUrl: string;
  axiosInstance: any; // We can pass axios directly
}

type AuthMode = 'login' | 'signup';

export const AuthCard: React.FC<AuthCardProps> = ({
  onSuccess,
  apiBaseUrl,
  axiosInstance,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchMode = (newMode: AuthMode) => {
    if (newMode !== mode) {
      audioService.playClick();
      setMode(newMode);
      setError(null);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!username.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (mode === 'signup') {
      if (username.trim().length < 3) {
        setError('Username must be at least 3 characters.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const response = await axiosInstance.post(`${apiBaseUrl}${endpoint}`, {
        username: username.trim(),
        password,
      });

      audioService.playComplete();
      onSuccess(response.data);
    } catch (err: any) {
      console.error('Auth error:', err);
      audioService.playToggle(false); // Play negative/error feedback
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto select-none px-4">
      {/* Tab Switcher (Neomorphic Container) */}
      <div className="flex p-2 rounded-2xl shadow-neu-sm-in border border-neu-border bg-neu-bg gap-2 mb-8">
        <TactileButton
          type="button"
          active={mode === 'login'}
          onClick={() => switchMode('login')}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
        >
          Login
        </TactileButton>
        <TactileButton
          type="button"
          active={mode === 'signup'}
          onClick={() => switchMode('signup')}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
        >
          Sign Up
        </TactileButton>
      </div>

      {/* Main Form Card */}
      <motion.div
        layout
        className="bg-neu-bg p-8 rounded-3xl shadow-neu-out border border-neu-border relative overflow-hidden"
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-neu-text tracking-tight font-display">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-neu-text-muted mt-1.5 font-medium">
            {mode === 'login' 
              ? 'Enter your credentials to access your todo lists' 
              : 'Sign up to start organizing your life with neomorphism'
            }
          </p>
        </div>

        {/* Error Alert Box */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2.5 shadow-neu-sm-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neu-text-muted/80 tracking-wide uppercase px-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-neu-text-muted/40">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                disabled={loading}
                className="w-full pl-11 pr-4 py-3.5 shadow-neu-in border border-neu-border focus:border-accent bg-neu-bg text-neu-text text-sm rounded-2xl outline-none transition-all placeholder-neu-text-muted/40 font-medium disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neu-text-muted/80 tracking-wide uppercase px-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-neu-text-muted/40">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? 'Enter password' : 'Min 6 characters'}
                required
                disabled={loading}
                className="w-full pl-11 pr-11 py-3.5 shadow-neu-in border border-neu-border focus:border-accent bg-neu-bg text-neu-text text-sm rounded-2xl outline-none transition-all placeholder-neu-text-muted/40 font-medium disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => {
                  audioService.playClick();
                  setShowPassword(!showPassword);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-neu-text-muted/40 hover:text-accent outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Signup only) */}
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden space-y-1.5"
              >
                <label className="text-xs font-bold text-neu-text-muted/80 tracking-wide uppercase px-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-neu-text-muted/40">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required={mode === 'signup'}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3.5 shadow-neu-in border border-neu-border focus:border-accent bg-neu-bg text-neu-text text-sm rounded-2xl outline-none transition-all placeholder-neu-text-muted/40 font-medium disabled:opacity-50"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <div className="pt-2">
            <TactileButton
              type="submit"
              accent
              disabled={loading}
              className="w-full py-4 rounded-2xl shadow-neu-out flex items-center justify-center font-bold tracking-wide uppercase text-sm h-12"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              ) : mode === 'login' ? (
                'Log In'
              ) : (
                'Register & Sign Up'
              )}
            </TactileButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
export default AuthCard;
