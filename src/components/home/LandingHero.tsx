import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  UploadCloud,
  FileText,
  FileImage,
  ArrowRight,
  Shield,
  Zap,
  Layers,
  Minimize2,
  CheckCircle,
  Lock,
  FileCode,
} from 'lucide-react';

export const LandingHero: React.FC = () => {
  const { openTool, setIsUpgradeModalOpen, quota, user, systemSettings, t } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUnlimited = user.plan === 'pro' || user.plan === 'business' || user.role === 'admin';
  const freeLimit = systemSettings.freeDailyLimit || 3;
  const remainingOps = Math.max(0, freeLimit - quota.usedToday);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      routeFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      routeFile(file);
    }
  };

  // Smart routing based on dropped file type
  const routeFile = (file: File) => {
    const name = file.name.toLowerCase();
    const type = file.type;

    if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
      openTool('excel-to-pdf');
    } else if (name.endsWith('.pptx') || name.endsWith('.ppt')) {
      openTool('ppt-to-pdf');
    } else if (name.endsWith('.docx') || name.endsWith('.doc')) {
      openTool('word-to-pdf');
    } else if (name.endsWith('.html') || name.endsWith('.htm') || name.endsWith('.txt') || name.endsWith('.json')) {
      openTool('doc-to-markdown');
    } else if (type.startsWith('image/')) {
      openTool('image-to-pdf');
    } else if (name.endsWith('.pdf') || type === 'application/pdf') {
      openTool('pdf-to-excel');
    } else {
      openTool('merge-pdf');
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-400/15 via-violet-400/15 to-pink-400/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('hero_badge')}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {t('hero_ai_badge')}
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
          {t('hero_headline_1')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600">
            {t('hero_headline_gradient')}
          </span>{' '}
          {t('hero_headline_2')}
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t('hero_subtitle')}
        </p>

        {/* Smart Dropzone Hub */}
        <div className="mt-10 max-w-2xl mx-auto">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-8 sm:p-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl ${
              isDragging
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.02]'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-2xl'
            }`}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>

              {/* Explicit Action Label under the Icon */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs sm:text-sm mb-2 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <span>{t('hero_action_upload_btn', undefined, 'Déposer vos fichiers ou commencer la conversion')}</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t('hero_drop_title')}{' '}
                <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-400 decoration-2 underline-offset-4">
                  {t('hero_browse_files')}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                {t('hero_drop_subtitle')}
              </p>

              {/* Free Quotas Indicator within Hero */}
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                {isUnlimited ? (
                  <span>{t('hero_unlimited_active')}</span>
                ) : (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('hero_free_remaining', { remaining: remainingOps, limit: freeLimit }),
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            {t('hero_quick_launch')}
          </span>
          {[
            { id: 'pdf-to-excel', label: 'PDF to Excel', icon: <FileText className="w-3.5 h-3.5 text-emerald-500" /> },
            { id: 'word-to-pdf', label: 'Word to PDF', icon: <FileText className="w-3.5 h-3.5 text-blue-500" /> },
            { id: 'doc-to-markdown', label: 'Doc to Markdown', icon: <FileCode className="w-3.5 h-3.5 text-indigo-500" /> },
            { id: 'merge-pdf', label: 'Merge PDF', icon: <Layers className="w-3.5 h-3.5 text-rose-500" /> },
            { id: 'compress-pdf', label: 'Compress PDF', icon: <Minimize2 className="w-3.5 h-3.5 text-emerald-500" /> },
            { id: 'image-to-pdf', label: 'Image to PDF', icon: <FileImage className="w-3.5 h-3.5 text-violet-500" /> },
            { id: 'ai-ocr', label: 'AI OCR & Scan', icon: <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => openTool(item.id as any)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs transition-all cursor-pointer"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Enterprise Privacy & Technical Architecture Guarantees */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
              <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {t('hero_stat_docs_count')}
              </p>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('hero_stat_docs_label')}
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
              <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {t('hero_stat_sla_count')}
              </p>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('hero_stat_sla_label')}
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {t('hero_stat_speed_count')}
              </p>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('hero_stat_speed_label')}
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-violet-500 shrink-0" />
              <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {t('hero_stat_security_count')}
              </p>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('hero_stat_security_label')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
