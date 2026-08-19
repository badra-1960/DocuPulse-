import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const FAQS = [
    {
      q: 'How does the 3 free daily operations limit work?',
      a: 'Every visitor and free starter account is granted 3 free document operations or format conversions per 24-hour cycle. Once you reach 3 operations, you can upgrade to DocuPulse Pro for unlimited daily usage, or wait until midnight for your free credits to automatically replenish.',
    },
    {
      q: 'Are my uploaded files and sensitive PDFs secure and private?',
      a: 'Yes, absolutely. Most PDF manipulations (merging, splitting, rotating, image formatting) happen directly in your web browser memory without ever leaving your device. When AI OCR or cloud compression is invoked, files are transmitted over 256-bit SSL encrypted channels and automatically wiped within 60 minutes.',
    },
    {
      q: 'What is included in the DocuPulse Pro subscription?',
      a: 'Pro unlocks unlimited daily operations across all 12 tools, raises your max file upload size to 200MB (vs 15MB on Free), enables batch processing up to 50 files simultaneously, activates Gemini AI OCR and summarization, and removes all queue wait times.',
    },
    {
      q: 'Can I convert scanned documents and photos into editable Word (.docx) or Text?',
      a: 'Yes! Our AI OCR tool uses high-precision optical character recognition powered by Gemini multimodal intelligence to extract text, tables, and lists from scans and photos, which you can export to Word, CSV, or formatted Markdown.',
    },
    {
      q: 'Can I cancel my subscription at any time?',
      a: 'Yes, you can cancel your monthly or annual subscription with one click from your User Dashboard at any time. You will retain full Pro access until the end of your current billing period with zero cancellation fees.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold mb-3 border border-slate-200 dark:border-slate-800">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Everything you need to know about quotas, privacy, subscriptions, and tools.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/50 dark:border-slate-800/50 pt-3 animate-in fade-in-50 duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
