import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserPlan } from '../../types';
import {
  ShieldAlert,
  Users,
  DollarSign,
  Activity,
  Server,
  Settings2,
  Trash2,
  RefreshCw,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  Search,
  Plus,
  Lock,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    user,
    setCurrentView,
    systemSettings,
    updateSystemSettings,
    setIsAuthModalOpen,
    setAuthModalTab,
    showToast,
  } = useApp();

  // If user is not authenticated as admin, show access restricted guard
  if (user.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-950 text-white">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-extrabold uppercase tracking-widest">
              Access Restricted
            </span>
            <h2 className="text-2xl font-black mt-3 text-white">
              Administrator Authentication Required
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This management portal is strictly restricted to system administrators with verified master credentials. Regular user sessions cannot access this interface.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Authorized Master Credentials
            </p>
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Admin Email:</span>
                <span className="text-slate-200 font-bold">admin@docupulse.io</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Master Password:</span>
                <span className="text-rose-400 font-bold">Admin@DocuPulse2026!</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => {
                setAuthModalTab('admin');
                setIsAuthModalOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-rose-600/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Sign In with Admin Credentials</span>
            </button>
            <button
              onClick={() => setCurrentView('home')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Return to Public Tools
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [adminTab, setAdminTab] = useState<'metrics' | 'users' | 'system' | 'logs'>('metrics');
  const [searchUserQuery, setSearchUserQuery] = useState('');

  // Mock initial users list in state for admin operations
  const [userList, setUserList] = useState<User[]>([
    {
      id: 'usr_1',
      name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      plan: 'free',
      role: 'admin',
      createdAt: '2026-01-15T08:00:00Z',
    },
    {
      id: 'usr_2',
      name: 'Sarah Jenkins',
      email: 'sarah.j@techcorp.io',
      plan: 'pro',
      role: 'user',
      createdAt: '2026-02-01T10:30:00Z',
    },
    {
      id: 'usr_3',
      name: 'Michael Chang',
      email: 'm.chang@legalgroup.com',
      plan: 'business',
      role: 'user',
      createdAt: '2026-02-10T14:15:00Z',
    },
    {
      id: 'usr_4',
      name: 'Elena Rostova',
      email: 'elena@designstudio.de',
      plan: 'pro',
      role: 'user',
      createdAt: '2026-02-12T09:00:00Z',
    },
    {
      id: 'usr_5',
      name: 'David Kim',
      email: 'david.kim@university.edu',
      plan: 'free',
      role: 'user',
      createdAt: '2026-02-14T11:45:00Z',
    },
  ]);

  // System settings local form
  const [freeLimitInput, setFreeLimitInput] = useState(systemSettings.freeDailyLimit);
  const [maintenanceInput, setMaintenanceInput] = useState(systemSettings.maintenanceMode);
  const [aiEngineInput, setAiEngineInput] = useState(systemSettings.allowAiOcr);

  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      freeDailyLimit: Number(freeLimitInput),
      maintenanceMode: maintenanceInput,
      allowAiOcr: aiEngineInput,
    });
    showToast('success', 'System Config Updated', 'Settings applied immediately to all client sessions.');
  };

  const handleUpdateUserPlan = (userId: string, newPlan: UserPlan) => {
    setUserList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u))
    );
    showToast('success', 'Plan Updated', `User ${userId} plan set to ${newPlan}.`);
  };

  const handleDeleteUser = (userId: string) => {
    setUserList((prev) => prev.filter((u) => u.id !== userId));
    showToast('warning', 'User Removed', `Account ${userId} removed from database.`);
  };

  const filteredUsers = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.plan.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white">
                  DocuPulse Admin Control Center
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                  CONFIDENTIAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as Super Admin ({user.email})
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('home')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to App</span>
          </button>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'metrics', label: 'Platform Telemetry', icon: Activity },
            { id: 'users', label: `User Management (${userList.length})`, icon: Users },
            { id: 'system', label: 'System Configuration', icon: Settings2 },
            { id: 'logs', label: 'Live Server Logs', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-indigo-400 shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Platform Telemetry Metrics */}
        {adminTab === 'metrics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Monthly Recurring Revenue
                </span>
                <p className="text-3xl font-extrabold text-white mt-2">$14,890.00</p>
                <p className="text-xs text-emerald-400 font-bold mt-2">▲ +18.4% this month</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Active Users
                </span>
                <p className="text-3xl font-extrabold text-white mt-2">24,512</p>
                <p className="text-xs text-indigo-400 font-bold mt-2">842 Pro Subscribers</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Operations Processed (24h)
                </span>
                <p className="text-3xl font-extrabold text-white mt-2">128,490</p>
                <p className="text-xs text-emerald-400 font-bold mt-2">Avg 1.1s latency</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Gemini AI OCR Health
                </span>
                <p className="text-3xl font-extrabold text-emerald-400 mt-2">99.98%</p>
                <p className="text-xs text-slate-400 mt-2">0 API Rate-Limit Errors</p>
              </div>
            </div>

            {/* Live Throughput Chart Representation */}
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Global Operations Throughput (Past 12 Hours)
              </h3>
              <div className="h-44 flex items-end gap-2 pt-6">
                {[45, 62, 80, 95, 70, 88, 100, 85, 92, 110, 125, 98].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t-lg transition-all"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[10px] text-slate-400">
                      {idx * 2}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Management Table */}
        {adminTab === 'users' && (
          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white">
                  User Accounts Directory
                </h3>
                <p className="text-xs text-slate-400">
                  Manage plan assignments, view creation dates, and edit credentials.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  placeholder="Filter users..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Plan Tier</th>
                    <th className="p-3.5">Registered</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-750">
                      <td className="p-3.5">
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          u.role === 'admin' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={u.plan}
                          onChange={(e) => handleUpdateUserPlan(u.id, e.target.value as UserPlan)}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-indigo-300 cursor-pointer focus:outline-indigo-500"
                        >
                          <option value="free">Free (3/day)</option>
                          <option value="pro">Pro ($9/mo)</option>
                          <option value="business">Business ($24/mo)</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-950 text-rose-400 cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: System Configuration */}
        {adminTab === 'system' && (
          <div className="max-w-2xl p-6 sm:p-8 rounded-3xl bg-slate-800/80 border border-slate-700/80">
            <h3 className="text-base font-bold text-white mb-6">
              Global Platform Parameters
            </h3>

            <form onSubmit={handleSaveSystemSettings} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Daily Free Operations Quota per User
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={freeLimitInput}
                  onChange={(e) => setFreeLimitInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Currently set to {freeLimitInput} operations before the upgrade paywall triggers.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-700">
                <div>
                  <p className="text-xs font-bold text-white">Gemini AI OCR & Intelligence Engine</p>
                  <p className="text-[11px] text-slate-400">Enable or disable server-side AI processing</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiEngineInput}
                  onChange={(e) => setAiEngineInput(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-700">
                <div>
                  <p className="text-xs font-bold text-white">Maintenance Mode</p>
                  <p className="text-[11px] text-slate-400">Show maintenance banner to non-admin visitors</p>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceInput}
                  onChange={(e) => setMaintenanceInput(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Save System Parameters
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Live Server Logs */}
        {adminTab === 'logs' && (
          <div className="p-6 rounded-3xl bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 max-h-[500px] overflow-y-auto space-y-2">
            {[
              '[2026-02-15 15:20:01] [INFO] Express API Gateway initialized on port 3000.',
              '[2026-02-15 15:20:12] [AUTH] User usr_1 authenticated session as role:admin.',
              '[2026-02-15 15:20:30] [PDF_ENGINE] Client executed merge operation (3 files, 4.2 MB total).',
              '[2026-02-15 15:21:05] [QUOTA_ENGINE] Enforcing 3/day free tier cap for non-paying IP clusters.',
              '[2026-02-15 15:21:40] [AI_SERVICE] Dispatched OCR request to Gemini 2.5 Flash server endpoint.',
              '[2026-02-15 15:22:15] [BILLING] Pro monthly checkout initialized successfully.',
            ].map((log, idx) => (
              <p key={idx} className="leading-relaxed">
                {log}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
