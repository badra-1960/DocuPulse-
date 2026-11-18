import React, { useState, useEffect, useMemo } from 'react';
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
  FileSpreadsheet,
  Image as ImageIcon,
  CreditCard,
  Settings,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  UserCheck,
  Building2,
  ShieldAlert,
  LogIn,
  Search,
  Filter,
  RotateCcw,
  FileCode,
} from 'lucide-react';
import { ToolId } from '../../types';

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function getFileIcon(filename: string, toolId?: string) {
  const lower = (filename || '').toLowerCase();
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || toolId === 'pdf-to-excel' || toolId === 'excel-to-pdf') {
    return <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
  }
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp') || toolId === 'pdf-to-image' || toolId === 'image-to-pdf' || toolId === 'image-converter') {
    return <ImageIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />;
  }
  if (lower.endsWith('.md') || toolId === 'doc-to-markdown') {
    return <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
  }
  if (lower.endsWith('.docx') || lower.endsWith('.doc') || toolId === 'word-to-pdf' || toolId === 'pdf-to-word') {
    return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
  }
  return <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
}

export const UserDashboard: React.FC = () => {
  const {
    user,
    setUser,
    quota,
    history,
    invoices,
    deleteHistoryItem,
    clearHistory,
    setIsUpgradeModalOpen,
    cancelSubscription,
    openTool,
    showToast,
    systemSettings,
    resetDailyQuota,
    loginAs,
    setIsAuthModalOpen,
    setAuthModalTab,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'recent-docs' | 'history' | 'billing' | 'settings'>('overview');
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');

  // Sync profile fields whenever the active user changes (fixing account switching sync)
  useEffect(() => {
    setProfileName(user.name);
    setProfileEmail(user.email);
  }, [user.name, user.email, user.id]);

  const isUnlimited = user.plan === 'pro' || user.plan === 'business' || user.role === 'admin';
  const freeLimit = systemSettings.freeDailyLimit || 3;
  const percentageUsed = isUnlimited ? 0 : Math.min(100, Math.round((quota.usedToday / freeLimit) * 100));

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser((prev) => ({ ...prev, name: profileName, email: profileEmail }));
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
                    {t('dash_plan_badge', { plan: user.plan.toUpperCase() })}
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
                  <span>{t('dash_upgrade_btn')}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{t('dash_active_sub')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grace Period Notification Banner (Prompt 5) */}
        {user.inGracePeriod && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Délai de grâce actif — Dernier prélèvement en attente
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-1">
                  Une tentative de paiement de votre abonnement a échoué. Votre accès Pro reste entièrement actif pendant votre délai de grâce de 72h ({user.gracePeriodRemainingHours || 72}h restantes).
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shrink-0 cursor-pointer hover:bg-amber-400 transition-colors shadow-xs"
            >
              Mettre à jour la carte
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: t('dash_tab_overview'), icon: LayoutDashboard },
            {
              id: 'recent-docs',
              label: t('dash_tab_recent_docs', { count: history.length }, `Recent Documents (${history.length})`),
              icon: Clock,
            },
            { id: 'billing', label: t('dash_tab_billing'), icon: CreditCard },
            { id: 'settings', label: t('dash_tab_settings'), icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'recent-docs' && activeTab === 'history');
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
                    {t('dash_daily_usage')}
                  </span>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {isUnlimited ? '∞' : `${quota.usedToday} / ${freeLimit}`}
                  </span>
                  <span className="text-xs text-slate-500">
                    {isUnlimited ? t('nav_unlimited') : t('dash_used_of', { used: quota.usedToday, limit: freeLimit })}
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
                      <span>{t('dash_resets_midnight')}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {Math.max(0, freeLimit - quota.usedToday)} free uses remaining today
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Documents Processed */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('dash_total_conversions')}
                  </span>
                  <FileText className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {history.length}
                  </span>
                  <span className="text-xs text-slate-500">{t('conv_file_plural')}</span>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  {t('footer_ssl_desc')}
                </p>
              </div>

              {/* Security & Privacy Level */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('footer_ssl_title')}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    256-Bit SSL
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  {t('footer_purge_desc')}
                </p>
              </div>
            </div>

            {/* Recent Documents Showcase Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {t('dash_recent_docs_title', {}, 'Recent Documents')}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium tabular-nums">
                      ({history.length} {history.length === 1 ? 'file' : 'files'})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t('dash_recent_docs_subtitle', {}, 'Stores and displays recently processed files with conversion status and direct download links.')}
                  </p>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => setActiveTab('recent-docs')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <span>{t('dash_recent_docs_view_all', {}, 'View All Documents')}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No recent documents
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-5">
                    {t('dash_history_empty')}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => openTool('compress-pdf')}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Compress PDF
                    </button>
                    <button
                      onClick={() => openTool('merge-pdf')}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Merge PDF
                    </button>
                    <button
                      onClick={() => openTool('word-to-pdf')}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Word to PDF
                    </button>
                    <button
                      onClick={() => openTool('ai-ocr')}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      AI OCR
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.slice(0, 5).map((item) => {
                    const isProcessing = item.status === 'processing';
                    const isFailed = item.status === 'failed';
                    const isCompleted = !isProcessing && !isFailed;
                    const savedPct =
                      item.fileSize > item.outputSize && item.fileSize > 0
                        ? Math.round(((item.fileSize - item.outputSize) / item.fileSize) * 100)
                        : 0;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                            {getFileIcon(item.outputFileName || item.fileName, item.toolId)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={item.outputFileName || item.fileName}>
                                {item.outputFileName || item.fileName}
                              </p>
                              {/* Status Badge */}
                              {isCompleted && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>{t('dash_status_ready', {}, 'Ready')}</span>
                                </span>
                              )}
                              {isProcessing && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  <span>{t('dash_status_processing', {}, 'Processing')}</span>
                                </span>
                              )}
                              {isFailed && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 dark:text-rose-400">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>{t('dash_status_failed', {}, 'Failed')}</span>
                                </span>
                              )}
                            </div>

                            {/* Clean unboxed metadata with bullet separators */}
                            <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              <span>{item.toolName}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{formatRelativeTime(item.timestamp)}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">
                                {item.fileSize && item.outputSize && item.fileSize !== item.outputSize ? (
                                  <>
                                    {formatBytes(item.fileSize)} → {formatBytes(item.outputSize)}
                                    {savedPct > 0 && <span className="text-emerald-600 dark:text-emerald-400 ml-1">(-{savedPct}%)</span>}
                                  </>
                                ) : (
                                  formatBytes(item.outputSize || item.fileSize)
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {item.downloadUrl ? (
                            <a
                              href={item.downloadUrl}
                              download={item.outputFileName || item.fileName}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                              title="Download document"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          ) : (
                            <button
                              onClick={() => openTool(item.toolId)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                              title="Open in tool"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Open Tool</span>
                            </button>
                          )}
                          <button
                            onClick={() => deleteHistoryItem(item.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Remove from recent"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Full Recent Documents Manager */}
        {(activeTab === 'recent-docs' || activeTab === 'history') && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            {/* Header with Title and Clear Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('dash_recent_docs_title', {}, 'Recent Documents')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t('dash_recent_docs_subtitle', {}, 'Stores and displays recently processed files with conversion status and direct download links.')}
                </p>
              </div>

              {history.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Clear all recent document records from your browser history?')) {
                      clearHistory();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Clear All History
                </button>
              )}
            </div>

            {/* Filter and Search Controls */}
            {history.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchDocQuery}
                    onChange={(e) => setSearchDocQuery(e.target.value)}
                    placeholder="Search recent documents by filename or tool..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {searchDocQuery && (
                    <button
                      onClick={() => setSearchDocQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Segmented Buttons (Interactive Filter Controls per design guidelines) */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    All ({history.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      statusFilter === 'completed'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Completed ({history.filter((h) => h.status === 'completed' || !h.status).length})
                  </button>
                  {history.some((h) => h.status === 'failed') && (
                    <button
                      onClick={() => setStatusFilter('failed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        statusFilter === 'failed'
                          ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Failed ({history.filter((h) => h.status === 'failed').length})
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Document List */}
            {history.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No documents in history
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Files you convert, compress, or edit will appear here with instant download links.
                </p>
                <button
                  onClick={() => openTool('compress-pdf')}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Start Processing Documents
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {history
                  .filter((item) => {
                    const matchesSearch =
                      searchDocQuery === '' ||
                      (item.outputFileName && item.outputFileName.toLowerCase().includes(searchDocQuery.toLowerCase())) ||
                      (item.fileName && item.fileName.toLowerCase().includes(searchDocQuery.toLowerCase())) ||
                      (item.toolName && item.toolName.toLowerCase().includes(searchDocQuery.toLowerCase()));

                    const matchesStatus =
                      statusFilter === 'all' ||
                      (statusFilter === 'completed' && (item.status === 'completed' || !item.status)) ||
                      (statusFilter === 'processing' && item.status === 'processing') ||
                      (statusFilter === 'failed' && item.status === 'failed');

                    return matchesSearch && matchesStatus;
                  })
                  .map((item) => {
                    const isProcessing = item.status === 'processing';
                    const isFailed = item.status === 'failed';
                    const isCompleted = !isProcessing && !isFailed;
                    const savedPct =
                      item.fileSize > item.outputSize && item.fileSize > 0
                        ? Math.round(((item.fileSize - item.outputSize) / item.fileSize) * 100)
                        : 0;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                            {getFileIcon(item.outputFileName || item.fileName, item.toolId)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={item.outputFileName || item.fileName}>
                                {item.outputFileName || item.fileName}
                              </p>

                              {/* Status Indicator */}
                              {isCompleted && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Ready</span>
                                </span>
                              )}
                              {isProcessing && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  <span>Processing</span>
                                </span>
                              )}
                              {isFailed && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 dark:text-rose-400">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Failed</span>
                                </span>
                              )}
                            </div>

                            {/* Clean unboxed metadata with bullet separators */}
                            <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              <span className="font-medium text-slate-700 dark:text-slate-300">{item.toolName}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{new Date(item.timestamp).toLocaleString()}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">
                                {item.fileSize && item.outputSize && item.fileSize !== item.outputSize ? (
                                  <>
                                    {formatBytes(item.fileSize)} → {formatBytes(item.outputSize)}
                                    {savedPct > 0 && <span className="text-emerald-600 dark:text-emerald-400 ml-1">(-{savedPct}%)</span>}
                                  </>
                                ) : (
                                  formatBytes(item.outputSize || item.fileSize)
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {item.downloadUrl ? (
                            <a
                              href={item.downloadUrl}
                              download={item.outputFileName || item.fileName}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                              title="Download file"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          ) : (
                            <button
                              onClick={() => openTool(item.toolId)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                              title="Re-open in tool"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Open Tool</span>
                            </button>
                          )}
                          <button
                            onClick={() => deleteHistoryItem(item.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete record"
                            aria-label="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                    {t('dash_current_tier')}
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
                      {t('dash_upgrade_btn')}
                    </button>
                  ) : (
                    <button
                      onClick={cancelSubscription}
                      className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs font-bold cursor-pointer transition-colors"
                    >
                      {t('dash_cancel_sub')}
                    </button>
                  )}
                </div>
              </div>

              {/* Billing History Invoices */}
              <div className="pt-6">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Billing & Invoice History ({invoices.length})
                </h4>
                <div className="space-y-2">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {inv.plan} ({inv.invoiceNumber})
                        </p>
                        <p className="text-[11px] text-slate-400">{inv.date} • {inv.paymentMethod}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">${inv.amount.toFixed(2)}</span>
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
          <div className="space-y-6 max-w-3xl">
            {/* Account Fast Switcher Module */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('dash_switch_account_title')}
                </h2>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full">
                  Active: {user.name} ({user.plan})
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                {t('dash_switch_account_desc')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => loginAs('free')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                    user.plan === 'free' && user.role !== 'admin'
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    FR
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Gratuit / Starter</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">Free</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">user@docupulse.io (3 ops/jour)</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => loginAs('pro')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                    user.plan === 'pro' && user.role !== 'admin'
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
                    PR
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Compte Pro</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">Pro</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">pro@docupulse.io (Illimité)</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => loginAs('business')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                    user.plan === 'business' && user.role !== 'admin'
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center font-bold text-purple-700 dark:text-purple-300 shrink-0">
                    BZ
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Business Enterprise</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">Business</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Apex Tech Solutions (10 sièges)</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => loginAs('admin')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                    user.role === 'admin'
                      ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 ring-2 ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center font-bold text-rose-700 dark:text-rose-300 shrink-0">
                    <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Master Admin</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">Staff</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">admin@docupulse.io (Full Access)</p>
                  </div>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">Need to log into a custom account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In Custom Account</span>
                </button>
              </div>
            </div>

            {/* Profile Update Form */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                {t('dash_profile_title')}
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('auth_full_name')}
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('auth_email')}
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-indigo-500/20"
                  >
                    {t('dash_save_profile')}
                  </button>

                  <button
                    type="button"
                    onClick={resetDailyQuota}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {t('dash_reset_quota_btn')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
