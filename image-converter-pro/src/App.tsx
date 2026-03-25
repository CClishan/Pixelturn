/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, DragEvent } from 'react';
import { 
  Plus, 
  X, 
  Image as ImageIcon, 
  Trash2, 
  Download,
  Settings2, 
  Layers,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { zipSync } from 'fflate';

interface QueuedFile {
  id: string;
  file: File;
  thumbnail: string;
  name: string;
  bytes: number;
  size: string;
  status: 'pending' | 'converting' | 'completed' | 'failed';
}

const outputFormats = ['JPG', 'PNG', 'WEBP', 'BMP', 'TIFF'] as const;
type OutputFormat = (typeof outputFormats)[number];

const formatToApiKey: Record<OutputFormat, string> = {
  JPG: 'JPG',
  PNG: 'PNG',
  WEBP: 'WEBP',
  BMP: 'BMP',
  TIFF: 'TIFF',
};

const outputSuffixByFormat: Record<OutputFormat, string> = {
  JPG: '.jpg',
  PNG: '.png',
  WEBP: '.webp',
  BMP: '.bmp',
  TIFF: '.tiff',
};

export default function App() {
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [format, setFormat] = useState<OutputFormat>('JPG');
  const [quality, setQuality] = useState(85);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

  const getFileTypeLabel = (file: File) => file.type.split('/')[1]?.toUpperCase() || 'FILE';

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const buildApiUrl = (path: string) => (apiBaseUrl ? `${apiBaseUrl}${path}` : path);

  const getOutputName = (fileName: string) => {
    const lastDot = fileName.lastIndexOf('.');
    const baseName = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
    return `${baseName || 'image'}${outputSuffixByFormat[format]}`;
  };

  const getUniqueName = (fileName: string, usedNames: Set<string>) => {
    if (!usedNames.has(fileName)) {
      usedNames.add(fileName);
      return fileName;
    }

    const lastDot = fileName.lastIndexOf('.');
    const baseName = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
    const extension = lastDot > 0 ? fileName.slice(lastDot) : '';
    let duplicate = 1;
    let candidate = `${baseName}_${duplicate}${extension}`;

    while (usedNames.has(candidate)) {
      duplicate += 1;
      candidate = `${baseName}_${duplicate}${extension}`;
    }

    usedNames.add(candidate);
    return candidate;
  };

  const getFriendlyErrorMessage = (err: unknown) => {
    if (err instanceof Error) {
      if (/Failed to fetch/i.test(err.message)) {
        return 'The API request failed before the server responded. Check the backend deployment, API URL, and CORS allowlist.';
      }
      return err.message;
    }

    return 'Conversion failed. Please try again.';
  };

  const getErrorMessageFromResponse = async (response: Response) => {
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        return payload.error;
      }
    } catch {
      // Response body is not JSON.
    }

    if (response.status === 413) {
      return 'This image is too large for the current backend deployment.';
    }

    return `Conversion failed with status ${response.status}.`;
  };

  const getDownloadNameFromHeader = (header: string | null) => {
    if (!header) return null;

    const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      return decodeURIComponent(utf8Match[1]);
    }

    const basicMatch = header.match(/filename="?([^";]+)"?/i);
    return basicMatch?.[1] ?? null;
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    setError(null);
    setSuccessMessage(null);
    
    const newQueuedFiles: QueuedFile[] = Array.from(newFiles).map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      thumbnail: URL.createObjectURL(file),
      name: file.name,
      bytes: file.size,
      size: formatSize(file.size),
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newQueuedFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.thumbnail);
      return filtered;
    });
  };

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.thumbnail));
    setFiles([]);
    setError(null);
    setSuccessMessage(null);
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    const queuedFiles = [...files];
    const usedZipNames = new Set<string>();
    const zipEntries: Record<string, Uint8Array> = {};
    const failedFiles: string[] = [];

    setError(null);
    setSuccessMessage(null);
    setIsConverting(true);

    setFiles(prev => prev.map(f => ({ ...f, status: 'pending' })));

    try {
      for (const queuedFile of queuedFiles) {
        setFiles(prev =>
          prev.map(file =>
            file.id === queuedFile.id ? { ...file, status: 'converting' } : file
          )
        );

        const formData = new FormData();
        formData.append('file', queuedFile.file);
        formData.append('format', formatToApiKey[format]);
        formData.append('quality', String(quality));

        try {
          const response = await fetch(buildApiUrl('/api/convert-file'), {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(await getErrorMessageFromResponse(response));
          }

          const downloadName =
            getDownloadNameFromHeader(response.headers.get('Content-Disposition')) ??
            getOutputName(queuedFile.name);
          const zipName = getUniqueName(downloadName, usedZipNames);
          zipEntries[zipName] = new Uint8Array(await response.arrayBuffer());

          setFiles(prev =>
            prev.map(file =>
              file.id === queuedFile.id ? { ...file, status: 'completed' } : file
            )
          );
        } catch (err) {
          failedFiles.push(`${queuedFile.name}: ${getFriendlyErrorMessage(err)}`);
          setFiles(prev =>
            prev.map(file =>
              file.id === queuedFile.id ? { ...file, status: 'failed' } : file
            )
          );
        }
      }

      const convertedCount = Object.keys(zipEntries).length;
      if (convertedCount === 0) {
        throw new Error(failedFiles[0] ?? 'Conversion failed. Please try again.');
      }

      const zipData = zipSync(zipEntries, { level: 6 });
      const fileName = `converted_${formatToApiKey[format].toLowerCase()}.zip`;
      downloadBlob(new Blob([zipData], { type: 'application/zip' }), fileName);

      if (failedFiles.length > 0) {
        setError(`Converted ${convertedCount} file(s), but some failed: ${failedFiles.join(' | ')}`);
      } else {
        setSuccessMessage(`Converted ${convertedCount} file(s). ZIP download started.`);
      }
    } catch (err) {
      setFiles(prev =>
        prev.map(file =>
          file.status === 'converting' ? { ...file, status: 'pending' } : file
        )
      );
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsConverting(false);
    }
  };

  const totalUploadSize = files.reduce((sum, file) => sum + file.bytes, 0);

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1D1D1F] font-sans p-8 md:p-16 selection:bg-neutral-200">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          <header className="h-10 flex items-center">
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Converter</h1>
          </header>

          {/* Upload Zone */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-neutral-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.01)] p-16 flex flex-col items-center justify-center transition-all duration-500 hover:border-neutral-300 cursor-pointer group relative overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <div className="absolute inset-0 bg-neutral-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="w-14 h-14 bg-neutral-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 border border-neutral-100 shadow-sm">
              <Plus className="w-5 h-5 text-neutral-400" />
            </div>
            <p className="text-neutral-400 font-medium text-sm tracking-tight">Drag & Drop or Click to Upload</p>
          </motion.div>

          {/* Queue List */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] border border-neutral-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between bg-white">
              <h2 className="text-sm font-semibold flex items-center gap-2.5 text-neutral-800">
                <Layers className="w-3.5 h-3.5 text-neutral-400" />
                Queue List
              </h2>
              <span className="text-[9px] uppercase tracking-widest text-neutral-300 font-bold">{files.length} items</span>
            </div>
            
            <div className="divide-y divide-neutral-50 max-h-[400px] overflow-y-auto">
              <AnimatePresence initial={false}>
                {files.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-100/50">
                      <ImageIcon className="w-4 h-4 text-neutral-200" />
                    </div>
                    <p className="text-xs text-neutral-300 font-medium tracking-tight">No images in queue</p>
                  </div>
                ) : (
                  files.map((file) => (
                    <motion.div 
                      key={file.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-6 py-3.5 flex items-center gap-4 hover:bg-neutral-50/30 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0 border border-neutral-100 shadow-sm transition-transform group-hover:scale-105 duration-500">
                        <img 
                          src={file.thumbnail} 
                          alt={file.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-800 truncate mb-0.5">{file.name}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">{file.size}</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-neutral-200" />
                          <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">{getFileTypeLabel(file.file)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {file.status === 'converting' && (
                          <Loader2 className="w-3.5 h-3.5 text-neutral-400 animate-spin" />
                        )}
                        {file.status === 'completed' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {file.status === 'failed' && (
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        )}
                        <button 
                          onClick={() => removeFile(file.id)}
                          disabled={isConverting}
                          className="p-2 text-neutral-200 hover:text-neutral-500 hover:bg-neutral-100 rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <header className="h-10 flex items-center">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-2.5">
              <Settings2 className="w-3.5 h-3.5" />
              Configuration
            </h2>
          </header>

          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] border border-neutral-100 p-8 space-y-8">
            {/* Output Format */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">Output Format</label>
              <div className="grid grid-cols-2 gap-2 bg-neutral-50/50 p-1.5 rounded-2xl border border-neutral-100 sm:grid-cols-3">
                {outputFormats.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`py-2.5 text-[11px] font-bold tracking-tight rounded-xl transition-all duration-300 ${
                      format === f 
                        ? 'bg-white text-neutral-900 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-neutral-100' 
                        : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">Quality</label>
                <span className="text-[11px] font-bold text-neutral-900 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-100">{quality}%</span>
              </div>
              <div className="relative h-1.5 flex items-center">
                <div className="absolute inset-0 bg-neutral-100 rounded-full" />
                <div 
                  className="absolute inset-y-0 left-0 bg-neutral-900 rounded-full transition-all duration-500"
                  style={{ width: `${quality}%` }}
                />
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="absolute w-4 h-4 bg-white border-2 border-neutral-900 rounded-full shadow-sm pointer-events-none transition-all duration-500"
                  style={{ left: `calc(${quality}% - 8px)` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">Upload Strategy</label>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Files convert one by one and are packed into a ZIP in your browser to avoid multi-file upload failures on Vercel.
              </p>
              {files.length > 0 && (
                <p className="text-[11px] text-neutral-400">
                  Current queue size: {formatSize(totalUploadSize)}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-6 space-y-3">
              <button 
                disabled={files.length === 0 || isConverting}
                onClick={handleConvert}
                className="w-full bg-neutral-900 hover:bg-black disabled:bg-neutral-100 disabled:text-neutral-300 text-white text-[11px] font-bold tracking-widest uppercase py-5 rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)] active:scale-[0.98]"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Convert Now
                  </>
                )}
              </button>
              <button 
                onClick={clearAll}
                disabled={files.length === 0 || isConverting}
                className="w-full bg-white hover:bg-neutral-50 disabled:opacity-30 text-neutral-400 text-[10px] font-bold tracking-widest uppercase py-4 rounded-2xl transition-all duration-500 flex items-center justify-center gap-2 border border-neutral-100 active:scale-[0.98]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Queue
              </button>

              {error && (
                <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                  {successMessage}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
