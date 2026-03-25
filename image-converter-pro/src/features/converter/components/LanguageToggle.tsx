import type { ReactElement } from 'react';

import type { ConverterCopy, Language } from '../copy';
import type { VisualTheme } from '../theme';

interface LanguageToggleProps {
  copy: ConverterCopy;
  language: Language;
  onLanguageChange: (language: Language) => void;
  theme: VisualTheme;
}

export function LanguageToggle({
  copy,
  language,
  onLanguageChange,
  theme,
}: LanguageToggleProps): ReactElement {
  if (theme === 'classic') {
    return (
      <div className="inline-flex rounded-2xl border border-neutral-200 bg-white p-1 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => onLanguageChange('en')}
          className={getClassicButtonClassName(language === 'en')}
          type="button"
        >
          {copy.languageToggle.english}
        </button>
        <button
          onClick={() => onLanguageChange('zh')}
          className={getClassicButtonClassName(language === 'zh')}
          type="button"
        >
          {copy.languageToggle.chinese}
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex border border-[var(--panel-border)] bg-[var(--panel-bg)] p-1 shadow-[var(--button-shadow)]">
      <button
        onClick={() => onLanguageChange('en')}
        className={getPixelButtonClassName(language === 'en')}
        type="button"
      >
        {copy.languageToggle.english}
      </button>
      <button
        onClick={() => onLanguageChange('zh')}
        className={getPixelButtonClassName(language === 'zh')}
        type="button"
      >
        {copy.languageToggle.chinese}
      </button>
    </div>
  );
}

function getClassicButtonClassName(isActive: boolean): string {
  if (isActive) {
    return 'px-3 py-1.25 rounded-xl bg-neutral-900 text-white text-[11px] font-bold tracking-tight transition-all';
  }

  return 'px-3 py-1.25 rounded-xl text-[11px] font-bold tracking-tight text-neutral-500 hover:text-neutral-700 transition-all';
}

function getPixelButtonClassName(isActive: boolean): string {
  if (isActive) {
    return 'px-3 py-1.25 bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] text-[11px] font-semibold uppercase tracking-[0.14em] transition-all';
  }

  return 'px-3 py-1.25 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all';
}
