import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TOOLS_LIST } from '../../data/toolsData';
import {
  Search,
  X,
  Layers,
  Scissors,
  Minimize2,
  FileImage,
  FilePlus,
  FileText,
  FileType,
  Sliders,
  Sparkles,
  Stamp,
  Hash,
  RotateCw,
  LayoutDashboard,
  Crown,
  ShieldAlert,
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

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    openTool,
    setCurrentView,
    setIsUpgradeModalOpen,
    user,
    t,
  } = useApp();

  const [query, setQuery] = useState('');

  const getToolTitle = (id: string, fallback: string) => {
    const key = `tool_${id.replace(/-/g, '_')}_name`;
    const translated = t(key);
    return translated !== key ? translated : fallback;
  };

  const getToolTagline = (id: string, fallback: string) => {
    const key = `tool_${id.replace(/-/g, '_')}_desc`;
    const translated = t(key);
    return translated !== key ? translated : fallback;
  };

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredTools = TOOLS_LIST.filter((tool) => {
    const localizedName = getToolTitle(tool.id, tool.name).toLowerCase();
    const localizedTagline = getToolTagline(tool.id, tool.tagline).toLowerCase();
    const q = query.toLowerCase();
    return (
      localizedName.includes(q) ||
      localizedTagline.includes(q) ||
      tool.name.toLowerCase().includes(q) ||
      tool.tagline.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Input bar */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('tools_search_placeholder')}
            autoFocus
            className="w-full px-3 py-4 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('featured_tools')} ({filteredTools.length})
          </p>

          {filteredTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                openTool(tool.id);
                setIsCommandPaletteOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  {ICON_MAP[tool.iconName] || <FileText className="w-4 h-4 text-indigo-500" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {getToolTitle(tool.id, tool.name)}
                    </span>
                    {tool.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {getToolTagline(tool.id, tool.tagline)}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                Launch →
              </span>
            </button>
          ))}

          {filteredTools.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching tools found for "{query}".
            </div>
          )}

          {/* Quick System Navigation */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('nav_tools')}
            </p>
            <div className="grid grid-cols-2 gap-1 px-1">
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  setIsCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                <span>{t('nav_dashboard')}</span>
              </button>
              <button
                onClick={() => {
                  setIsUpgradeModalOpen(true);
                  setIsCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left cursor-pointer"
              >
                <Crown className="w-4 h-4 text-amber-500" />
                <span>{t('nav_upgrade')}</span>
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={() => {
                    setCurrentView('admin');
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left cursor-pointer col-span-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{t('nav_admin')}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px]">
              ↑↓
            </kbd>
            <span>Select:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px]">
              Enter
            </kbd>
          </div>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
