import type { ReactElement } from 'react';

import type { ConverterCopy } from '../copy';
import { cx, type VisualTheme } from '../theme';

interface UploadOptionCardsProps {
  autoCompressUploads: boolean;
  copy: ConverterCopy;
  singleFileLimit: string;
  theme: VisualTheme;
  totalUploadSize: string;
  onAutoCompressUploadsChange: (nextValue: boolean) => void;
}

export function UploadOptionCards({
  autoCompressUploads,
  copy,
  singleFileLimit,
  theme,
  totalUploadSize,
  onAutoCompressUploadsChange,
}: UploadOptionCardsProps): ReactElement {
  const isClassic = theme === 'classic';

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <section className={getCardClassName(theme)}>
        <label className={getSectionLabelClassName(theme)}>{copy.uploadStrategyLabel}</label>
        <p className={getBodyClassName(theme)}>{copy.uploadStrategyDescription}</p>
        <p className={getMetaClassName(theme)}>{copy.currentQueueSize(totalUploadSize)}</p>
      </section>

      <section className={getCardClassName(theme)}>
        <div className="flex items-center justify-between gap-3">
          <label className={getSectionLabelClassName(theme)}>{copy.autoCompressLabel}</label>
          <div
            className={cx(
              'inline-flex p-1',
              isClassic ? 'rounded-2xl border border-neutral-200 bg-neutral-50' : 'toggle-surface',
            )}
          >
            <button
              type="button"
              onClick={() => onAutoCompressUploadsChange(false)}
              className={getBinaryToggleClassName(theme, !autoCompressUploads)}
            >
              {copy.shared.off}
            </button>
            <button
              type="button"
              onClick={() => onAutoCompressUploadsChange(true)}
              className={getBinaryToggleClassName(theme, autoCompressUploads)}
            >
              {copy.shared.on}
            </button>
          </div>
        </div>
        <p className={getBodyClassName(theme)}>{copy.autoCompressDescription(singleFileLimit)}</p>
      </section>
    </div>
  );
}

function getCardClassName(theme: VisualTheme): string {
  if (theme === 'classic') {
    return 'rounded-2xl border border-neutral-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-3';
  }

  return 'border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 shadow-[var(--surface-shadow)] space-y-3';
}

function getSectionLabelClassName(theme: VisualTheme): string {
  if (theme === 'classic') {
    return 'text-[10px] font-bold text-neutral-300 uppercase tracking-widest';
  }

  return 'text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]';
}

function getBodyClassName(theme: VisualTheme): string {
  if (theme === 'classic') {
    return 'text-[11px] leading-relaxed text-neutral-500';
  }

  return 'text-[11px] leading-relaxed text-[var(--text-secondary)]';
}

function getMetaClassName(theme: VisualTheme): string {
  if (theme === 'classic') {
    return 'text-[11px] text-neutral-400';
  }

  return 'text-[11px] text-[var(--text-muted)]';
}

function getBinaryToggleClassName(theme: VisualTheme, isActive: boolean): string {
  if (theme === 'classic') {
    return cx(
      'px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300',
      isActive ? 'bg-neutral-900 text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'text-neutral-400 hover:text-neutral-700',
    );
  }

  return cx('toggle-button', isActive && 'toggle-button--active');
}
