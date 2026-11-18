import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TOOLS_LIST, CATEGORIES_LIST } from '../../data/toolsData';
import {
  Search,
  ArrowRight,
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
  Check,
  Zap,
  FileSpreadsheet,
  Presentation,
  FileCode,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Layers: <Layers className="w-6 h-6 text-rose-500" />,
  Scissors: <Scissors className="w-6 h-6 text-amber-500" />,
  Minimize2: <Minimize2 className="w-6 h-6 text-emerald-500" />,
  FileImage: <FileImage className="w-6 h-6 text-blue-500" />,
  FilePlus: <FilePlus className="w-6 h-6 text-violet-500" />,
  FileText: <FileText className="w-6 h-6 text-cyan-500" />,
  FileType: <FileType className="w-6 h-6 text-sky-500" />,
  Sliders: <Sliders className="w-6 h-6 text-pink-500" />,
  Sparkles: <Sparkles className="w-6 h-6 text-indigo-500" />,
  Stamp: <Stamp className="w-6 h-6 text-purple-500" />,
  Hash: <Hash className="w-6 h-6 text-slate-500" />,
  RotateCw: <RotateCw className="w-6 h-6 text-orange-500" />,
  FileSpreadsheet: <FileSpreadsheet className="w-6 h-6 text-emerald-600" />,
  Presentation: <Presentation className="w-6 h-6 text-orange-500" />,
  FileCode: <FileCode className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
};

export const ToolGrid: React.FC = () => {
  const { openTool, t } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getCategoryLabel = (catId: string, defaultLabel: string) => {
    switch (catId) {
      case 'all': return t('cat_all');
      case 'pdf': return t('cat_pdf');
      case 'convert': return t('cat_convert');
      case 'image': return t('cat_image');
      case 'ai': return t('cat_ai');
      case 'security': return t('cat_security');
      default: return defaultLabel;
    }
  };

  const getLocalizedBadge = (badge?: string) => {
    if (!badge) return '';
    if (badge === 'Popular') return t('badge_popular');
    if (badge === 'Fast') return t('badge_fast');
    if (badge === 'New') return t('badge_new');
    if (badge === 'AI Powered') return t('badge_ai_powered');
    return badge;
  };

  const getLocalizedTool = (tool: (typeof TOOLS_LIST)[0]) => {
    const prefix = `tool_${tool.id.replace(/-/g, '_')}`;
    const locName = t(`${prefix}_name`);
    const locTag = t(`${prefix}_tagline`);
    const locDesc = t(`${prefix}_desc`);

    return {
      ...tool,
      name: locName !== `${prefix}_name` ? locName : tool.name,
      tagline: locTag !== `${prefix}_tagline` ? locTag : tool.tagline,
      description: locDesc !== `${prefix}_desc` ? locDesc : tool.description,
    };
  };

  const localizedTools = TOOLS_LIST.map(getLocalizedTool);

  const filteredTools = localizedTools.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.features.some((f) => f.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3 border border-indigo-200/60 dark:border-indigo-800/60">
            <Zap className="w-3.5 h-3.5" />
            <span>{t('engine_badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('explore_tools_title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2.5">
            {t('explore_tools_subtitle')}
          </p>
        </div>

        {/* Filter bar: Categories and Search Input */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES_LIST.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span>{getCategoryLabel(cat.id, cat.label)}</span>
                <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedCategory === cat.id
                    ? 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-900'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_tools_placeholder')}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-indigo-500"
            />
          </div>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => openTool(tool.id)}
              className="group relative p-6 rounded-3xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Card Top: Icon & Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    {ICON_MAP[tool.iconName] || <FileText className="w-6 h-6 text-indigo-500" />}
                  </div>

                  {tool.badge && (
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      tool.badge === 'AI Powered'
                        ? 'bg-gradient-to-r from-indigo-500/20 to-pink-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                        : tool.badge === 'Popular'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {getLocalizedBadge(tool.badge)}
                    </span>
                  )}
                </div>

                {/* Name & Tagline */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 mb-2">
                  {tool.tagline}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {tool.description}
                </p>

                {/* Feature bullets */}
                <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                  {tool.features.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button at bottom */}
              <div className="mt-6 pt-3 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                <span>{t('btn_launch_tool')}</span>
                <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              {t('no_tools_found', { term: searchTerm })}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 underline cursor-pointer"
            >
              {t('btn_reset_search')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
