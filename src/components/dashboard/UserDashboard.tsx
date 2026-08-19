import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Crown,
  Sparkles,
  Clock,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  CreditCard,
  Settings,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const {
    user,
    setUser,
    quota,
    history,
    deleteHistoryItem,
    clearHistory,
    setIsUpgradeModalOpen,
    cancelSubscription,
    openTool,
    showToast,
    systemSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'billing' | 'settings'>('overview');
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);

  const isUnlimited = user.plan === 'pro' || user.plan === 'business' || user.role === 'admin';
  const freeLimit = systemSettings.freeDailyLimit || 3;
  const percentageUsed = isUnlimited ? 0 : Math.min(100, Math.round((quota.usedToday / freeLimit) * 100));

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ ...user, name: profileName, email: profileEmail });
    showToast('success', 'Profile Updated', 'Your profile details have been saved.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-indigo-500/20 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/80 border border-indigo-400/40 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold">{user.name}</h1>
                  <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    isUnlimited
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {user.plan.toUpperCase()} PLAN
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{user.email}</p>
              </div>
            </div>

            {/* Quick Upgrade / Plan status Button */}
            <div className="flex items-center gap-3">
              {!isUnlimited ? (
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <Crown className="w-4 h-4" />
                  <span>Upgrade to Pro ($9/mo)</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Pro Subscription Active</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: 'overview', label: 'Overview & Quota', icon: LayoutDashboard },
            { id: 'history', label: `Activity History (${history.length})`, icon: Clock },
            { id: 'billing', label: 'Subscription & Billing', icon: CreditCard },
            { id: 'settings', label: 'Account Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-800'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview & Quota */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Daily Quota Tracker */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Daily Operation Quota
                  </span>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {isUnlimited ? '∞' : `${quota.usedToday} / ${freeLimit}`}
                  </span>
                  <span className="text-xs text-slate-500">
                    {isUnlimited ? 'Unlimited Operations' : 'operations used today'}
                  </span>
                </div>

                {!isUnlimited && (
                  <div className="mt-4">
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          percentageUsed >= 100 ? 'bg-rose-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percentageUsed}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>Resets daily at 00:00 UTC</span>
                      <span>{Math.max(0, freeLimit - quota.usedToday)} remaining</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Documents Processed */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Lifetime Processed
                  </span>
                  <FileText className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {history.length}
                  </span>
                  <span className="text-xs text-slate-500">files & conversions</span>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  Stored securely in your local browser sandbox cache.
                </p>
              </div>

              {/* Security & Privacy Level */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Privacy Protection
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    256-Bit SSL
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  Ephemeral isolated RAM cache with 60-min automatic destruction.
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Activity preview */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Recent Document Conversions
                </h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>View All History</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {history.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs">No documents processed yet.</p>
                  <button
                    onClick={() => openTool('merge-pdf')}
                    className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Start Processing Now
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      <div className="flex items-center gap-3 overflow-hidden text-left">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.outputFileName || item.originalFileName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {item.toolName} • {new Date(item.timestamp).toLocaleTimeString()} • {(item.outputSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      {item.downloadUrl && (
                        <a
                          href={item.downloadUrl}
                          download={item.outputFileName}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center gap-1.5 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Full Activity History */}
        {activeTab === 'history' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Document History Logs ({history.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Review and re-download your processed files.
                </p>
              </div>

              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  Clear All History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No operations logged yet
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Once you perform conversions or edits, they will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 flex items-center justify-between gap-4 text-left"
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.outputFileName || item.originalFileName}
                          </p>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.toolName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(item.timestamp).toLocaleString()} • Size: {(item.outputSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.downloadUrl && (
                        <a
                          href={item.downloadUrl}
                          download={item.outputFileName}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => deleteHistoryItem(item.id)}
                        className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Subscription & Billing */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Active Subscription Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Current Active Tier
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white capitalize mt-1">
                    {user.plan} Plan
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isUnlimited
                      ? 'You have full access to unlimited operations, Gemini AI, and 200MB file uploads.'
                      : 'You are currently on the free plan with a 3 operations/day limit.'}
                  </p>
                </div>

                <div>
                  {!isUnlimited ? (
                    <button
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 cursor-pointer transition-all"
                    >
                      Upgrade Plan ($9/mo)
                    </button>
                  ) : (
                    <button
                      onClick={cancelSubscription}
                      className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs font-bold cursor-pointer transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>

              {/* Billing History Mock Invoices */}
              <div className="pt-6">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Billing & Invoice History
                </h4>
                <div className="space-y-2">
                  {[
                    { id: 'INV-2026-001', date: 'Feb 15, 2026', amount: '$9.00', status: 'Paid', plan: 'DocuPulse Pro Monthly' },
                    { id: 'INV-2026-000', date: 'Jan 15, 2026', amount: '$9.00', status: 'Paid', plan: 'DocuPulse Pro Monthly' },
                  ].map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {inv.plan} ({inv.id})
                        </p>
                        <p className="text-[11px] text-slate-400">{inv.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{inv.amount}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Account Settings */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Profile & Preferences
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
