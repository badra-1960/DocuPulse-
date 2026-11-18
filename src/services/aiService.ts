import * as pdfjsLib from 'pdfjs-dist';
import { fileToArrayBuffer, normalizePdfError, safeLoadPdfDocument } from './pdfEngine';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).href;
}

export interface AiOcrResult {
  success: boolean;
  text: string;
  summary?: string;
  metadata?: {
    words?: number;
    languageDetected?: string;
    confidence?: number;
  };
  error?: string;
}

async function renderPdfPagesToJpegDataUrls(
  file: File,
  maxPages: number = 10,
  onProgress?: (percentage: number, message: string) => void
): Promise<{ dataUrls: string[]; totalPages: number; processedPages: number }> {
  const arrayBuffer = await fileToArrayBuffer(file);
  await safeLoadPdfDocument(arrayBuffer, file.name);

  let pdfDoc: pdfjsLib.PDFDocumentProxy;
  try {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) });
    pdfDoc = await loadingTask.promise;
  } catch (err: any) {
    throw normalizePdfError(err, file.name);
  }

  const totalPages = pdfDoc.numPages;
  const pagesToRender = Math.min(totalPages, maxPages);
  const dataUrls: string[] = [];

  try {
    for (let p = 1; p <= pagesToRender; p++) {
      onProgress?.(
        Math.round((p / pagesToRender) * 60),
        `Rendu haute précision de la page ${p}/${pagesToRender} pour l'OCR IA...`
      );
      const page = await pdfDoc.getPage(p);
      const baseViewport = page.getViewport({ scale: 1 });
      const maxDim = Math.max(baseViewport.width, baseViewport.height) || 1;
      const scale = Math.min(1.8, 1600 / maxDim);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Impossible d’initialiser le contexte graphique pour le rendu PDF.');
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
      dataUrls.push(canvas.toDataURL('image/jpeg', 0.88));

      // Release canvas memory immediately
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    await pdfDoc.cleanup?.();
  }

  return { dataUrls, totalPages, processedPages: pagesToRender };
}

export async function extractDocumentWithAi(
  fileOrBase64: File | string,
  task: 'ocr' | 'summarize' | 'table' | 'translate' = 'ocr',
  language: string = 'English',
  onProgress?: (percentage: number, message: string) => void
): Promise<AiOcrResult> {
  try {
    let base64String = '';
    let imagesBase64: string[] | undefined;
    let mimeType = 'image/png';
    let truncationNotice = '';

    if (fileOrBase64 instanceof File) {
      const lowerName = fileOrBase64.name.toLowerCase();
      const isPdfFile = lowerName.endsWith('.pdf') || fileOrBase64.type === 'application/pdf';

      if (isPdfFile) {
        const rendered = await renderPdfPagesToJpegDataUrls(fileOrBase64, 10, onProgress);
        if (rendered.dataUrls.length === 0) {
          throw new Error('Le document PDF ne contient aucune page exploitable.');
        }
        imagesBase64 = rendered.dataUrls;
        mimeType = 'image/jpeg';
        if (rendered.totalPages > rendered.processedPages) {
          truncationNotice = `\n\n> *Note : Extraction OCR effectuée sur les ${rendered.processedPages} premières pages sur ${rendered.totalPages}.*`;
        }
        onProgress?.(70, 'Envoi des pages rendues vers le moteur OCR IA...');
      } else {
        const inferredMime = lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')
          ? 'image/jpeg'
          : lowerName.endsWith('.webp')
          ? 'image/webp'
          : 'image/png';
        mimeType =
          fileOrBase64.type && fileOrBase64.type !== 'application/octet-stream'
            ? fileOrBase64.type
            : inferredMime;
        base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileOrBase64);
        });
      }
    } else {
      base64String = fileOrBase64;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('docupulse_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/ai/ocr', {
      method: 'POST',
      headers,
      body: JSON.stringify(
        imagesBase64
          ? {
              imagesBase64,
              mimeType,
              task,
              language,
            }
          : {
              imageBase64: base64String,
              mimeType,
              task,
              language,
            }
      ),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.details || errData?.error || `AI Service returned status ${response.status}`);
    }

    const data = await response.json();
    if (truncationNotice && typeof data.text === 'string') {
      data.text = `${data.text.trim()}${truncationNotice}`;
    }
    return data;
  } catch (error: any) {
    console.error('AI OCR processing error:', error);
    return {
      success: false,
      text: '',
      error: error?.message || 'Failed to extract text from document with AI.',
    };
  }
}

export async function analyzeDocumentText(
  text: string,
  action: 'summarize' | 'translate' | 'proofread' | 'extract_action_items' = 'summarize',
  targetLanguage: string = 'Spanish'
): Promise<{ success: boolean; result: string; error?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('docupulse_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/ai/analyze-text', {
      method: 'POST',
      headers,
      body: JSON.stringify({ text, action, targetLanguage }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.details || errData?.error || `AI text analysis failed (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.error('AI text analysis error:', err);
    return {
      success: false,
      result: '',
      error: err?.message || 'Failed to analyze text with AI service.',
    };
  }
}
