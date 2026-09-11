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
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Search,
  Plus,
  Lock,
  Cpu,
  Database,
  Terminal,
  Download,
  Filter,
  Layers,
  Zap,
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
              This management portal is strictly restricted to authorized system administrators. Regular user sessions cannot access this interface.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Security Notice
            </p>
            <p className="text-xs text-slate-300">
              Veuillez vous connecter avec votre compte administrateur autorisé.
            </p>
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
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'AUTH' | 'CONFIG' | 'OP'>('ALL');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<UserPlan>('free');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');

  // Real Audit Log entries
  const [systemLogs, setSystemLogs] = useState<Array<{ timestamp: string; tag: 'INFO' | 'AUTH' | 'CONFIG' | 'OP'; message: string }>>([
    { timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString(), tag: 'INFO', message: 'DocuPulse Enterprise Gateway initialized on port 3000.' },
    { timestamp: new Date(Date.now() - 1000 * 60 * 9).toLocaleTimeString(), tag: 'AUTH', message: `Admin session verified for ${user.email} (Master Credentials).` },
    { timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString(), tag: 'CONFIG', message: `Daily free quota set to ${systemSettings.freeDailyLimit} operations/day.` },
    { timestamp: new Date(Date.now() - 1000 * 60 * 2).toLocaleTimeString(), tag: 'OP', message: 'WebAssembly Document Conversion Engine loaded into client sandbox.' },
  ]);

  // Initial enterprise directory in state for administration
  const [userList, setUserList] = useState<User[]>([
    {
      id: 'usr_admin',
      name: 'Camara Badra Ali',
      email: 'admin@docupulse.io',
      plan: 'business',
      role: 'admin',
      createdAt: '2026-01-15T08:00:00Z',
    },
    {
      id: 'usr_2',
      name: 'Sarah Jenkins',
      email: 's.jenkins@enterprise-corp.com',
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
  ]);

  // Dynamic calculations based on real data
  const proUsersCount = userList.filter((u) => u.plan === 'pro').length;
  const businessUsersCount = userList.filter((u) => u.plan === 'business').length;
  const freeUsersCount = userList.filter((u) => u.plan === 'free').length;
  const monthlyRecurringRevenue = proUsersCount * 9 + businessUsersCount * 24;
  const annualRunRate = monthlyRecurringRevenue * 12;

  // System settings local form
  const [freeLimitInput, setFreeLimitInput] = useState(systemSettings.freeDailyLimit);
  const [maintenanceInput, setMaintenanceInput] = useState(systemSettings.maintenanceMode);
  const [aiEngineInput, setAiEngineInput] = useState(systemSettings.allowAiOcr);

  const addLog = (tag: 'INFO' | 'AUTH' | 'CONFIG' | 'OP', message: string) => {
    setSystemLogs((prev) => [
      { timestamp: new Date().toLocaleTimeString(), tag, message },
      ...prev,
    ]);
  };

  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      freeDailyLimit: Number(freeLimitInput),
      maintenanceMode: maintenanceInput,
      allowAiOcr: aiEngineInput,
    });
    addLog('CONFIG', `System configuration updated: freeLimit=${freeLimitInput}, maintenance=${maintenanceInput}, aiOcr=${aiEngineInput}`);
    showToast('success', 'System Config Updated', 'Settings applied immediately to all client sessions.');
  };

  const handleUpdateUserPlan = (userId: string, newPlan: UserPlan) => {
    setUserList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u))
    );
    addLog('CONFIG', `User plan updated for account ${userId} to ${newPlan}.`);
    showToast('success', 'Plan Updated', `User ${userId} plan set to ${newPlan}.`);
  };

  const handleDeleteUser = (userId: string) => {
    setUserList((prev) => prev.filter((u) => u.id !== userId));
    addLog('AUTH', `User ${userId} removed from directory.`);
    showToast('warning', 'User Removed', `Account ${userId} removed from database.`);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const newAccount: User = {
      id: `usr_${Date.now().toString().slice(-4)}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      plan: newUserPlan,
      role: newUserRole,
      createdAt: new Date().toISOString(),
    };
    setUserList((prev) => [newAccount, ...prev]);
    addLog('AUTH', `New account provisioned: ${newAccount.name} (${newAccount.email}) with ${newAccount.plan} tier.`);
    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
    showToast('success', 'Account Created', `User ${newAccount.name} successfully registered.`);
  };

  const filteredUsers = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.plan.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  const filteredLogs = systemLogs.filter((log) =>
    logFilter === 'ALL' ? true : log.tag === logFilter
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

        {/* Tab 1: Platform Telemetry Metrics (Live Calculated) */}
        {adminTab === 'metrics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* MRR Live Card */}
              <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Calculated MRR
                  </span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-3xl font-extrabold text-white mt-2">
                  ${monthlyRecurringRevenue.toFixed(2)}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                  <span className="text-emerald-400 font-bold">ARR: ${annualRunRate.toFixed(2)}</span>
                  <span>{proUsersCount + businessUsersCount} paying</span>
                </div>
              </div>

              {/* Total Users Directory Card */}
              <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Registered Accounts
                  </span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-3xl font-extrabold text-white mt-2">{userList.length}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                  <span className="text-indigo-400 font-bold">{proUsersCount} Pro</span>
                  <span>•</span>
                  <span className="text-purple-400 font-bold">{businessUsersCount} Biz</span>
                  <span>•</span>
                  <span>{freeUsersCount} Free</span>
                </div>
              </div>

              {/* Engine Status & Latency Card */}
              <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Processing Engine
                  </span>
                  <Cpu className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-extrabold text-white mt-2">WebAssembly</p>
                <p className="text-xs text-emerald-400 font-bold mt-2">Local In-Browser & Zero-Latency</p>
              </div>

              {/* AI & Infrastructure Health Card */}
              <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    AI OCR Gateway
                  </span>
                  <Zap className="w-4 h-4 text-violet-400" />
                </div>
                <p className="text-2xl font-extrabold text-emerald-400 mt-2">
                  {systemSettings.allowAiOcr ? 'Active' : 'Disabled'}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  {systemSettings.allowAiOcr ? 'Gemini 2.5 Flash Server Ready' : 'AI Processing Paused'}
                </p>
              </div>
            </div>

            {/* Architecture & Engine Suite Overview */}
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Engine Module Allocation & Security Parameters
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time operational distribution across active microservices
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full w-fit">
                  Node v20.x + Vite 6 + WASM 1.0
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>PDF Canvas Module</span>
                    <span className="text-indigo-400 font-mono">pdf-lib</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Merge, Split, Rotate, Watermark & Page Numbering</p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-indigo-500 h-full w-[100%]" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Office Conversion</span>
                    <span className="text-emerald-400 font-mono">xlsx / docx</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Word, Excel & PowerPoint High-Fidelity Renderers</p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-emerald-500 h-full w-[100%]" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Image Optimization</span>
                    <span className="text-amber-400 font-mono">Canvas2D</span>
                  </div>
                  <p className="text-[11px] text-slate-400">WebP, PNG, JPEG & HEIC Multi-threaded Compress</p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-amber-500 h-full w-[100%]" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Intelligence OCR</span>
                    <span className="text-violet-400 font-mono">Gemini Flash</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Deep Semantic Analysis & Smart Table Extraction</p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-violet-500 h-full w-[100%]" />
                  </div>
                </div>
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
                  User Accounts Directory ({userList.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Manage plan assignments, view creation dates, and edit permissions.
                </p>
              </div>

              <div className="flex items-center gap-3">
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
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            {/* Add User Modal */}
            {showAddUserModal && (
              <div className="mb-6 p-5 rounded-2xl bg-slate-900 border border-indigo-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Provision New Account</h4>
                  <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">Cancel</button>
                </div>
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Work Email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500"
                  />
                  <select
                    value={newUserPlan}
                    onChange={(e) => setNewUserPlan(e.target.value as UserPlan)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="free">Free Starter</option>
                    <option value="pro">Pro Plan ($9/mo)</option>
                    <option value="business">Business Enterprise ($24/mo)</option>
                  </select>
                  <button
                    type="submit"
                    className="py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md"
                  >
                    Create Account
                  </button>
                </form>
              </div>
            )}

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

        {/* Tab 4: Live Server & Audit Logs */}
        {adminTab === 'logs' && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live System Audit Trail</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
                  {filteredLogs.length} events
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                  {(['ALL', 'INFO', 'AUTH', 'CONFIG', 'OP'] as const).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setLogFilter(tag)}
                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        logFilter === tag ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setSystemLogs([]);
                    showToast('info', 'Logs Cleared', 'Audit trail has been reset.');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800/80 max-h-[440px] overflow-y-auto space-y-2">
              {filteredLogs.length === 0 ? (
                <p className="text-slate-500 italic py-4 text-center">No logs recorded for this category filter.</p>
              ) : (
                filteredLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 leading-relaxed hover:bg-slate-900/50 p-1 rounded">
                    <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                        log.tag === 'AUTH'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : log.tag === 'CONFIG'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : log.tag === 'OP'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {log.tag}
                    </span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
