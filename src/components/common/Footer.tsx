import React from 'react';
import { useApp } from '../../context/AppContext';
import { TOOLS_LIST } from '../../data/toolsData';
import {
  Zap,
  ShieldCheck,
  Lock,
  Globe,
  Heart,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { openTool, setCurrentView, setIsUpgradeModalOpen } = useApp();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-colors">
      {/* Top Security & Trust Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                256-Bit SSL End-to-End Privacy
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                All client-side operations run locally in your browser. Cloud processing uses encrypted, ephemeral isolated sandbox memory.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Automated 1-Hour File Purge
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Files are strictly never stored permanently or sold. All temporary caches are completely wiped after 60 minutes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                GDPR, HIPAA & ISO Compliant
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Strict data compliance frameworks engineered for legal, healthcare, accounting, and enterprise teams worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Sitemap Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 shadow-md shadow-indigo-500/20">
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                DocuPulse SaaS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              The high-performance online workspace for PDF and image manipulation, intelligent OCR extraction, document compression, and format conversions. Fast, secure, and built for modern teams.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational (99.99%)
              </span>
            </div>
          </div>

          {/* PDF Core Tools */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              PDF Core Tools
            </h5>
            <ul className="space-y-2 text-xs">
              {TOOLS_LIST.filter(t => t.category === 'pdf').map(t => (
                <li key={t.id}>
                  <button
                    onClick={() => openTool(t.id)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
                  >
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Conversion & Images */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Converters & Studio
            </h5>
            <ul className="space-y-2 text-xs">
              {TOOLS_LIST.filter(t => t.category === 'convert' || t.category === 'image').map(t => (
                <li key={t.id}>
                  <button
                    onClick={() => openTool(t.id)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
                  >
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Product & Solutions */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Platform & Legal
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView('pricing')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Pricing & Subscriptions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  User Dashboard & Quota
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Pro Plan ($9/mo)</span>
                </button>
              </li>
              <li>
                <span className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">
                  Privacy Policy & Cookies
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">
                  Terms of Service & SLA
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 DocuPulse SaaS Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for seamless productivity</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
