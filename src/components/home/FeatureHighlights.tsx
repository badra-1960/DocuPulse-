import React from 'react';
import {
  Zap,
  Shield,
  Sparkles,
  Layers,
  Cpu,
  RefreshCw,
  FolderLock,
  Workflow,
} from 'lucide-react';

export const FeatureHighlights: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Engineered for speed, privacy, and precision
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3">
            Why millions of professionals, attorneys, researchers, and creators rely on DocuPulse daily.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Instant Local Processing
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Most operations run client-side in your web browser via WebAssembly & Web Workers, eliminating slow upload wait times.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <FolderLock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Zero Data Retention
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your files belong to you. We do not read, index, or store your documents. All temporary cache buffers auto-destruct within 60 minutes.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/80 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Gemini AI Intelligence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              State-of-the-art multimodal AI reads degraded scans, extracts complex financial tables, and produces executive summaries in seconds.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
              <Workflow className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Simultaneous Batch Workflows
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Process dozens of files concurrently. Reorder pages with tactile drag-and-drop, customize presets, and download as zipped packages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
