import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UsageQuota,
  HistoryItem,
  Invoice,
  SystemSettings,
  ToastMessage,
  ToolId,
  UserPlan,
  Language,
} from '../types';
import { TRANSLATIONS, TranslationKey, LANGUAGES, loadDictionary } from '../i18n/translations';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Navigation & Views
  currentView: 'home' | 'tool' | 'dashboard' | 'pricing' | 'admin';
  setCurrentView: (view: 'home' | 'tool' | 'dashboard' | 'pricing' | 'admin') => void;
  activeToolId: ToolId | null;
  openTool: (toolId: ToolId) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Language & i18n
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>, fallback?: string) => string;

  // User & Auth
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  login: (email: string, password?: string) => void;
  register: (name: string, email: string) => void;
  loginAdmin: (email: string, password: string) => boolean;
  loginAs: (role: 'free' | 'pro' | 'business' | 'admin') => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'admin';
  setAuthModalTab: (tab: 'login' | 'register' | 'admin') => void;

  // Daily Usage & Quotas (3 operations per day for free tier)
  quota: UsageQuota;
  checkCanPerformOperation: () => boolean;
  recordOperation: (
    toolId: ToolId,
    toolName: string,
    fileName: string,
    fileSize: number,
    outputFileName: string,
    outputSize: number,
    downloadUrl?: string,
    metadata?: Record<string, any>
  ) => void;
  resetDailyQuota: () => void;

  // Subscription & Upgrade Flow
  isUpgradeModalOpen: boolean;
  setIsUpgradeModalOpen: (open: boolean) => void;
  selectedUpgradePlan: UserPlan;
  setSelectedUpgradePlan: (plan: UserPlan) => void;
  upgradeSubscription: (plan: UserPlan, billingCycle?: 'monthly' | 'annual') => void;
  cancelSubscription: () => void;
  invoices: Invoice[];

  // Processing History
  history: HistoryItem[];
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;

  // Admin & System Settings
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;

  // UI Theme & Modals
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr_free_8921',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'user',
  plan: 'free',
  billingCycle: 'monthly',
  memberSince: 'March 2026',
  apiKey: 'dp_live_k8f934j2091m38x',
};

export const DEMO_USERS = {
  free: DEFAULT_USER,
  pro: {
    id: 'usr_pro_1033',
    name: 'Sarah Connor',
    email: 'sarah.connor@designstudio.io',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'pro' as const,
    plan: 'pro' as const,
    billingCycle: 'annual' as const,
    memberSince: 'January 2026',
    apiKey: 'dp_live_pro_9918237192837',
    subscriptionEndDate: '2027-01-15',
  },
  business: {
    id: 'usr_biz_501',
    name: 'David Vance',
    email: 'david@enterprise-apex.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'business' as const,
    plan: 'business' as const,
    billingCycle: 'annual' as const,
    memberSince: 'November 2025',
    organization: 'Apex Digital Global Inc.',
    apiKey: 'dp_live_ent_558833991122',
    subscriptionEndDate: '2027-03-01',
  },
  admin: {
    id: 'usr_admin_001',
    name: 'Camara Badra Ali (Administrator)',
    email: 'admin@docupulse.io',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'admin' as const,
    plan: 'business' as const,
    billingCycle: 'annual' as const,
    memberSince: 'September 2025',
    apiKey: 'dp_root_admin_master_superkey_2026',
  },
};

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  freeDailyLimit: 3,
  maintenanceMode: false,
  allowGuestProcessing: true,
  maxFreeFileSizeMb: 15,
  maxProFileSizeMb: 200,
  enableAiOcr: true,
  announcementBanner: '🚀 Launch Special: Get 50% off DocuPulse Pro with code LAUNCH50 at checkout!',
};

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_8901',
    invoiceNumber: 'INV-2026-0089',
    date: '2026-08-01',
    amount: 9.0,
    plan: 'Pro Plan (Monthly)',
    status: 'Paid',
    paymentMethod: 'Visa •••• 4242',
  },
  {
    id: 'inv_8722',
    invoiceNumber: 'INV-2026-0072',
    date: '2026-07-01',
    amount: 9.0,
    plan: 'Pro Plan (Monthly)',
    status: 'Paid',
    paymentMethod: 'Visa •••• 4242',
  },
];

const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: 'hist_1',
    toolId: 'merge-pdf',
    toolName: 'Merge PDF',
    fileName: 'Quarterly_Report_Q1_Q2.pdf',
    fileSize: 4200000,
    outputFileName: 'Quarterly_Report_Merged.pdf',
    outputSize: 3900000,
    timestamp: Date.now() - 1000 * 60 * 45,
    status: 'completed',
    pagesOrCount: 14,
  },
  {
    id: 'hist_2',
    toolId: 'compress-pdf',
    toolName: 'Compress PDF',
    fileName: 'Product_Catalog_2026_HighRes.pdf',
    fileSize: 18500000,
    outputFileName: 'Product_Catalog_2026_Compressed.pdf',
    outputSize: 6200000,
    timestamp: Date.now() - 1000 * 60 * 180,
    status: 'completed',
    pagesOrCount: 32,
  },
  {
    id: 'hist_3',
    toolId: 'image-converter',
    toolName: 'Image Converter',
    fileName: 'Hero_Banner_Visual.png',
    fileSize: 3100000,
    outputFileName: 'Hero_Banner_Optimized.webp',
    outputSize: 420000,
    timestamp: Date.now() - 1000 * 60 * 360,
    status: 'completed',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<'home' | 'tool' | 'dashboard' | 'pricing' | 'admin'>('home');
  const [activeToolId, setActiveToolId] = useState<ToolId | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & UI
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<UserPlan>('pro');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'admin'>('login');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  // User State
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('docupulse_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  // Settings
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('docupulse_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SYSTEM_SETTINGS;
  });

  // Daily Usage Quota State
  const [quota, setQuota] = useState<UsageQuota>(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem('docupulse_quota');
    if (saved) {
      const parsed: UsageQuota = JSON.parse(saved);
      if (parsed.date === today) {
        return parsed;
      }
    }
    return {
      date: today,
      usedToday: 0,
      limitToday: systemSettings.freeDailyLimit || 3,
      totalLifetimeOperations: 24,
      totalBytesSaved: 48200000,
    };
  });

  // History & Invoices
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('docupulse_history');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('docupulse_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Language State with Browser Detection & Persistence
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('docupulse_language');
    if (saved && (saved === 'en' || saved === 'fr' || saved === 'es' || saved === 'de')) {
      return saved as Language;
    }
    // Automatically detect browser language for first-time visitors (fallback English)
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('fr')) return 'fr';
      if (browserLang.startsWith('es')) return 'es';
      if (browserLang.startsWith('de')) return 'de';
    }
    return 'en';
  });

  const [activeDictionaries, setActiveDictionaries] = useState<Record<Language, Record<string, string>>>(TRANSLATIONS);

  // Dynamic language switcher: updates state reactively without page reload
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('docupulse_language', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }

    // Load JSON dictionary asynchronously without page reload
    loadDictionary(lang).then((dict) => {
      setActiveDictionaries((prev) => ({
        ...prev,
        [lang]: dict,
      }));
    });

    const langObj = LANGUAGES.find((l) => l.code === lang);
    const langName = langObj ? `${langObj.flag} ${langObj.nativeName}` : lang;
    const currentDict = activeDictionaries[lang] || TRANSLATIONS[lang] || TRANSLATIONS.en;
    showToast('info', currentDict.toast_language_changed || 'Language Changed', `${langName}`);
  };

  // Translation lookup helper:
  // Returns translation string, interpolated with params if provided.
  // If key is missing in active dictionary & fallback dictionary, returns fallback (default ''), NEVER the technical key name!
  const t = (
    key: TranslationKey | string,
    params?: Record<string, string | number>,
    fallback: string = ''
  ): string => {
    const dict = activeDictionaries[language] || TRANSLATIONS[language] || TRANSLATIONS.en;
    let val: string | undefined = dict ? dict[key as string] : undefined;

    // If key not found in active language, try English fallback dictionary
    if (val === undefined || val === null || val === '') {
      const fallbackDict = activeDictionaries['en'] || TRANSLATIONS.en;
      val = fallbackDict ? fallbackDict[key as string] : undefined;
    }

    // CRITICAL REQUIREMENT: If still not found, NEVER return the technical key string (e.g. 'plan_pro_name').
    // Return empty string "" or the provided fallback (e.g. '...')
    if (val === undefined || val === null) {
      return fallback;
    }

    let result = String(val);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return result;
  };

  // Persist user and settings
  useEffect(() => {
    localStorage.setItem('docupulse_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('docupulse_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    localStorage.setItem('docupulse_quota', JSON.stringify(quota));
  }, [quota]);

  useEffect(() => {
    localStorage.setItem('docupulse_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('docupulse_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('docupulse_language', language);
  }, [language]);

  // Sync theme class to documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Keyboard shortcut for Cmd+K command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openTool = (toolId: ToolId) => {
    setActiveToolId(toolId);
    setCurrentView('tool');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if current user can perform a tool operation (3 operations free daily limit)
  const checkCanPerformOperation = (): boolean => {
    if (user.plan === 'pro' || user.plan === 'business' || user.role === 'admin') {
      return true; // Unlimited
    }

    const today = new Date().toISOString().split('T')[0];
    const currentUsed = quota.date === today ? quota.usedToday : 0;
    const limit = systemSettings.freeDailyLimit || 3;

    if (currentUsed >= limit) {
      setSelectedUpgradePlan('pro');
      setIsUpgradeModalOpen(true);
      showToast(
        'warning',
        'Daily Free Limit Reached',
        `You have used your ${limit} free operations for today. Upgrade to DocuPulse Pro for unlimited daily conversions!`
      );
      return false;
    }

    return true;
  };

  // Record a completed operation
  const recordOperation = (
    toolId: ToolId,
    toolName: string,
    fileName: string,
    fileSize: number,
    outputFileName: string,
    outputSize: number,
    downloadUrl?: string,
    metadata?: Record<string, any>
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const savedBytes = Math.max(0, fileSize - outputSize);

    setQuota((prev) => {
      const isSameDay = prev.date === today;
      return {
        date: today,
        usedToday: (isSameDay ? prev.usedToday : 0) + 1,
        limitToday: user.plan === 'free' ? systemSettings.freeDailyLimit : 999999,
        totalLifetimeOperations: prev.totalLifetimeOperations + 1,
        totalBytesSaved: prev.totalBytesSaved + savedBytes,
      };
    });

    const newHistoryItem: HistoryItem = {
      id: 'hist_' + Date.now(),
      toolId,
      toolName,
      fileName,
      fileSize,
      outputFileName,
      outputSize,
      downloadUrl,
      timestamp: Date.now(),
      status: 'completed',
      metadata,
    };

    setHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]); // keep latest 50
  };

  const resetDailyQuota = () => {
    const today = new Date().toISOString().split('T')[0];
    setQuota((prev) => ({
      ...prev,
      date: today,
      usedToday: 0,
    }));
    showToast('success', 'Quota Reset', 'Your daily free operation quota has been refreshed to 0/3.');
  };

  // Upgrade subscription flow
  const upgradeSubscription = (plan: UserPlan, billingCycle: 'monthly' | 'annual' = 'monthly') => {
    const planName = plan === 'pro' ? 'DocuPulse Pro' : 'Enterprise & Teams';
    const amount = plan === 'pro' ? (billingCycle === 'annual' ? 84.0 : 9.0) : (billingCycle === 'annual' ? 228.0 : 24.0);

    setUser((prev) => ({
      ...prev,
      plan,
      role: plan === 'pro' ? 'pro' : 'business',
      billingCycle,
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    }));

    const newInvoice: Invoice = {
      id: 'inv_' + Date.now(),
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      amount,
      plan: plan === 'pro' ? (billingCycle === 'annual' ? 'Pro Plan (Annual)' : 'Pro Plan (Monthly)') : (billingCycle === 'annual' ? 'Business Plan (Annual)' : 'Business Plan (Monthly)'),
      status: 'Paid',
      paymentMethod: 'Mastercard •••• 8842',
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setIsUpgradeModalOpen(false);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore
    }

    showToast('success', `Welcome to ${planName}!`, 'Your account now has unlimited operations, batch processing, and AI tools active.');
  };

  // User standard login
  const login = (email: string, _password?: string) => {
    // Check if it's admin email attempt
    if (email.toLowerCase() === 'admin@docupulse.io' || email.toLowerCase() === 'camarabadraalicamara@gmail.com') {
      showToast('info', 'Admin Verification Required', 'Please sign in through the Admin Portal with your password.');
      setAuthModalTab('admin');
      setIsAuthModalOpen(true);
      return;
    }

    const userName = email.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

    setUser({
      id: 'usr_' + Date.now().toString(36),
      name: formattedName || 'Alex Morgan',
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'user',
      plan: 'free',
      billingCycle: 'monthly',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    });

    setIsAuthModalOpen(false);
    showToast('success', 'Welcome back!', `Signed in as ${email}`);
  };

  // User standard registration
  const register = (name: string, email: string) => {
    setUser({
      id: 'usr_' + Date.now().toString(36),
      name: name.trim() || 'Alex Morgan',
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'user',
      plan: 'free',
      billingCycle: 'monthly',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    });

    setIsAuthModalOpen(false);
    showToast('success', 'Account Created', `Welcome to DocuPulse, ${name}! You have 3 free operations daily.`);
  };

  // Admin-only authentication with credentials
  const loginAdmin = (email: string, password: string): boolean => {
    const validEmails = ['admin@docupulse.io', 'camarabadraalicamara@gmail.com'];
    const validPasswords = ['Admin@DocuPulse2026!', 'admin123', 'admin2026'];

    const isEmailValid = validEmails.includes(email.trim().toLowerCase());
    const isPasswordValid = validPasswords.includes(password.trim());

    if (isEmailValid && isPasswordValid) {
      setUser({
        id: 'usr_admin_001',
        name: 'Camara Badra Ali (Administrator)',
        email: email.trim().toLowerCase(),
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        role: 'admin',
        plan: 'business',
        billingCycle: 'annual',
        memberSince: 'September 2025',
        apiKey: 'dp_root_admin_master_superkey_2026',
      });

      setIsAuthModalOpen(false);
      setCurrentView('admin');
      showToast('success', 'Admin Access Granted', 'Authenticated as System Administrator. Admin Panel opened.');
      return true;
    } else {
      showToast('error', 'Authentication Failed', 'Invalid admin email or password. Access denied.');
      return false;
    }
  };

  // Fast demo switcher for roles & accounts
  const loginAs = (role: 'free' | 'pro' | 'business' | 'admin') => {
    if (role === 'admin') {
      setUser(DEMO_USERS.admin);
      setCurrentView('admin');
      showToast('success', t('toast_admin_granted'), 'Authenticated as Master System Administrator.');
    } else {
      if (currentView === 'admin') {
        setCurrentView('home');
      }
      if (role === 'free') {
        setUser(DEMO_USERS.free);
        showToast('info', t('toast_account_switched'), 'Logged in as Free Starter user (3 daily ops limit).');
      } else if (role === 'pro') {
        setUser(DEMO_USERS.pro);
        showToast('success', t('toast_account_switched'), 'Logged in as DocuPulse Pro Subscriber (Unlimited operations).');
      } else if (role === 'business') {
        setUser(DEMO_USERS.business);
        showToast('success', t('toast_account_switched'), 'Logged in as Enterprise Team Subscriber.');
      }
    }
    setIsAuthModalOpen(false);
  };

  const cancelSubscription = () => {
    setUser((prev) => ({
      ...prev,
      plan: 'free',
      role: 'user',
      subscriptionEndDate: undefined,
    }));
    showToast('info', t('toast_sub_cancelled'), t('toast_sub_cancelled_msg'));
  };

  const logout = () => {
    if (currentView === 'admin') {
      setCurrentView('home');
    }
    setUser({
      ...DEFAULT_USER,
      name: 'Guest User',
      email: 'guest@docupulse.app',
      plan: 'free',
      role: 'user',
    });
    showToast('info', t('toast_logged_out'), 'You are now operating in guest session.');
  };

  const updateSystemSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('success', 'Settings Saved', 'System configurations updated successfully.');
  };

  const clearHistory = () => {
    setHistory([]);
    showToast('info', 'History Cleared', 'Your local conversion history has been wiped.');
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    showToast('info', 'File Removed', 'Item removed from your processing log.');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeToolId,
        openTool,
        searchQuery,
        setSearchQuery,
        language,
        setLanguage,
        t,
        user,
        setUser,
        login,
        register,
        loginAdmin,
        loginAs,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        quota,
        checkCanPerformOperation,
        recordOperation,
        resetDailyQuota,
        isUpgradeModalOpen,
        setIsUpgradeModalOpen,
        selectedUpgradePlan,
        setSelectedUpgradePlan,
        upgradeSubscription,
        cancelSubscription,
        invoices,
        history,
        clearHistory,
        deleteHistoryItem,
        systemSettings,
        updateSystemSettings,
        theme,
        toggleTheme,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
