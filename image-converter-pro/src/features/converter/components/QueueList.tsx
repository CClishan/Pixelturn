import {
  AlertCircle,
  CheckCircle2,
  Download,
  Image as ImageIcon,
  Layers,
  Loader2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ReactElement } from 'react';

import type { ConverterCopy } from '../copy';
import { cx, type VisualTheme } from '../theme';
import type { QueuedFile } from '../types';
import { formatSize, getFileTypeLabel } from '../utils';

interface QueueListProps {
  copy: ConverterCopy;
  files: QueuedFile[];
  isConverting: boolean;
  theme: VisualTheme;
  onClearAll?: () => void;
  onDownloadFile: (fileId: string) => void;
  onRemoveFile: (fileId: string) => void;
}

export function QueueList({
  copy,
  files,
  isConverting,
  theme,
  onClearAll,
  onDownloadFile,
  onRemoveFile,
}: QueueListProps): ReactElement {
  const isClassic = theme === 'classic';

  return (
    <div
      className={cx(
        'overflow-hidden',
        isClassic
          ? 'bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] border border-neutral-100'
          : 'border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-[var(--surface-shadow)]',
      )}
    >
      <div
        className={cx(
          'px-6 py-4 flex items-center justify-between',
          isClassic ? 'border-b border-neutral-50 bg-white' : 'border-b border-[var(--soft-border)] bg-[var(--panel-bg)]',
        )}
      >
        <h2
          className={cx(
            'text-sm font-semibold flex items-center gap-2.5',
            isClassic ? 'text-neutral-800' : 'display-face uppercase tracking-[0.12em] text-[var(--text-primary)]',
          )}
        >
          <Layers className={isClassic ? 'w-3.5 h-3.5 text-neutral-400' : 'w-3.5 h-3.5 text-[var(--text-muted)]'} />
          {copy.queueTitle}
        </h2>
        <div className="flex items-center gap-3">
          <span
            className={cx(
              'text-[9px] uppercase tracking-widest font-bold',
              isClassic ? 'text-neutral-300' : 'text-[var(--text-muted)]',
            )}
          >
            {copy.queueItems(files.length)}
          </span>
          {onClearAll ? (
            <button
              onClick={onClearAll}
              disabled={files.length === 0 || isConverting}
              className={cx(
                'px-3 py-2 border text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed',
                isClassic
                  ? 'rounded-xl border-neutral-200 bg-white text-neutral-400 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white active:border-neutral-900 active:bg-neutral-900 active:text-white'
                  : 'border-[var(--panel-border)] bg-[var(--panel-muted)] text-[var(--text-secondary)] hover:bg-[var(--button-primary-bg)] hover:text-[var(--button-primary-text)] active:bg-[var(--button-primary-bg)] active:text-[var(--button-primary-text)]',
              )}
              type="button"
            >
              {copy.clearQueue}
            </button>
          ) : null}
        </div>
      </div>

      <div className={isClassic ? 'divide-y divide-neutral-50 max-h-[400px] overflow-y-auto' : 'max-h-[400px] overflow-y-auto divide-y divide-[var(--soft-border)]'}>
        <AnimatePresence initial={false}>
          {files.length === 0 ? (
            <div className={isClassic ? 'py-16 text-center' : 'py-16 text-center'}>
              <div
                className={cx(
                  'w-12 h-12 flex items-center justify-center mx-auto mb-4',
                  isClassic
                    ? 'bg-neutral-50 rounded-full border border-neutral-100/50'
                    : 'border border-[var(--panel-border)] bg-[var(--panel-muted)] shadow-[var(--button-shadow)]',
                )}
              >
                <ImageIcon className={isClassic ? 'w-4 h-4 text-neutral-200' : 'w-4 h-4 text-[var(--text-muted)]'} />
              </div>
              <p className={isClassic ? 'text-xs text-neutral-300 font-medium tracking-tight' : 'text-xs font-medium tracking-[0.08em] uppercase text-[var(--text-muted)]'}>
                {copy.emptyQueue}
              </p>
            </div>
          ) : (
            files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cx(
                  'px-6 py-3.5 flex items-start gap-4 transition-colors group',
                  isClassic ? 'hover:bg-neutral-50/30' : 'hover:bg-black/[0.03]',
                )}
              >
                <Thumbnail file={file} theme={theme} />
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="mb-0.5 flex items-center gap-2 min-w-0">
                    <p className={isClassic ? 'min-w-0 text-xs font-medium text-neutral-800 truncate' : 'min-w-0 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)] truncate'}>
                      {file.name}
                    </p>
                    {file.compression ? <CompressionBadge copy={copy} theme={theme} /> : null}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={isClassic ? 'text-[9px] font-bold text-neutral-300 uppercase tracking-widest' : 'text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest'}>
                      {file.size}
                    </span>
                    <span className={isClassic ? 'w-0.5 h-0.5 rounded-full bg-neutral-200' : 'w-0.5 h-0.5 rounded-full bg-[var(--text-muted)]/60'} />
                    <span className={isClassic ? 'text-[9px] font-bold text-neutral-300 uppercase tracking-widest' : 'text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest'}>
                      {getFileTypeLabel(file.file)}
                    </span>
                  </div>
                  {file.compression ? <CompressionSummary copy={copy} file={file} theme={theme} /> : null}
                  {file.errorDetail ? <FailureSummary file={file} theme={theme} /> : null}
                  {file.status === 'uploading' ? <UploadProgress copy={copy} file={file} theme={theme} /> : null}
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <QueueStatusActions copy={copy} file={file} onDownloadFile={onDownloadFile} theme={theme} />
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    disabled={isConverting}
                    className={cx(
                      'p-2 transition-all disabled:cursor-not-allowed disabled:opacity-40',
                      isClassic
                        ? 'text-neutral-200 hover:text-neutral-500 hover:bg-neutral-100 rounded-lg'
                        : 'border border-transparent text-[var(--text-muted)] hover:border-[var(--panel-border)] hover:bg-[var(--panel-muted)] hover:text-[var(--text-primary)]',
                    )}
                    aria-label={copy.removeFile(file.name)}
                    title={copy.removeFile(file.name)}
                    type="button"
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
  );
}

interface CompressionBadgeProps {
  copy: ConverterCopy;
  theme: VisualTheme;
}

function CompressionBadge({ copy, theme }: CompressionBadgeProps): ReactElement {
  return (
    <span className="group relative inline-flex shrink-0 items-center">
      <span
        className={cx(
          'rounded-full px-2 py-1 text-[8px] font-bold uppercase tracking-[0.16em]',
          theme === 'classic'
            ? 'border border-amber-200 bg-amber-50 text-amber-700'
            : 'border border-[var(--panel-border)] bg-[var(--panel-muted)] text-[var(--text-primary)]',
        )}
      >
        {copy.compressedBadge}
      </span>
      <span
        className={cx(
          'pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-10 w-52 -translate-x-1/2 translate-y-1 px-3 py-2 text-[10px] font-medium normal-case tracking-normal opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100',
          theme === 'classic'
            ? 'rounded-xl border border-neutral-200 bg-white text-neutral-500 shadow-[0_10px_30px_rgba(0,0,0,0.08)]'
            : 'border border-[var(--panel-border)] bg-[var(--panel-muted)] text-[var(--text-secondary)] shadow-[var(--surface-shadow)]',
        )}
      >
        {copy.compressedTooltip}
      </span>
    </span>
  );
}

interface CompressionSummaryProps {
  copy: ConverterCopy;
  file: QueuedFile;
  theme: VisualTheme;
}

function CompressionSummary({ copy, file, theme }: CompressionSummaryProps): ReactElement | null {
  if (!file.compression) {
    return null;
  }

  return (
    <p
      className={cx(
        'mt-1 text-[10px] leading-relaxed',
        theme === 'classic' ? 'text-neutral-400' : 'text-[var(--text-secondary)]',
      )}
    >
      {copy.compressedSizeComparison(formatSize(file.compression.originalBytes), file.size)}
    </p>
  );
}

interface FailureSummaryProps {
  file: QueuedFile;
  theme: VisualTheme;
}

function FailureSummary({ file, theme }: FailureSummaryProps): ReactElement | null {
  if (!file.errorDetail) {
    return null;
  }

  return (
    <p
      className={cx(
        'mt-1 text-[10px] leading-relaxed',
        theme === 'classic' ? 'text-red-500' : 'text-[var(--error)]',
      )}
    >
      {file.errorDetail}
    </p>
  );
}

interface ThumbnailProps {
  file: QueuedFile;
  theme: VisualTheme;
}

function Thumbnail({ file, theme }: ThumbnailProps): ReactElement {
  if (file.thumbnail) {
    return (
      <div className={theme === 'classic' ? 'w-12 h-12 rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0 border border-neutral-100 shadow-sm' : 'queue-thumbnail'}>
        <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
    );
  }

  return theme === 'classic' ? (
    <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0 border border-neutral-100 shadow-sm flex items-center justify-center">
      <ImageIcon className="w-4 h-4 text-neutral-200" />
    </div>
  ) : (
    <div className="queue-thumbnail flex items-center justify-center">
      <ImageIcon className="h-4 w-4 text-[var(--text-muted)]" />
    </div>
  );
}

interface UploadProgressProps {
  copy: ConverterCopy;
  file: QueuedFile;
  theme: VisualTheme;
}

function UploadProgress({ copy, file, theme }: UploadProgressProps): ReactElement {
  const progress = file.uploadProgress ?? 0;

  if (theme === 'classic') {
    return (
      <div className="mt-2 space-y-1">
        <p className="text-[10px] font-medium tracking-tight text-neutral-400">{copy.uploadingFile(progress)}</p>
        <div className="h-1 rounded-full bg-neutral-100 overflow-hidden">
          <div className="h-full rounded-full bg-neutral-900/85 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="section-kicker">{copy.uploadingFile(progress)}</p>
      <div className="h-1.5 overflow-hidden border border-[var(--soft-border)] bg-[var(--accent-soft)]">
        <div className="h-full bg-[var(--button-primary-bg)] transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

interface QueueStatusActionsProps {
  copy: ConverterCopy;
  file: QueuedFile;
  onDownloadFile: (fileId: string) => void;
  theme: VisualTheme;
}

function QueueStatusActions({
  copy,
  file,
  onDownloadFile,
  theme,
}: QueueStatusActionsProps): ReactElement | null {
  if (file.status === 'uploading' || file.status === 'converting') {
    return theme === 'classic' ? (
      <Loader2 className="w-3.5 h-3.5 text-neutral-400 animate-spin" />
    ) : (
      <Loader2 className="h-4 w-4 animate-spin text-[var(--text-muted)]" />
    );
  }

  if (file.status === 'completed') {
    return theme === 'classic' ? (
      <>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <button
          onClick={() => onDownloadFile(file.id)}
          className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
          aria-label={copy.downloadFile(file.name)}
          title={copy.downloadFile(file.name)}
          type="button"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </>
    ) : (
      <>
        <CheckCircle2 className="h-4 w-4 text-[var(--text-primary)]" />
        <button
          onClick={() => onDownloadFile(file.id)}
          className="ghost-icon-button text-[var(--text-primary)]"
          aria-label={copy.downloadFile(file.name)}
          title={copy.downloadFile(file.name)}
          type="button"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      </>
    );
  }

  if (file.status === 'failed') {
    return theme === 'classic' ? (
      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
    ) : (
      <AlertCircle className="h-4 w-4 text-[var(--text-primary)]" />
    );
  }

  return null;
}
