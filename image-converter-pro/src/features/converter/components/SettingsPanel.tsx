import { AlertCircle, Download, Loader2, RefreshCw, Settings2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactElement } from 'react';

import type { ConverterCopy } from '../copy';
import { outputFormats, type OutputFormat } from '../constants';
import { cx, type VisualTheme } from '../theme';
import type { BackendConnectionState } from '../types';

interface SettingsPanelProps {
  backendStatus: BackendConnectionState;
  completedCount: number;
  copy: ConverterCopy;
  error: string | null;
  filesCount: number;
  format: OutputFormat;
  isConverting: boolean;
  quality: number;
  successMessage: string | null;
  theme: VisualTheme;
  totalUploadSize: string;
  uploadingFilesCount: number;
  onConvert: () => void;
  onFormatChange: (format: OutputFormat) => void;
  onQualityChange: (quality: number) => void;
  onZipDownload: () => void;
}

export function SettingsPanel({
  backendStatus,
  completedCount,
  copy,
  error,
  filesCount,
  format,
  isConverting,
  quality,
  successMessage,
  theme,
  totalUploadSize,
  uploadingFilesCount,
  onConvert,
  onFormatChange,
  onQualityChange,
  onZipDownload,
}: SettingsPanelProps): ReactElement {
  const isClassic = theme === 'classic';

  return (
    <aside className="lg:col-span-4 space-y-6">
      <header className="h-10 flex items-center">
        <h2
          className={cx(
            'text-sm font-semibold uppercase flex items-center gap-2.5',
            isClassic ? 'text-neutral-400 tracking-widest' : 'display-face text-[var(--text-primary)] tracking-[0.16em]',
          )}
        >
          <Settings2 className="w-3.5 h-3.5" />
          {copy.configurationTitle}
        </h2>
      </header>

      <div className={getPanelCardClassName(theme)}>
        <div className="space-y-4">
          <label className={getSectionLabelClassName(theme)}>{copy.outputFormatLabel}</label>
          <div
            className={cx(
              'grid grid-cols-2 gap-2 p-1.5 sm:grid-cols-3',
              isClassic
                ? 'bg-neutral-50/50 rounded-2xl border border-neutral-100'
                : 'border border-[var(--soft-border)] bg-[var(--panel-muted)]',
            )}
          >
            {outputFormats.map((outputFormat) => (
              <button
                key={outputFormat}
                onClick={() => onFormatChange(outputFormat)}
                className={getFormatButtonClassName(theme, format === outputFormat)}
                type="button"
              >
                {outputFormat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={getSectionLabelClassName(theme)}>{copy.qualityLabel}</label>
            <span className={getQualityValueClassName(theme)}>{quality}%</span>
          </div>
          <div className={cx('relative flex items-center', isClassic ? 'h-1.5' : 'h-2')}>
            <div
              className={cx(
                'absolute inset-0',
                isClassic
                  ? 'bg-neutral-100 rounded-full'
                  : 'border border-[var(--quality-track-border)] bg-[var(--quality-track-bg)]',
              )}
            />
            <div
              className={cx(
                'absolute inset-y-0 left-0 transition-all duration-500',
                isClassic ? 'bg-neutral-900 rounded-full' : 'bg-[var(--quality-fill-bg)]',
              )}
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
              className={cx(
                'absolute pointer-events-none transition-all duration-500',
                isClassic
                  ? 'w-4 h-4 bg-white border-2 border-neutral-900 rounded-full shadow-sm'
                  : 'w-3 h-3 border-2 border-[var(--quality-thumb-border)] bg-[var(--quality-thumb-bg)]',
              )}
              style={
                isClassic
                  ? { left: `calc(${quality}% - 8px)` }
                  : {
                      left: `calc(${quality}% - 6px)`,
                      boxShadow: '0 0 0 1px var(--panel-bg), var(--button-shadow)',
                    }
              }
            />
          </div>
        </div>

        <div
          className={cx(
            'space-y-2',
            isClassic ? '' : 'border border-[var(--soft-border)] bg-[var(--panel-muted)] px-4 py-4',
          )}
        >
          <label className={getSectionLabelClassName(theme)}>{copy.uploadStrategyLabel}</label>
          <p className={cx(isClassic ? 'text-[11px] text-neutral-500 leading-relaxed' : 'text-[11px] leading-relaxed text-[var(--text-secondary)]')}>
            {copy.uploadStrategyDescription}
          </p>
          {filesCount > 0 ? (
            <p className={cx(isClassic ? 'text-[11px] text-neutral-400' : 'text-[11px] text-[var(--text-muted)]')}>
              {copy.currentQueueSize(totalUploadSize)}
            </p>
          ) : null}
        </div>

        <div className="pt-6 space-y-3">
          <button
            disabled={filesCount === 0 || isConverting || uploadingFilesCount > 0}
            onClick={onConvert}
            className={getPrimaryActionClassName(theme)}
            type="button"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {copy.processing}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                {copy.convertNow}
              </>
            )}
          </button>
          <button
            disabled={completedCount === 0 || isConverting}
            onClick={onZipDownload}
            className={getSecondaryActionClassName(theme)}
            type="button"
          >
            <Download className="w-3.5 h-3.5" />
            {copy.downloadZip}
          </button>
          {error ? (
            <div className={getErrorNoticeClassName(theme)}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          ) : null}

          {successMessage ? <div className={getSuccessNoticeClassName(theme)}>{successMessage}</div> : null}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className={cx(
          'px-5 py-4',
          isClassic
            ? 'bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] border border-neutral-100'
            : 'border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-[var(--surface-shadow)]',
        )}
      >
        <p className={getSectionLabelClassName(theme)}>{copy.backendStatus.title}</p>
        <div className="mt-2 inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight text-[var(--text-primary)]">
          <span className={getBackendTitleClassName(backendStatus)}>{getBackendStatusLabel(copy, backendStatus)}</span>
          <span className="group relative inline-flex items-center justify-center">
            <span className={getBackendDotClassName(backendStatus)} aria-hidden="true" />
            <span
              className={cx(
                'pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-10 w-64 -translate-x-1/2 translate-y-1 px-3 py-2 text-[11px] font-medium normal-case tracking-normal opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100',
                isClassic
                  ? 'rounded-xl border border-neutral-200 bg-white text-neutral-500 shadow-[0_10px_30px_rgba(0,0,0,0.08)]'
                  : 'border border-[var(--panel-border)] bg-[var(--panel-muted)] text-[var(--text-secondary)] shadow-[var(--surface-shadow)]',
              )}
            >
              {getBackendStatusDescription(copy, backendStatus)}
            </span>
          </span>
        </div>
      </motion.div>
    </aside>
  );
}

function getPanelCardClassName(theme: VisualTheme): string {
  if (theme === 'classic') {
    return 'bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] border border-neutral-100 p-8 space-y-8';
  }

  return 'border border-[var(--panel-border)] bg-[var(--panel-bg)] p-8 space-y-8 shadow-[var(--surface-shadow)]';
}

function getSectionLabelClassName(theme: VisualTheme): string {
  if (theme === 'classic') {
    return 'text-[10px] font-bold text-neutral-300 uppercase tracking-widest';
  }

  return 'text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]';
}

function getFormatButtonClassName(theme: VisualTheme, isActive: boolean): string {
  if (theme === 'classic') {
    if (isActive) {
      return 'py-2.5 text-[11px] font-bold tracking-tight rounded-xl transition-all duration-300 bg-white text-neutral-900 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-neutral-100';
    }

    return 'py-2.5 text-[11px] font-bold tracking-tight rounded-xl transition-all duration-300 text-neutral-400 hover:text-neutral-600';
  }

  if (isActive) {
    return 'py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] transition-all duration-300';
  }

  return 'py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] border border-transparent text-[var(--text-secondary)] transition-all duration-300 hover:border-[var(--panel-border)] hover:bg-[var(--panel-muted)] hover:text-[var(--text-primary)]';
}

function getQualityValueClassName(theme: VisualTheme): string {
  if (theme === 'classic') {
    return 'text-[11px] font-bold text-neutral-900 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-100';
  }

  return 'text-[11px] font-semibold text-[var(--text-primary)] bg-[var(--panel-muted)] px-2.5 py-1 border border-[var(--panel-border)]';
}

function getPrimaryActionClassName(theme: VisualTheme): string {
  if (theme === 'classic') {
    return 'w-full bg-neutral-900 hover:bg-black disabled:bg-neutral-50 disabled:text-neutral-300 disabled:border-neutral-200 disabled:shadow-none text-white text-[11px] font-bold tracking-widest uppercase py-5 rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-neutral-900 active:scale-[0.98]';
  }

  return 'w-full bg-[var(--button-primary-bg)] hover:opacity-92 disabled:bg-[var(--panel-muted)] disabled:text-[var(--text-muted)] disabled:border-[var(--soft-border)] disabled:shadow-none text-[var(--button-primary-text)] text-[11px] font-semibold tracking-[0.16em] uppercase py-5 transition-all duration-500 flex items-center justify-center gap-3 border border-[var(--button-primary-border)] shadow-[var(--button-shadow)] active:translate-x-[1px] active:translate-y-[1px]';
}

function getSecondaryActionClassName(theme: VisualTheme): string {
  if (theme === 'classic') {
    return 'w-full bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-50 disabled:text-neutral-300 text-neutral-700 text-[10px] font-bold tracking-widest uppercase py-5 rounded-2xl transition-all duration-500 flex items-center justify-center gap-2 border border-neutral-200 active:scale-[0.98]';
  }

  return 'w-full bg-[var(--button-secondary-bg)] hover:bg-[var(--panel-muted)] disabled:bg-[var(--panel-bg)] disabled:text-[var(--text-muted)] text-[var(--button-secondary-text)] text-[10px] font-semibold tracking-[0.16em] uppercase py-5 transition-all duration-500 flex items-center justify-center gap-2 border border-[var(--button-secondary-border)] shadow-[var(--button-shadow)] active:translate-x-[1px] active:translate-y-[1px]';
}

function getErrorNoticeClassName(theme: VisualTheme): string {
  if (theme === 'classic') {
    return 'mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 flex items-center gap-2';
  }

  return 'mt-2 border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 py-2 text-[11px] text-[var(--error)] flex items-center gap-2';
}

function getSuccessNoticeClassName(theme: VisualTheme): string {
  if (theme === 'classic') {
    return 'mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700';
  }

  return 'mt-2 border border-[var(--panel-border)] bg-[var(--panel-muted)] px-3 py-2 text-[11px] text-[var(--success)]';
}

function getBackendStatusLabel(copy: ConverterCopy, backendStatus: BackendConnectionState): string {
  if (backendStatus === 'connected') {
    return copy.backendStatus.connected;
  }

  if (backendStatus === 'disconnected') {
    return copy.backendStatus.disconnected;
  }

  return copy.backendStatus.checking;
}

function getBackendStatusDescription(copy: ConverterCopy, backendStatus: BackendConnectionState): string {
  if (backendStatus === 'checking') {
    return copy.backendStatus.checking;
  }

  return backendStatus === 'connected'
    ? copy.backendStatus.connectedDescription
    : copy.backendStatus.disconnectedDescription;
}

function getBackendDotClassName(backendStatus: BackendConnectionState): string {
  if (backendStatus === 'connected') {
    return 'inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/80';
  }

  if (backendStatus === 'disconnected') {
    return 'inline-block h-1.5 w-1.5 rounded-full bg-red-400/80';
  }

  return 'inline-block h-1.5 w-1.5 rounded-full bg-neutral-300';
}

function getBackendTitleClassName(backendStatus: BackendConnectionState): string {
  if (backendStatus === 'connected') {
    return 'text-sm font-semibold tracking-tight text-emerald-300';
  }

  if (backendStatus === 'disconnected') {
    return 'text-sm font-semibold tracking-tight text-red-300';
  }

  return 'text-sm font-semibold tracking-tight text-[var(--text-secondary)]';
}
