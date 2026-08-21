import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TOOLS_LIST } from '../../data/toolsData';
import { LANGUAGES } from '../../i18n/translations';
import { Language } from '../../types';
import { LanguageSelector } from './LanguageSelector';
import {
  FileText,
  Search,
  Sparkles,
  ChevronDown,
  Moon,
  Sun,
  Crown,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  User,
  Zap,
  Menu,
  X,
  Layers,
  Scissors,
  Minimize2,
  FileImage,
  FilePlus,
  Sliders,
  Stamp,
  RotateCw,
  Hash,
  FileType,
  Globe,
  Lock,
  Check,
  FileSpreadsheet,
  Presentation,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Layers: <Layers className="w-4 h-4 text-rose-500" />,
  Scissors: <Scissors className="w-4 h-4 text-amber-500" />,
  Minimize2: <Minimize2 className="w-4 h-4 text-emerald-500" />,
  FileImage: <FileImage className="w-4 h-4 text-blue-500" />,
  FilePlus: <FilePlus className="w-4 h-4 text-violet-500" />,
  FileText: <FileText className="w-4 h-4 text-cyan-500" />,
  FileType: <FileType className="w-4 h-4 text-sky-500" />,
  Sliders: <Sliders className="w-4 h-4 text-pink-500" />,
  Sparkles: <Sparkles className="w-4 h-4 text-indigo-500" />,
  Stamp: <Stamp className="w-4 h-4 text-purple-500" />,
  Hash: <Hash className="w-4 h-4 text-slate-500" />,
  RotateCw: <RotateCw className="w-4 h-4 text-orange-500" />,
  FileSpreadsheet: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
  Presentation: <Presentation className="w-4 h-4 text-orange-500" />,
};

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    openTool,
    user,
    quota,
    systemSettings,
    setIsUpgradeModalOpen,
    setIsAuthModalOpen,
    setAuthModalTab,
    setIsCommandPaletteOpen,
    theme,
    toggleTheme,
    logout,
    loginAs,
    language,
    setLanguage,
    t,
  } = useApp();

  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isUnlimited = user.plan === 'pro' || user.plan === 'business' || user.role === 'admin';
  const freeLimit = systemSettings.freeDailyLimit || 3;
  const remainingUses = Math.max(0, freeLimit - quota.usedToday);
  const quotaPercent = Math.min(100, (quota.usedToday / freeLimit) * 100);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      {/* Announcement bar */}
      {systemSettings.announcementBanner && (
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-4 py-1 text-center text-xs font-medium text-white shadow-sm flex items-center justify-center gap-2">
          <span>{systemSettings.announcementBanner}</span>
          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="underline hover:text-indigo-100 font-semibold cursor-pointer"
          >
            {t('nav_pricing')}
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                setCurrentView('home');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-500/20" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:via-slate-100 dark:to-indigo-300 bg-clip-text text-transparent">
                    DocuPulse
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    SaaS
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Universal PDF & Image Studio
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Tools Mega Dropdown */}
              <div className="relative" ref={toolsDropdownRef}>
                <button
                  onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    isToolsDropdownOpen || currentView === 'tool'
                      ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>{t('nav_tools')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isToolsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-[540px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 grid grid-cols-2 gap-2 animate-in fade-in-50 zoom-in-95 z-50">
                    {TOOLS_LIST.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          openTool(tool.id);
                          setIsToolsDropdownOpen(false);
                        }}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          {ICON_MAP[tool.iconName] || <FileText className="w-4 h-4 text-indigo-500" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {tool.name}
                            </span>
                            {tool.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {tool.tagline}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setCurrentView('pricing')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  currentView === 'pricing'
                    ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t('nav_pricing')}
              </button>

              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t('nav_dashboard')}
              </button>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Shortcut */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-medium border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t('nav_search_placeholder')}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-[10px] font-semibold text-slate-500 border border-slate-200 dark:border-slate-800 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Daily Free Quotas / Free Trial Badge */}
            {!isUnlimited ? (
              <div
                onClick={() => setIsUpgradeModalOpen(true)}
                className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 cursor-pointer hover:bg-emerald-100/80 dark:hover:bg-emerald-950/50 transition-all group"
                title="Free trial tier: 3 daily free operations. Click to upgrade to Unlimited."
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="text-left">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                    <span>{remainingUses > 0 ? `${remainingUses}/${freeLimit} Free Trial Uses` : 'Trial limit reached'}</span>
                    <Crown className="w-3 h-3 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="w-24 h-1.5 bg-emerald-200/80 dark:bg-emerald-900/60 rounded-full overflow-hidden mt-0.5">
                    <div
                      className={`h-full transition-all duration-300 ${
                        remainingUses === 0 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(10, ((freeLimit - remainingUses) / freeLimit) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                <Crown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-indigo-500/30" />
                <span>{user.role === 'admin' ? t('nav_admin_console') : user.plan === 'business' ? t('nav_business_unlimited') : t('nav_pro_unlimited')}</span>
              </div>
            )}

            {/* Language Switcher Dropdown */}
            <LanguageSelector />

            {/* Upgrade CTA Button */}
            {!isUnlimited && (
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all hover:scale-105 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>{t('nav_go_pro')}</span>
              </button>
            )}

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile / Auth Switcher Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <span className="hidden xl:inline-block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        user.role === 'admin'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                          : user.plan === 'pro'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                          : user.plan === 'business'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {user.role === 'admin' ? 'ADMIN' : user.plan}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  <div className="space-y-1">
                    {/* Authorized Admin Access Option - ONLY for logged-in Admin */}
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setCurrentView('admin');
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-lg text-left transition-colors cursor-pointer border border-rose-200/60 dark:border-rose-900/50"
                      >
                        <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{t('nav_admin_center')}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setCurrentView('dashboard');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                      <span>{t('nav_dashboard')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentView('pricing');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span>{t('nav_pricing')}</span>
                    </button>

                    {user.role !== 'admin' && (
                      <button
                        onClick={() => {
                          setAuthModalTab('admin');
                          setIsAuthModalOpen(true);
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t('nav_staff_admin')}</span>
                      </button>
                    )}

                    <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
                      <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {t('dash_switch_account_title')}
                      </p>
                      <div className="grid grid-cols-1 gap-1 px-1">
                        <button
                          onClick={() => {
                            loginAs('free');
                            setIsUserDropdownOpen(false);
                          }}
                          className={`px-2 py-1.5 rounded text-[11px] font-medium text-left transition-colors cursor-pointer flex items-center justify-between ${
                            user.plan === 'free' && user.role !== 'admin'
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>👤 Alex Morgan</span>
                          <span className="text-[10px] opacity-70">{t('nav_free_user')} (3/day)</span>
                        </button>
                        <button
                          onClick={() => {
                            loginAs('pro');
                            setIsUserDropdownOpen(false);
                          }}
                          className={`px-2 py-1.5 rounded text-[11px] font-medium text-left transition-colors cursor-pointer flex items-center justify-between ${
                            user.plan === 'pro' && user.role !== 'admin'
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>⭐ Sarah Connor</span>
                          <span className="text-[10px] opacity-70">{t('nav_pro_plan')}</span>
                        </button>
                        <button
                          onClick={() => {
                            loginAs('business');
                            setIsUserDropdownOpen(false);
                          }}
                          className={`px-2 py-1.5 rounded text-[11px] font-medium text-left transition-colors cursor-pointer flex items-center justify-between ${
                            user.plan === 'business' && user.role !== 'admin'
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>🏢 David Vance</span>
                          <span className="text-[10px] opacity-70">{t('nav_business_team')}</span>
                        </button>
                        <button
                          onClick={() => {
                            loginAs('admin');
                            setIsUserDropdownOpen(false);
                          }}
                          className={`px-2 py-1.5 rounded text-[11px] font-medium text-left transition-colors cursor-pointer flex items-center justify-between ${
                            user.role === 'admin'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 font-bold'
                              : 'hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          <span>🛡️ Camara (Admin)</span>
                          <span className="text-[10px] opacity-70">{t('nav_admin_console')}</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('nav_sign_out')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu hamburger button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setCurrentView('home');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
            >
              {t('nav_home')}
            </button>
            <button
              onClick={() => {
                setCurrentView('pricing');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
            >
              {t('nav_pricing')}
            </button>
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
            >
              {t('nav_dashboard')}
            </button>
          </div>

          {/* Mobile Language Switcher Row */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-500 mb-2">{t('lang_select')}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-left ${
                    language === lang.code
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-500 mb-2">{t('featured_tools')}</p>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
              {TOOLS_LIST.slice(0, 8).map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    openTool(tool.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-[11px] font-medium text-slate-700 dark:text-slate-300 text-left truncate"
                >
                  {ICON_MAP[tool.iconName]}
                  <span className="truncate">{tool.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
