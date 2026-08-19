import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { TOOLS_LIST } from '../../data/toolsData';
import { ToolId } from '../../types';
import {
  mergePdfs,
  splitPdf,
  compressPdf,
  pdfToImages,
  imagesToPdf,
  pdfToWord,
  wordToPdf,
  watermarkPdf,
  addPageNumbers,
  rotatePdfPages,
} from '../../services/pdfEngine';
import { processImageFile, batchProcessImages } from '../../services/imageEngine';
import { extractDocumentWithAi, analyzeDocumentText } from '../../services/aiService';
import {
  UploadCloud,
  ArrowLeft,
  Download,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileText,
  FileImage,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Lock,
  Layers,
  Scissors,
  Minimize2,
  Sliders,
  Stamp,
  Hash,
  RotateCw,
  FileType,
  Crown,
} from 'lucide-react';

export const ToolWorkspace: React.FC = () => {
  const {
    activeToolId,
    setCurrentView,
    openTool,
    checkCanPerformOperation,
    recordOperation,
    showToast,
    setIsUpgradeModalOpen,
    user,
    quota,
    systemSettings,
  } = useApp();

  const tool = TOOLS_LIST.find((t) => t.id === activeToolId) || TOOLS_LIST[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // General State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState<string>('');
  const [resultMetadata, setResultMetadata] = useState<Record<string, any>>({});
  const [copiedText, setCopiedText] = useState(false);

  // Tool Specific Options
  // Split
  const [splitMode, setSplitMode] = useState<'range' | 'all'>('range');
  const [pageRange, setPageRange] = useState<string>('1-1');

  // Compress
  const [compressPreset, setCompressPreset] = useState<'extreme' | 'recommended' | 'low'>('recommended');

  // PDF to Image
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [imageDpi, setImageDpi] = useState<number>(150);
  const [renderedPages, setRenderedPages] = useState<{ pageNum: number; dataUrl: string; blob: Blob }[]>([]);

  // Image to PDF
  const [pageOrientation, setPageOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [pageSize, setPageSize] = useState<'A4' | 'letter' | 'fit'>('A4');
  const [pageMargin, setPageMargin] = useState<number>(10);

  // Image Converter & Studio
  const [targetImageFormat, setTargetImageFormat] = useState<'png' | 'jpeg' | 'webp' | 'svg' | 'bmp' | 'gif'>('webp');
  const [imageQuality, setImageQuality] = useState<number>(0.85);
  const [resizeMode, setResizeMode] = useState<'original' | 'percentage' | 'custom'>('original');
  const [resizePercentage, setResizePercentage] = useState<number>(75);
  const [customWidth, setCustomWidth] = useState<number>(1200);
  const [customHeight, setCustomHeight] = useState<number>(800);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [imageFilter, setImageFilter] = useState<'none' | 'grayscale' | 'bw_document' | 'high_contrast' | 'sepia'>('none');
  const [imageRotation, setImageRotation] = useState<0 | 90 | 180 | 270>(0);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // AI OCR
  const [aiTask, setAiTask] = useState<'ocr' | 'summarize' | 'table' | 'translate'>('ocr');
  const [aiLanguage, setAiLanguage] = useState<string>('English');
  const [aiExtractedText, setAiExtractedText] = useState<string>('');

  // Watermark
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.35);
  const [watermarkAngle, setWatermarkAngle] = useState<number>(45);
  const [watermarkFontSize, setWatermarkFontSize] = useState<number>(44);
  const [watermarkColor, setWatermarkColor] = useState<string>('#dc2626');

  // Page Numbers
  const [numPosition, setNumPosition] = useState<'bottom-center' | 'bottom-right' | 'top-right'>('bottom-center');
  const [numFormat, setNumFormat] = useState<'page-x-of-y' | 'x'>('page-x-of-y');

  // Rotate PDF
  const [pdfRotateDegrees, setPdfRotateDegrees] = useState<number>(90);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      const isUnlimited = user.plan === 'pro' || user.plan === 'business' || user.role === 'admin';
      const maxAllowed = isUnlimited ? tool.maxFilesPro : tool.maxFilesFree;

      if (tool.id === 'merge-pdf' || tool.id === 'image-to-pdf') {
        const combined = [...selectedFiles, ...files].slice(0, maxAllowed);
        setSelectedFiles(combined);
      } else {
        setSelectedFiles(files.slice(0, 1));
      }

      // Reset previous results
      setResultBlob(null);
      setResultUrl(null);
      setRenderedPages([]);
      setAiExtractedText('');

      // If single image, generate preview URL
      const first = files[0];
      if (first && first.type.startsWith('image/')) {
        const url = URL.createObjectURL(first);
        setImagePreviewUrl(url);
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= selectedFiles.length) return;
    const copy = [...selectedFiles];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setSelectedFiles(copy);
  };

  // Main Action Trigger
  const handleExecuteOperation = async () => {
    if (selectedFiles.length === 0) {
      showToast('warning', 'No File Selected', 'Please upload a document to proceed.');
      return;
    }

    // Enforce 3 free daily uses ceiling
    if (!checkCanPerformOperation()) {
      return;
    }

    setIsProcessing(true);
    setProgressPercent(10);
    setProgressStatus('Initializing engine...');

    try {
      const firstFile = selectedFiles[0];

      if (tool.id === 'merge-pdf') {
        const res = await mergePdfs(selectedFiles, (p, s) => {
          setProgressPercent(p);
          setProgressStatus(s);
        });
        const url = URL.createObjectURL(res.blob);
        setResultBlob(res.blob);
        setResultUrl(url);
        const outName = 'Merged_Document_DocuPulse.pdf';
        setResultFileName(outName);
        setResultMetadata({ pages: res.pageCount, size: res.size });

        recordOperation(
          'merge-pdf',
          'Merge PDF',
          `${selectedFiles.length} PDF Documents`,
          selectedFiles.reduce((acc, f) => acc + f.size, 0),
          outName,
          res.size,
          url,
          { pages: res.pageCount }
        );
      } else if (tool.id === 'split-pdf') {
        const res = await splitPdf(firstFile, splitMode, pageRange, (p, s) => {
          setProgressPercent(p);
          setProgressStatus(s);
        });
        const url = URL.createObjectURL(res.blob);
        setResultBlob(res.blob);
        setResultUrl(url);
        setResultFileName(res.fileName);
        setResultMetadata({ pages: res.extractedPages, isZip: res.isZip });

        recordOperation('split-pdf', 'Split PDF', firstFile.name, firstFile.size, res.fileName, res.blob.size, url);
      } else if (tool.id === 'compress-pdf') {
        const res = await compressPdf(firstFile, compressPreset, (p, s) => {
          setProgressPercent(p);
          setProgressStatus(s);
        });
        const url = URL.createObjectURL(res.blob);
        setResultBlob(res.blob);
        setResultUrl(url);
        const outName = firstFile.name.replace(/\.pdf$/i, '_compressed.pdf');
        setResultFileName(outName);
        setResultMetadata({
          originalSize: res.originalSize,
          newSize: res.newSize,
          savedPercentage: res.savedPercentage,
        });

        recordOperation(
          'compress-pdf',
          'Compress PDF',
          firstFile.name,
          res.originalSize,
          outName,
          res.newSize,
          url,
          { saved: res.savedPercentage }
        );
      } else if (tool.id === 'pdf-to-image') {
        const res = await pdfToImages(firstFile, imageFormat, imageDpi, (p, s) => {
          setProgressPercent(p);
          setProgressStatus(s);
        });
        setRenderedPages(res.images);
        if (res.zipBlob) {
          const url = URL.createObjectURL(res.zipBlob);
          setResultBlob(res.zipBlob);
          setResultUrl(url);
          const outName = `${firstFile.name.replace(/\.pdf$/i, '')}_images.zip`;
          setResultFileName(outName);

          recordOperation(
            'pdf-to-image',
            'PDF to Image',
            firstFile.name,
            firstFile.size,
            outName,
            res.zipBlob.size,
            url,
            { count: res.images.length }
          );
        }
      } else if (tool.id === 'image-to-pdf') {
        const imageItems = selectedFiles.map((file) => ({
          file,
          orientation: pageOrientation,
          pageSize,
          margin: pageMargin,
        }));
        const res = await imagesToPdf(imageItems, (p, s) => {
          setProgressPercent(p);
          setProgressStatus(s);
        });
        const url = URL.createObjectURL(res.blob);
        setResultBlob(res.blob);
        setResultUrl(url);
        const outName = 'Images_Compiled_DocuPulse.pdf';
        setResultFileName(outName);
        setResultMetadata({ pages: res.pageCount, size: res.size });

        recordOperation(
          'image-to-pdf',
          'Image to PDF',
          `${selectedFiles.length} Photos`,
          selectedFiles.reduce((acc, f) => acc + f.size, 0),
          outName,
          res.size,
          url,
          { count: res.pageCount }
        );
      } else if (tool.id === 'pdf-to-word') {
        const res = await pdfToWord(firstFile, (p, s) => {
          setProgressPercent(p);
          setProgressStatus(s);
        });
        const url = URL.createObjectURL(res.blob);
        setResultBlob(res.blob);
        setResultUrl(url);
        setResultFileName(res.fileName);
        setResultMetadata({ words: res.wordCount });

        recordOperation('pdf-to-word', 'PDF to Word', firstFile.name, firstFile.size, res.fileName, res.blob.size, url);
      } else if (tool.id === 'word-to-pdf') {
        const res = await wordToPdf(firstFile, (p, s) => {
          setProgressPercent(p);
          setProgressStatus(s);
        });
        const url = URL.createObjectURL(res.blob);
        setResultBlob(res.blob);
        setResultUrl(url);
        setResultFileName(res.fileName);

        recordOperation('word-to-pdf', 'Word to PDF', firstFile.name, firstFile.size, res.fileName, res.blob.size, url);
      } else if (tool.id === 'image-converter') {
        const res = await processImageFile(
          firstFile,
          {
            format: targetImageFormat,
            quality: imageQuality,
            resizeMode,
            percentage: resizePercentage,
            width: customWidth,
            height: customHeight,
            maintainAspectRatio: maintainAspect,
            filter: imageFilter,
            rotation: imageRotation,
          },
          (p, s) => {
            setProgressPercent(p);
            setProgressStatus(s);
          }
        );
        const url = URL.createObjectURL(res.blob);
        setResultBlob(res.blob);
        setResultUrl(url);
        const ext = targetImageFormat === 'jpeg' ? 'jpg' : targetImageFormat;
        const outName = `${firstFile.name.replace(/\.[^/.]+$/, '')}_converted.${ext}`;
        setResultFileName(outName);
        setResultMetadata({
          width: res.width,
          height: res.height,
          originalSize: res.originalSize,
          newSize: res.newSize,
        });

        recordOperation('image-converter', 'Image Converter', firstFile.name, res.originalSize, outName, res.newSize, url);
      } else if (tool.id === 'ai-ocr') {
        setProgressPercent(30);
        setProgressStatus('Scanning visual document with Gemini AI...');

        const aiRes = await extractDocumentWithAi(firstFile, aiTask, aiLanguage);
        setProgressPercent(90);
        setProgressStatus('Formatting extracted text...');

        setAiExtractedText(aiRes.text);
        const textBlob = new Blob([aiRes.text], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(textBlob);
        setResultBlob(textBlob);
        setResultUrl(url);
        const outName = `${firstFile.name.replace(/\.[^/.]+$/, '')}_extracted.md`;
        setResultFileName(outName);

        recordOperation(
          'ai-ocr',
          'AI OCR & Intelligence',
          firstFile.name,
          firstFile.size,
          outName,
          textBlob.size,
          url,
          { words: aiRes.metadata?.words }
        );
      } else if (tool.id === 'watermark-pdf') {
        const res = await watermarkPdf(
          firstFile,
          watermarkText,
          {
            opacity: watermarkOpacity,
            angle: watermarkAngle,
            fontSize: watermarkFontSize,
            colorHex: watermarkColor,
          },
          (p, s) => {
            setProgressPercent(p);
            setProgressStatus(s);
          }
        );
        const url = URL.createObjectURL(res.blob);
        setResultBlob(res.blob);
        setResultUrl(url);
        setResultFileName(res.fileName);
        setResultMetadata({ pages: res.pageCount });

        recordOperation('watermark-pdf', 'Watermark PDF', firstFile.name, firstFile.size, res.fileName, res.blob.size, url);
      } else if (tool.id === 'page-numbers') {
        const res = await addPageNumbers(
          firstFile,
          {
            position: numPosition,
            format: numFormat,
          },
          (p, s) => {
            setProgressPercent(p);
            setProgressStatus(s);
          }
        );
        const url = URL.createObjectURL(res.blob);
        setResultBlob(res.blob);
        setResultUrl(url);
        setResultFileName(res.fileName);
        setResultMetadata({ pages: res.pageCount });

        recordOperation('page-numbers', 'Page Numbers', firstFile.name, firstFile.size, res.fileName, res.blob.size, url);
      } else if (tool.id === 'rotate-pdf') {
        const res = await rotatePdfPages(firstFile, pdfRotateDegrees, (p, s) => {
          setProgressPercent(p);
          setProgressStatus(s);
        });
        const url = URL.createObjectURL(res.blob);
        setResultBlob(res.blob);
        setResultUrl(url);
        setResultFileName(res.fileName);

        recordOperation('rotate-pdf', 'Rotate PDF', firstFile.name, firstFile.size, res.fileName, res.blob.size, url);
      }

      showToast('success', 'Processing Completed!', `Your document has been processed and is ready for download.`);
    } catch (err: any) {
      console.error('Tool processing error:', err);
      showToast('error', 'Operation Failed', err?.message || 'An error occurred during document processing.');
    } finally {
      setIsProcessing(false);
      setProgressPercent(100);
    }
  };

  const copyToClipboard = () => {
    if (aiExtractedText) {
      navigator.clipboard.writeText(aiExtractedText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
      showToast('success', 'Copied to Clipboard');
    }
  };

  const isUnlimited = user.plan === 'pro' || user.plan === 'business' || user.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Workspace Top Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setCurrentView('home')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Tools</span>
          </button>

          <div className="flex items-center gap-2">
            {!isUnlimited && (
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 px-3 py-1 rounded-full">
                Daily Free Uses: {quota.usedToday}/{systemSettings.freeDailyLimit || 3}
              </span>
            )}
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-xs hover:scale-105 transition-transform cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{isUnlimited ? 'Pro Active' : 'Upgrade to Unlimited'}</span>
            </button>
          </div>
        </div>

        {/* Tool Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-extrabold uppercase mb-2">
                <span>{tool.category.toUpperCase()} TOOL</span>
                {tool.badge && <span>• {tool.badge}</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {tool.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {tool.tagline}
              </p>
            </div>

            {/* Quick Switcher Pill Dropdown for tools */}
            <div className="flex items-center gap-2">
              <select
                value={activeToolId || 'merge-pdf'}
                onChange={(e) => openTool(e.target.value as ToolId)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer focus:outline-indigo-500"
              >
                {TOOLS_LIST.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Workspace Grid (Left: File Upload & List, Right: Settings & Result) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Upload & File Management */}
          <div className="lg:col-span-7 space-y-6">
            {/* File Dropzone */}
            <input
              ref={fileInputRef}
              type="file"
              multiple={tool.id === 'merge-pdf' || tool.id === 'image-to-pdf' || tool.id === 'image-converter'}
              accept={tool.acceptedFormats}
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white/60 dark:bg-slate-900/60 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 text-center transition-all cursor-pointer shadow-xs"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Click or drag & drop files here
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Accepted: {tool.acceptedFormats} (Max {isUnlimited ? tool.maxFilesPro : tool.maxFilesFree} files, up to {isUnlimited ? '200MB' : '15MB'})
              </p>
            </div>

            {/* Uploaded Files List */}
            {selectedFiles.length > 0 && (
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Selected Files ({selectedFiles.length})
                  </h3>
                  <button
                    onClick={() => setSelectedFiles([])}
                    className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div className="truncate text-left">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {file.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {selectedFiles.length > 1 && (
                          <>
                            <button
                              onClick={() => moveFile(index, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 disabled:opacity-30 cursor-pointer"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveFile(index, 'down')}
                              disabled={index === selectedFiles.length - 1}
                              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 disabled:opacity-30 cursor-pointer"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Settings & Result Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Configuration & Options
              </h3>

              {/* Tool Specific Options Renderers */}
              {tool.id === 'split-pdf' && (
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Split Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSplitMode('range')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          splitMode === 'range'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Extract Range
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplitMode('all')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          splitMode === 'all'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Split All to ZIP
                      </button>
                    </div>
                  </div>

                  {splitMode === 'range' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Page Range (e.g. 1-3, 5)
                      </label>
                      <input
                        type="text"
                        value={pageRange}
                        onChange={(e) => setPageRange(e.target.value)}
                        placeholder="e.g. 1-4, 7-10"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {tool.id === 'compress-pdf' && (
                <div className="space-y-3 text-left">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Compression Level Preset
                  </label>
                  {[
                    { id: 'recommended', label: 'Recommended (Balanced)', desc: 'Optimal size reduction (~50%) with high visual sharpness' },
                    { id: 'extreme', label: 'Extreme Compression', desc: 'Maximum size reduction (~70%+) for email & uploads' },
                    { id: 'low', label: 'Low Compression', desc: 'High DPI preservation (~25% reduction)' },
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setCompressPreset(p.id as any)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        compressPreset === p.id
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{p.label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{p.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {tool.id === 'pdf-to-image' && (
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Output Format
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setImageFormat(fmt)}
                          className={`py-2 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                            imageFormat === fmt
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Render Resolution (DPI)
                    </label>
                    <select
                      value={imageDpi}
                      onChange={(e) => setImageDpi(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value={150}>150 DPI (Standard Screen Quality)</option>
                      <option value={300}>300 DPI (High Resolution Print)</option>
                      <option value={600}>600 DPI (Ultra Master Clarity)</option>
                    </select>
                  </div>
                </div>
              )}

              {tool.id === 'image-to-pdf' && (
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Page Orientation
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['auto', 'portrait', 'landscape'] as const).map((ori) => (
                        <button
                          key={ori}
                          type="button"
                          onClick={() => setPageOrientation(ori)}
                          className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                            pageOrientation === ori
                              ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-500 text-violet-600'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {ori}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Paper Margin: {pageMargin}mm
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={pageMargin}
                      onChange={(e) => setPageMargin(Number(e.target.value))}
                      className="w-full accent-violet-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {tool.id === 'image-converter' && (
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Target Image Format
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['webp', 'png', 'jpeg', 'svg', 'bmp', 'gif'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setTargetImageFormat(fmt)}
                          className={`py-1.5 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                            targetImageFormat === fmt
                              ? 'bg-pink-50 dark:bg-pink-950/60 border-pink-500 text-pink-600'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Quality: {Math.round(imageQuality * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={imageQuality}
                      onChange={(e) => setImageQuality(Number(e.target.value))}
                      className="w-full accent-pink-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Document Scan & Image Filters
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'none', label: 'Original Colors' },
                        { id: 'bw_document', label: 'B&W Scan Filter' },
                        { id: 'grayscale', label: 'Grayscale' },
                        { id: 'high_contrast', label: 'High Contrast' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setImageFilter(f.id as any)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            imageFilter === f.id
                              ? 'bg-pink-50 dark:bg-pink-950/60 border-pink-500 text-pink-600'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tool.id === 'ai-ocr' && (
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      AI Task Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'ocr', label: 'Full Text OCR' },
                        { id: 'summarize', label: 'Executive Summary' },
                        { id: 'table', label: 'Extract Tables / CSV' },
                        { id: 'translate', label: 'Translate Document' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setAiTask(t.id as any)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            aiTask === t.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {aiTask === 'translate' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Target Language
                      </label>
                      <select
                        value={aiLanguage}
                        onChange={(e) => setAiLanguage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish (Español)</option>
                        <option value="French">French (Français)</option>
                        <option value="German">German (Deutsch)</option>
                        <option value="Japanese">Japanese (日本語)</option>
                        <option value="Chinese">Chinese (中文)</option>
                        <option value="Arabic">Arabic (العربية)</option>
                        <option value="Portuguese">Portuguese (Português)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {tool.id === 'watermark-pdf' && (
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Watermark Stamp Text
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="e.g. CONFIDENTIAL"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Opacity: {Math.round(watermarkOpacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min={0.1}
                        max={1.0}
                        step={0.05}
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                        className="w-full accent-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Angle: {watermarkAngle}°
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={90}
                        step={15}
                        value={watermarkAngle}
                        onChange={(e) => setWatermarkAngle(Number(e.target.value))}
                        className="w-full accent-purple-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Indicator when processing */}
              {isProcessing && (
                <div className="mt-5 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1.5">
                    <span>{progressStatus || 'Processing...'}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-200"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Process Action CTA Button */}
              <button
                onClick={handleExecuteOperation}
                disabled={isProcessing || selectedFiles.length === 0}
                className="w-full mt-6 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Document...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Execute {tool.name}</span>
                  </>
                )}
              </button>

              {/* Download & Success Box */}
              {resultUrl && (
                <div className="mt-6 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left animate-in fade-in-50">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Ready for Download!</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mb-3">
                    {resultFileName}
                  </p>

                  <a
                    href={resultUrl}
                    download={resultFileName}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File ({(resultBlob?.size ? resultBlob.size / 1024 / 1024 : 0.5).toFixed(2)} MB)</span>
                  </a>
                </div>
              )}
            </div>

            {/* AI OCR Extracted Text Display */}
            {aiExtractedText && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-left">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    AI Extracted Document
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-200/60 dark:border-slate-800/60">
                  {aiExtractedText}
                </div>
              </div>
            )}

            {/* PDF to Image Rendered Pages Grid */}
            {renderedPages.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-left">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Rendered Page Previews ({renderedPages.length})
                </h4>
                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
                  {renderedPages.map((page) => (
                    <div key={page.pageNum} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <img
                        src={page.dataUrl}
                        alt={`Page ${page.pageNum}`}
                        className="w-full h-32 object-contain rounded bg-white shadow-2xs mb-2"
                      />
                      <a
                        href={page.dataUrl}
                        download={`page_${page.pageNum}.${imageFormat}`}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Pg {page.pageNum}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
