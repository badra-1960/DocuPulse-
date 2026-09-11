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

export async function extractDocumentWithAi(
  fileOrBase64: File | string,
  task: 'ocr' | 'summarize' | 'table' | 'translate' = 'ocr',
  language: string = 'English'
): Promise<AiOcrResult> {
  try {
    let base64String = '';
    let mimeType = 'image/png';

    if (fileOrBase64 instanceof File) {
      mimeType = fileOrBase64.type || 'image/png';
      base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrBase64);
      });
    } else {
      base64String = fileOrBase64;
    }

    const response = await fetch('/api/ai/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64String,
        mimeType,
        task,
        language,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.details || errData?.error || `AI Service returned status ${response.status}`);
    }

    const data = await response.json();
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
    const response = await fetch('/api/ai/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
