import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldAlert,
  ArrowRight,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    loginAdmin,
    showToast,
  } = useApp();

  const [name, setName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [password, setPassword] = useState('password123');

  // Admin Portal specific state
  const [adminEmail, setAdminEmail] = useState('admin@docupulse.io');
  const [adminPassword, setAdminPassword] = useState('Admin@DocuPulse2026!');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAdminError(null);
  }, [authModalTab]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAdminError(null);

    setTimeout(() => {
      if (authModalTab === 'admin') {
        const success = loginAdmin(adminEmail, adminPassword);
        if (!success) {
          setAdminError('Invalid administrator email or master password. Access rejected.');
        }
      } else if (authModalTab === 'login') {
        login(email, password);
      } else {
        register(name, email);
      }
      setIsLoading(false);
    }, 450);
  };

  const handleFillAdminCredentials = () => {
    setAdminEmail('admin@docupulse.io');
    setAdminPassword('Admin@DocuPulse2026!');
    setAdminError(null);
    showToast('info', 'Credentials Loaded', 'Admin credentials populated.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in-50">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors ${
              authModalTab === 'admin'
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
            }`}
          >
            {authModalTab === 'admin' ? (
              <ShieldAlert className="w-6 h-6" />
            ) : (
              <Lock className="w-6 h-6" />
            )}
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {authModalTab === 'admin'
              ? 'Administrator Authentication'
              : authModalTab === 'login'
              ? 'Sign in to DocuPulse'
              : 'Create your account'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {authModalTab === 'admin'
              ? 'Authorized personnel only. Master password verification required.'
              : authModalTab === 'login'
              ? 'Access your converted documents, quotas, and subscription.'
              : 'Get 3 free operations daily and fast document processing.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthModalTab('login')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              authModalTab === 'login'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthModalTab('register')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              authModalTab === 'register'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => setAuthModalTab('admin')}
            className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              authModalTab === 'admin'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Error message for Admin authentication */}
        {adminError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{adminError}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin Login Fields */}
          {authModalTab === 'admin' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    placeholder="admin@docupulse.io"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Master Admin Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    placeholder="Enter Master Password"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Access Admin Console</span>
                  </>
                )}
              </button>

              {/* Admin Credentials Reference Card */}
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Administrator Credentials
                  </span>
                  <button
                    type="button"
                    onClick={handleFillAdminCredentials}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-bold">admin@docupulse.io</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400">Password:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">Admin@DocuPulse2026!</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Regular User Fields */
            <>
              {authModalTab === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Alex Morgan"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{authModalTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
