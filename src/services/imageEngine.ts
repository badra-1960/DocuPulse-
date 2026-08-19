import JSZip from 'jszip';
import { ProcessProgressCallback } from './pdfEngine';

export interface ImageProcessingOptions {
  format: 'png' | 'jpeg' | 'webp' | 'svg' | 'bmp' | 'gif';
  quality: number; // 0.1 to 1.0
  resizeMode: 'original' | 'custom' | 'percentage';
  width?: number;
  height?: number;
  percentage?: number; // e.g. 50%
  maintainAspectRatio?: boolean;
  filter?: 'none' | 'grayscale' | 'bw_document' | 'high_contrast' | 'sharpen' | 'sepia';
  brightness?: number; // -100 to +100
  contrast?: number; // -100 to +100
  rotation?: 0 | 90 | 180 | 270;
  flipH?: boolean;
  flipV?: boolean;
}

export async function processImageFile(
  file: File,
  options: ImageProcessingOptions,
  onProgress?: ProcessProgressCallback
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number; newSize: number; originalSize: number }> {
  onProgress?.(15, 'Loading image into canvas studio...');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = document.createElement('img');
      img.onerror = () => reject(new Error('Invalid image format or corrupted file.'));
      img.onload = () => {
        try {
          onProgress?.(40, 'Applying dimensions & transformations...');

          // Calculate target width and height
          let targetWidth = img.naturalWidth;
          let targetHeight = img.naturalHeight;

          if (options.resizeMode === 'percentage' && options.percentage) {
            const scale = options.percentage / 100;
            targetWidth = Math.max(1, Math.round(img.naturalWidth * scale));
            targetHeight = Math.max(1, Math.round(img.naturalHeight * scale));
          } else if (options.resizeMode === 'custom') {
            if (options.width && options.height) {
              targetWidth = options.width;
              targetHeight = options.height;
            } else if (options.width) {
              targetWidth = options.width;
              targetHeight = options.maintainAspectRatio
                ? Math.round((img.naturalHeight / img.naturalWidth) * targetWidth)
                : img.naturalHeight;
            } else if (options.height) {
              targetHeight = options.height;
              targetWidth = options.maintainAspectRatio
                ? Math.round((img.naturalWidth / img.naturalHeight) * targetHeight)
                : img.naturalWidth;
            }
          }

          // Handle rotation dimensions
          const rot = options.rotation || 0;
          const isSwap = rot === 90 || rot === 270;
          const canvasWidth = isSwap ? targetHeight : targetWidth;
          const canvasHeight = isSwap ? targetWidth : targetHeight;

          const canvas = document.createElement('canvas');
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          if (!ctx) {
            throw new Error('Could not initialize 2D canvas context.');
          }

          // Rotate and Flip transforms
          ctx.save();
          ctx.translate(canvasWidth / 2, canvasHeight / 2);
          if (rot) {
            ctx.rotate((rot * Math.PI) / 180);
          }
          if (options.flipH || options.flipV) {
            ctx.scale(options.flipH ? -1 : 1, options.flipV ? -1 : 1);
          }
          ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
          ctx.restore();

          onProgress?.(65, 'Applying image filters & color corrections...');

          // Pixel filters
          if (options.filter && options.filter !== 'none') {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const avg = 0.299 * r + 0.587 * g + 0.114 * b;

              if (options.filter === 'grayscale') {
                data[i] = avg;
                data[i + 1] = avg;
                data[i + 2] = avg;
              } else if (options.filter === 'bw_document') {
                // High contrast document threshold
                const threshold = 140;
                const val = avg > threshold ? 255 : 0;
                data[i] = val;
                data[i + 1] = val;
                data[i + 2] = val;
              } else if (options.filter === 'high_contrast') {
                const factor = 1.6;
                data[i] = Math.min(255, Math.max(0, factor * (r - 128) + 128));
                data[i + 1] = Math.min(255, Math.max(0, factor * (g - 128) + 128));
                data[i + 2] = Math.min(255, Math.max(0, factor * (b - 128) + 128));
              } else if (options.filter === 'sepia') {
                data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
              }
            }
            ctx.putImageData(imgData, 0, 0);
          }

          onProgress?.(85, 'Encoding target format & compressing...');

          // Output MIME Type
          let mimeType = 'image/jpeg';
          if (options.format === 'png') mimeType = 'image/png';
          else if (options.format === 'webp') mimeType = 'image/webp';
          else if (options.format === 'svg') mimeType = 'image/svg+xml';
          else if (options.format === 'bmp') mimeType = 'image/bmp';
          else if (options.format === 'gif') mimeType = 'image/gif';

          const quality = Math.max(0.1, Math.min(1.0, options.quality || 0.9));
          const dataUrl = canvas.toDataURL(mimeType, quality);

          // Convert dataURL to Blob
          fetch(dataUrl)
            .then((res) => res.blob())
            .then((blob) => {
              onProgress?.(100, 'Image processed successfully!');
              resolve({
                blob,
                dataUrl,
                width: canvas.width,
                height: canvas.height,
                newSize: blob.size,
                originalSize: file.size,
              });
            })
            .catch(reject);
        } catch (err) {
          reject(err);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Batch Process Images and create a ZIP archive
 */
export async function batchProcessImages(
  files: File[],
  options: ImageProcessingOptions,
  onProgress?: ProcessProgressCallback
): Promise<{ zipBlob: Blob; totalFiles: number; totalSavedBytes: number }> {
  const zip = new JSZip();
  let totalSavedBytes = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progressPercent = Math.round(10 + ((i + 1) / files.length) * 75);
    onProgress?.(progressPercent, `Processing image ${i + 1}/${files.length} ("${file.name}")...`);

    const result = await processImageFile(file, options);
    totalSavedBytes += Math.max(0, file.size - result.newSize);

    const ext = options.format === 'jpeg' ? 'jpg' : options.format;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    zip.file(`${baseName}_processed.${ext}`, result.blob);
  }

  onProgress?.(90, 'Packing batch ZIP file...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  onProgress?.(100, 'Batch processing complete!');

  return {
    zipBlob,
    totalFiles: files.length,
    totalSavedBytes,
  };
}
