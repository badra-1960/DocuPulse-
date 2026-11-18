import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  FileType,
  Presentation,
  FileText,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
  Sparkles,
  Archive,
  RefreshCw,
  Layers,
  ArrowRight,
  Check,
  FileCheck,
  Zap,
  FileCode,
} from 'lucide-react';
import {
  convertPdfToExcel,
  convertWordToPdf,
  convertPptToPdf,
  convertExcelToPdf,
  convertDocumentToMarkdown,
  getExcelSheetNames,
  createZipArchive,
  FileConversionStatus,
} from '../../services/conversionEngine';

interface ConversionFeatureCard {
  id: 'pdf-to-excel' | 'word-to-pdf' | 'ppt-to-pdf' | 'excel-to-pdf' | 'doc-to-markdown';
  title: string;
  shortName: string;
  description: string;
  sourceFormats: string;
  targetFormat: 'xlsx' | 'pdf' | 'md';
  targetFormatLabel: string;
  icon: React.ReactNode;
  accentBg: string;
  badgeColor: string;
  badgeText: string;
  highlights: string[];
}

export const PdfConversionSection: React.FC = () => {
  const {
    openTool,
    checkCanPerformOperation,
    recordOperation,
    showToast,
    setIsUpgradeModalOpen,
    user,
    t,
  } = useApp();

  const CONVERSION_CARDS: ConversionFeatureCard[] = [
    {
      id: 'pdf-to-excel',
      title: t('conv_pdf_to_excel_title'),
      shortName: t('conv_pdf_to_excel_short'),
      description: t('conv_pdf_to_excel_desc'),
      sourceFormats: '.pdf',
      targetFormat: 'xlsx',
      targetFormatLabel: 'Excel (.xlsx)',
      icon: <FileSpreadsheet className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />,
      accentBg: 'from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-500',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      badgeText: t('conv_pdf_to_excel_badge'),
      highlights: [
        t('conv_pdf_to_excel_h1'),
        t('conv_pdf_to_excel_h2'),
        t('conv_pdf_to_excel_h3'),
        t('conv_pdf_to_excel_h4'),
      ],
    },
    {
      id: 'word-to-pdf',
      title: t('conv_word_to_pdf_title'),
      shortName: t('conv_word_to_pdf_short'),
      description: t('conv_word_to_pdf_desc'),
      sourceFormats: '.docx,.doc,.txt,.md',
      targetFormat: 'pdf',
      targetFormatLabel: 'PDF Document',
      icon: <FileType className="w-7 h-7 text-sky-600 dark:text-sky-400" />,
      accentBg: 'from-sky-500/10 via-blue-500/5 to-transparent border-sky-200 dark:border-sky-900/40 hover:border-sky-500',
      badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      badgeText: t('conv_word_to_pdf_badge'),
      highlights: [
        t('conv_word_to_pdf_h1'),
        t('conv_word_to_pdf_h2'),
        t('conv_word_to_pdf_h3'),
        t('conv_word_to_pdf_h4'),
      ],
    },
    {
      id: 'ppt-to-pdf',
      title: t('conv_ppt_to_pdf_title'),
      shortName: t('conv_ppt_to_pdf_short'),
      description: t('conv_ppt_to_pdf_desc'),
      sourceFormats: '.pptx,.ppt',
      targetFormat: 'pdf',
      targetFormatLabel: 'PDF Presentation',
      icon: <Presentation className="w-7 h-7 text-orange-600 dark:text-orange-400" />,
      accentBg: 'from-orange-500/10 via-red-500/5 to-transparent border-orange-200 dark:border-orange-900/40 hover:border-orange-500',
      badgeColor: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      badgeText: t('conv_ppt_to_pdf_badge'),
      highlights: [
        t('conv_ppt_to_pdf_h1'),
        t('conv_ppt_to_pdf_h2'),
        t('conv_ppt_to_pdf_h3'),
        t('conv_ppt_to_pdf_h4'),
      ],
    },
    {
      id: 'excel-to-pdf',
      title: t('conv_excel_to_pdf_title'),
      shortName: t('conv_excel_to_pdf_short'),
      description: t('conv_excel_to_pdf_desc'),
      sourceFormats: '.xlsx,.xls,.csv',
      targetFormat: 'pdf',
      targetFormatLabel: 'PDF Spreadsheet',
      icon: <FileSpreadsheet className="w-7 h-7 text-teal-600 dark:text-teal-400" />,
      accentBg: 'from-teal-500/10 via-emerald-500/5 to-transparent border-teal-200 dark:border-teal-900/40 hover:border-teal-500',
      badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      badgeText: t('conv_excel_to_pdf_badge'),
      highlights: [
        t('conv_excel_to_pdf_h1'),
        t('conv_excel_to_pdf_h2'),
        t('conv_excel_to_pdf_h3'),
        t('conv_excel_to_pdf_h4'),
      ],
    },
    {
      id: 'doc-to-markdown',
      title: t('conv_doc_to_md_title'),
      shortName: t('conv_doc_to_md_short'),
      description: t('conv_doc_to_md_desc'),
      sourceFormats: '.pdf,.docx,.xlsx,.xls,.csv,.pptx,.html,.htm,.txt,.json,.md,.png,.jpg,.jpeg,.webp',
      targetFormat: 'md',
      targetFormatLabel: 'Markdown (.md)',
      icon: <FileCode className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />,
      accentBg: 'from-indigo-500/10 via-slate-500/5 to-transparent border-indigo-200 dark:border-indigo-900/40 hover:border-indigo-500',
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      badgeText: t('conv_doc_to_md_badge'),
      highlights: [
        t('conv_doc_to_md_h1'),
        t('conv_doc_to_md_h2'),
        t('conv_doc_to_md_h3'),
        t('conv_doc_to_md_h4'),
      ],
    },
  ];

  const [activeFeature, setActiveFeature] = useState<ConversionFeatureCard['id'] | null>(null);
  const [queue, setQueue] = useState<FileConversionStatus[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);
  const [isZipDownloading, setIsZipDownloading] = useState<boolean>(false);

  // Sheet Selector Modal for Excel to PDF
  const [sheetModalFile, setSheetModalFile] = useState<FileConversionStatus | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheetNames, setSelectedSheetNames] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetCardRef = useRef<ConversionFeatureCard['id']>('pdf-to-excel');

  // Trigger file browser for a card
  const handleOpenFileDialog = (featureId: ConversionFeatureCard['id']) => {
    targetCardRef.current = featureId;
    setActiveFeature(featureId);
    if (fileInputRef.current) {
      const card = CONVERSION_CARDS.find((c) => c.id === featureId);
      fileInputRef.current.accept = card?.sourceFormats || '*';
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Validate and add files to queue
  const handleFilesAdded = async (files: File[], featureId: ConversionFeatureCard['id']) => {
    if (files.length === 0) return;
    setActiveFeature(featureId);

    const card = CONVERSION_CARDS.find((c) => c.id === featureId)!;
    const acceptedExtensions = card.sourceFormats.split(',').map((ext) => ext.trim().toLowerCase());

    const newItems: FileConversionStatus[] = [];

    for (const file of files) {
      const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
      const isFormatAccepted = acceptedExtensions.some((allowed) =>
        allowed.startsWith('.') ? ext === allowed : file.type.includes(allowed.replace('/*', ''))
      );

      const fileId = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;

      if (!isFormatAccepted) {
        newItems.push({
          fileId,
          file,
          targetFormat: card.targetFormat,
          status: 'failed',
          progress: 0,
          statusMessage: `Unsupported file format. Please upload ${card.sourceFormats}.`,
          error: `Invalid format (${ext || 'unknown'}). Expected ${card.sourceFormats}.`,
        });
      } else {
        // Inspect excel sheets if Excel to PDF
        let sheetNames: string[] = [];
        if (featureId === 'excel-to-pdf') {
          sheetNames = await getExcelSheetNames(file);
        }

        newItems.push({
          fileId,
          file,
          targetFormat: card.targetFormat,
          status: 'pending',
          progress: 0,
          statusMessage: 'Ready to convert',
          metadata: {
            sheetNames,
            selectedSheets: sheetNames,
          },
        });
      }
    }

    setQueue((prev) => [...prev, ...newItems]);
  };

  // Handle Drag and Drop on a specific feature card
  const handleCardDrop = (e: React.DragEvent, featureId: ConversionFeatureCard['id']) => {
    e.preventDefault();
    setDragOverCardId(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files) as File[];
      handleFilesAdded(files, featureId);
    }
  };

  // Process a single file in the queue
  const processSingleFile = async (item: FileConversionStatus): Promise<void> => {
    if (!checkCanPerformOperation()) return;

    // Update status to processing
    setQueue((prev) =>
      prev.map((q) =>
        q.fileId === item.fileId
          ? { ...q, status: 'processing', progress: 10, statusMessage: 'Starting conversion...' }
          : q
      )
    );

    const onProgress = (percentage: number, message: string) => {
      setQueue((prev) =>
        prev.map((q) =>
          q.fileId === item.fileId
            ? { ...q, progress: percentage, statusMessage: message }
            : q
        )
      );
    };

    try {
      let outputBlob: Blob;
      let outputFileName = '';
      let pageOrCount = 1;

      if (activeFeature === 'pdf-to-excel') {
        const res = await convertPdfToExcel(item.file, onProgress);
        outputBlob = res.blob;
        outputFileName = res.fileName;
        pageOrCount = res.sheetCount;
      } else if (activeFeature === 'word-to-pdf') {
        const res = await convertWordToPdf(item.file, onProgress);
        outputBlob = res.blob;
        outputFileName = res.fileName;
        pageOrCount = res.pageCount;
      } else if (activeFeature === 'ppt-to-pdf') {
        const res = await convertPptToPdf(item.file, onProgress);
        outputBlob = res.blob;
        outputFileName = res.fileName;
        pageOrCount = res.slideCount;
      } else if (activeFeature === 'excel-to-pdf') {
        const res = await convertExcelToPdf(
          item.file,
          { selectedSheets: item.metadata?.selectedSheets },
          onProgress
        );
        outputBlob = res.blob;
        outputFileName = res.fileName;
        pageOrCount = res.pageCount;
      } else if (item.targetFormat === 'md' || activeFeature === 'doc-to-markdown') {
        const res = await convertDocumentToMarkdown(
          item.file,
          { includeFrontmatter: false, includePageMarkers: true, allowAiOcrFallback: true },
          onProgress
        );
        outputBlob = res.blob;
        outputFileName = res.fileName;
        pageOrCount = res.sectionCount;
      } else {
        throw new Error('Unknown conversion type.');
      }

      const outputUrl = URL.createObjectURL(outputBlob);
      const resolvedToolId = item.targetFormat === 'md' ? 'doc-to-markdown' : activeFeature || 'pdf-to-excel';

      // Record successful operation
      recordOperation(
        resolvedToolId,
        CONVERSION_CARDS.find((c) => c.id === resolvedToolId)?.title || 'PDF Conversion',
        item.file.name,
        item.file.size,
        outputFileName,
        outputBlob.size,
        outputUrl,
        { pagesOrCount: pageOrCount }
      );

      setQueue((prev) =>
        prev.map((q) =>
          q.fileId === item.fileId
            ? {
                ...q,
                status: 'completed',
                progress: 100,
                statusMessage: 'Conversion completed!',
                outputBlob,
                outputUrl,
                outputFileName,
                outputSize: outputBlob.size,
              }
            : q
        )
      );

      showToast(
        'success',
        'Conversion Complete',
        `Successfully converted "${item.file.name}" to ${outputFileName}`
      );
    } catch (err: any) {
      console.error('Conversion failed for item:', item.file.name, err);
      setQueue((prev) =>
        prev.map((q) =>
          q.fileId === item.fileId
            ? {
                ...q,
                status: 'failed',
                progress: 0,
                statusMessage: 'Conversion failed',
                error: err.message || 'An error occurred during conversion.',
              }
            : q
        )
      );

      showToast(
        'error',
        'Conversion Failed',
        `Could not convert "${item.file.name}". ${err.message || 'Please check file format.'}`
      );
    }
  };

  // Convert All Pending Files in Batch
  const handleConvertAll = async () => {
    if (!checkCanPerformOperation()) return;
    const pendingItems = queue.filter((item) => item.status === 'pending');
    if (pendingItems.length === 0) return;

    setIsProcessingBatch(true);
    for (const item of pendingItems) {
      await processSingleFile(item);
    }
    setIsProcessingBatch(false);
  };

  // Download Individual File
  const handleDownloadSingle = (item: FileConversionStatus) => {
    if (!item.outputUrl || !item.outputFileName) return;
    const a = document.createElement('a');
    a.href = item.outputUrl;
    a.download = item.outputFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download All as ZIP Archive
  const handleDownloadAllZip = async () => {
    const completedItems = queue.filter((q) => q.status === 'completed' && q.outputBlob && q.outputFileName);
    if (completedItems.length === 0) {
      showToast(
        'warning',
        'No Files to Package',
        'Please convert at least one file before downloading a ZIP archive.'
      );
      return;
    }

    try {
      setIsZipDownloading(true);
      const zipFiles = completedItems.map((item) => ({
        name: item.outputFileName!,
        blob: item.outputBlob!,
      }));

      const zipBlob = await createZipArchive(zipFiles, `docupulse_${activeFeature || 'converted'}_batch.zip`);
      const zipUrl = URL.createObjectURL(zipBlob);

      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `docupulse_${activeFeature || 'converted'}_${completedItems.length}_files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showToast(
        'success',
        'ZIP Archive Downloaded',
        `Packaged ${completedItems.length} files into a single archive.`
      );
    } catch (err: any) {
      console.error('ZIP generation error:', err);
      showToast('error', 'ZIP Download Failed', err.message || 'Could not package archive.');
    } finally {
      setIsZipDownloading(false);
    }
  };

  const removeQueueItem = (fileId: string) => {
    setQueue((prev) => prev.filter((q) => q.fileId !== fileId));
  };

  const clearCompleted = () => {
    setQueue((prev) => prev.filter((q) => q.status !== 'completed'));
  };

  // Open Sheet Selector modal for Excel files
  const openSheetSelector = (item: FileConversionStatus) => {
    setSheetModalFile(item);
    setAvailableSheets(item.metadata?.sheetNames || ['Sheet1']);
    setSelectedSheetNames(item.metadata?.selectedSheets || item.metadata?.sheetNames || ['Sheet1']);
  };

  const saveSheetSelection = () => {
    if (!sheetModalFile) return;
    setQueue((prev) =>
      prev.map((q) =>
        q.fileId === sheetModalFile.fileId
          ? {
              ...q,
              metadata: {
                ...q.metadata,
                selectedSheets: selectedSheetNames.length > 0 ? selectedSheetNames : availableSheets,
              },
            }
          : q
      )
    );
    setSheetModalFile(null);
  };

  const completedCount = queue.filter((q) => q.status === 'completed').length;
  const pendingCount = queue.filter((q) => q.status === 'pending').length;
  const failedCount = queue.filter((q) => q.status === 'failed').length;

  return (
    <section id="pdf-conversion-tools" className="py-16 md:py-24 bg-slate-50/60 dark:bg-slate-950 transition-colors border-t border-slate-200/80 dark:border-slate-800/80">
      {/* Hidden File Input for Native Dialog */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files) as File[];
            handleFilesAdded(files, targetCardRef.current);
          }
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3.5 border border-indigo-200/60 dark:border-indigo-800/60 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{t('conv_suite_badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('conv_suite_title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            {t('conv_suite_subtitle')}
          </p>
        </div>

        {/* 4 Primary Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CONVERSION_CARDS.slice(0, 4).map((card) => {
            const isDragActive = dragOverCardId === card.id;
            return (
              <div
                key={card.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverCardId(card.id);
                }}
                onDragLeave={() => setDragOverCardId(null)}
                onDrop={(e) => handleCardDrop(e, card.id)}
                className={`group relative p-6 rounded-3xl bg-white dark:bg-slate-900/90 border transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                  isDragActive
                    ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-[1.02] bg-indigo-50/50 dark:bg-indigo-950/30'
                    : card.accentBg
                }`}
              >
                <div>
                  {/* Top Bar: Icon and Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                      {card.icon}
                    </div>

                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                      {card.badgeText}
                    </span>
                  </div>

                  {/* Title and Short description */}
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 mb-2.5">
                    {t('conv_accepts')} {card.sourceFormats.split(',').join(', ')}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Highlights Bullets */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    {card.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dropzone & Upload Button Area */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleOpenFileDialog(card.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-xs font-bold shadow-md transition-all cursor-pointer group-hover:shadow-indigo-500/25"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{t('conv_choose_drop')}</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    {t('conv_drag_hint', { formats: card.sourceFormats })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dedicated Horizontal Feature Card: Document to Markdown (.md) */}
        {(() => {
          const mdCard = CONVERSION_CARDS.find((c) => c.id === 'doc-to-markdown');
          if (!mdCard) return null;
          const isDragActive = dragOverCardId === mdCard.id;
          return (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCardId(mdCard.id);
              }}
              onDragLeave={() => setDragOverCardId(null)}
              onDrop={(e) => handleCardDrop(e, mdCard.id)}
              className={`mt-6 group relative p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/90 border transition-all duration-300 shadow-sm hover:shadow-xl ${
                isDragActive
                  ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-[1.01] bg-indigo-50/50 dark:bg-indigo-950/30'
                  : mdCard.accentBg
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4 max-w-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-110 transition-transform">
                    {mdCard.icon}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {mdCard.title}
                      </h3>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${mdCard.badgeColor}`}>
                        {mdCard.badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {mdCard.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                      {mdCard.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 lg:w-64">
                  <button
                    onClick={() => handleOpenFileDialog(mdCard.id)}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{t('conv_choose_drop')}</span>
                  </button>
                  <button
                    onClick={() => openTool('doc-to-markdown')}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>{t('btn_launch_tool')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Interactive Multi-File Conversion Queue & Progress Section */}
        {queue.length > 0 && (
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Queue Header & Global Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {t('conv_queue_title')} ({queue.length} {queue.length === 1 ? t('conv_file_singular') : t('conv_file_plural')})
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {t('conv_queue_status', { completed: completedCount, total: queue.length })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t('conv_queue_subtitle')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                {/* Convert All Pending Button */}
                {pendingCount > 0 && (
                  <button
                    onClick={handleConvertAll}
                    disabled={isProcessingBatch}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessingBatch ? 'animate-spin' : ''}`} />
                    <span>{isProcessingBatch ? t('btn_converting') : t('conv_convert_all', { count: pendingCount })}</span>
                  </button>
                )}

                {/* Download All as ZIP */}
                {completedCount > 0 && (
                  <button
                    onClick={handleDownloadAllZip}
                    disabled={isZipDownloading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Archive className={`w-3.5 h-3.5 ${isZipDownloading ? 'animate-spin' : ''}`} />
                    <span>{isZipDownloading ? t('btn_packaging_zip') : t('conv_download_zip')}</span>
                  </button>
                )}

                {/* Add More Files Button */}
                <button
                  onClick={() => handleOpenFileDialog(activeFeature || 'pdf-to-excel')}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {t('conv_add_more')}
                </button>

                {/* Clear Completed */}
                <button
                  onClick={() => setQueue([])}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 transition-colors cursor-pointer"
                  title={t('conv_clear_queue')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Individual File Items List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-4">
              {queue.map((item) => {
                const isPending = item.status === 'pending';
                const isProcessing = item.status === 'processing';
                const isCompleted = item.status === 'completed';
                const isFailed = item.status === 'failed';

                return (
                  <div
                    key={item.fileId}
                    className="py-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    {/* Left: File Info & Progress */}
                    <div className="flex-1 w-full min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0">
                          {item.file.name.endsWith('.pdf') ? (
                            <FileText className="w-5 h-5 text-rose-500" />
                          ) : item.file.name.match(/\.(xlsx|xls)$/i) ? (
                            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                          ) : item.file.name.match(/\.(pptx|ppt)$/i) ? (
                            <Presentation className="w-5 h-5 text-orange-500" />
                          ) : (
                            <FileType className="w-5 h-5 text-sky-500" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {item.file.name}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              {(item.file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-0.5">
                            {/* Status Badge */}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-slate-400" />
                                <span>{t('conv_status_pending')}</span>
                              </span>
                            )}
                            {isProcessing && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                <span>{item.statusMessage || t('conv_status_processing')}</span>
                              </span>
                            )}
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{t('conv_status_converted', { name: item.outputFileName || '' })}</span>
                              </span>
                            )}
                            {isFailed && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                <span>{item.error || t('conv_status_failed')}</span>
                              </span>
                            )}

                            {/* Sheet selector toggle for Excel files */}
                            {item.metadata?.sheetNames && item.metadata.sheetNames.length > 1 && (
                              <button
                                onClick={() => openSheetSelector(item)}
                                className="ml-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 underline cursor-pointer hover:text-indigo-800"
                              >
                                {t('conv_sheets_selected', {
                                  selected: item.metadata.selectedSheets?.length || item.metadata.sheetNames.length,
                                  total: item.metadata.sheetNames.length,
                                })}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Individual Progress Bar */}
                      {(isProcessing || (isCompleted && item.progress === 100)) && (
                        <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isCompleted
                                ? 'bg-emerald-500'
                                : 'bg-gradient-to-r from-indigo-500 to-violet-600'
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Right: Action Buttons per File */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      {isPending && (
                        <button
                          onClick={() => processSingleFile(item)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                        >
                          <Zap className="w-3 h-3" />
                          <span>{t('conv_convert_now')}</span>
                        </button>
                      )}

                      {isCompleted && (
                        <button
                          onClick={() => handleDownloadSingle(item)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{t('conv_download_btn', { format: item.outputFileName?.split('.').pop()?.toUpperCase() || '' })}</span>
                        </button>
                      )}

                      {isFailed && (
                        <button
                          onClick={() => processSingleFile(item)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{t('conv_retry_btn')}</span>
                        </button>
                      )}

                      <button
                        onClick={() => removeQueueItem(item.fileId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title={t('btn_delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sheet Selector Modal for Excel Workbooks */}
      {sheetModalFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {t('conv_sheet_modal_title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {t('conv_sheet_modal_desc')} <strong className="text-slate-800 dark:text-slate-200">{sheetModalFile.file.name}</strong>
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {availableSheets.map((sheetName) => {
                const isChecked = selectedSheetNames.includes(sheetName);
                return (
                  <label
                    key={sheetName}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-xs">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                      <span>{sheetName}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSheetNames([...selectedSheetNames, sheetName]);
                        } else {
                          setSelectedSheetNames(selectedSheetNames.filter((s) => s !== sheetName));
                        }
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedSheetNames(availableSheets)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 underline cursor-pointer"
              >
                {t('conv_sheet_select_all')}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSheetModalFile(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t('conv_sheet_cancel')}
                </button>
                <button
                  onClick={saveSheetSelection}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {t('conv_sheet_save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
