import { AlertCircle, Download, Loader2, Settings2, Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';

import type { ConverterCopy } from '../copy';
import { outputFormats, type OutputFormat } from '../constants';

interface SettingsPanelProps {
  completedCount: number;
  copy: ConverterCopy;
  error: string | null;
  filesCount: number;
  format: OutputFormat;
  isConverting: boolean;
  quality: number;
  successMessage: string | null;
  totalUploadSize: string;
  onClearAll: () => void;
  onConvert: () => void;
  onFormatChange: (format: OutputFormat) => void;
  onQualityChange: (quality: number) => void;
  onZipDownload: () => void;
}

export function SettingsPanel({
  completedCount,
  copy,
  error,
  filesCount,
  format,
  isConverting,
  quality,
  successMessage,
  totalUploadSize,
  onClearAll,
  onConvert,
  onFormatChange,
  onQualityChange,
  onZipDownload,
}: SettingsPanelProps): ReactElement {
  return (
    <aside className="lg:col-span-4 space-y-8">
      <header className="h-10 flex items-center">
        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-2.5">
          <Settings2 className="w-3.5 h-3.5" />
          {copy.configurationTitle}
        </h2>
      </header>

      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] border border-neutral-100 p-8 space-y-8">
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
            {copy.outputFormatLabel}
          </label>
          <div className="grid grid-cols-2 gap-2 bg-neutral-50/50 p-1.5 rounded-2xl border border-neutral-100 sm:grid-cols-3">
            {outputFormats.map((outputFormat) => (
              <button
                key={outputFormat}
                onClick={() => onFormatChange(outputFormat)}
                className={getFormatButtonClassName(format === outputFormat)}
                type="button"
              >
                {outputFormat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
              {copy.qualityLabel}
            </label>
            <span className="text-[11px] font-bold text-neutral-900 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-100">
              {quality}%
            </span>
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
              onChange={(event) => onQualityChange(parseInt(event.target.value, 10))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="absolute w-4 h-4 bg-white border-2 border-neutral-900 rounded-full shadow-sm pointer-events-none transition-all duration-500"
              style={{ left: `calc(${quality}% - 8px)` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
            {copy.uploadStrategyLabel}
          </label>
          <p className="text-[11px] text-neutral-500 leading-relaxed">{copy.uploadStrategyDescription}</p>
          {filesCount > 0 ? (
            <p className="text-[11px] text-neutral-400">{copy.currentQueueSize(totalUploadSize)}</p>
          ) : null}
        </div>

        <div className="pt-6 space-y-3">
          <button
            disabled={filesCount === 0 || isConverting}
            onClick={onConvert}
            className="w-full bg-neutral-900 hover:bg-black disabled:bg-neutral-100 disabled:text-neutral-300 text-white text-[11px] font-bold tracking-widest uppercase py-5 rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)] active:scale-[0.98]"
            type="button"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {copy.processing}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {copy.convertNow}
              </>
            )}
          </button>
          <button
            disabled={completedCount === 0 || isConverting}
            onClick={onZipDownload}
            className="w-full bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-50 disabled:text-neutral-300 text-neutral-700 text-[10px] font-bold tracking-widest uppercase py-4 rounded-2xl transition-all duration-500 flex items-center justify-center gap-2 border border-neutral-200 active:scale-[0.98]"
            type="button"
          >
            <Download className="w-3.5 h-3.5" />
            {copy.downloadZip}
          </button>
          <button
            onClick={onClearAll}
            disabled={filesCount === 0 || isConverting}
            className="w-full bg-white hover:bg-neutral-50 disabled:opacity-30 text-neutral-400 text-[10px] font-bold tracking-widest uppercase py-4 rounded-2xl transition-all duration-500 flex items-center justify-center gap-2 border border-neutral-100 active:scale-[0.98]"
            type="button"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {copy.clearQueue}
          </button>

          {error ? (
            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
              {successMessage}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function getFormatButtonClassName(isActive: boolean): string {
  if (isActive) {
    return 'py-2.5 text-[11px] font-bold tracking-tight rounded-xl transition-all duration-300 bg-white text-neutral-900 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-neutral-100';
  }

  return 'py-2.5 text-[11px] font-bold tracking-tight rounded-xl transition-all duration-300 text-neutral-400 hover:text-neutral-600';
}
