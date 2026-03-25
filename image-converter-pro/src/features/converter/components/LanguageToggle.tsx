import { Languages } from 'lucide-react';
import type { ReactElement } from 'react';

import type { ConverterCopy, Language } from '../copy';

interface LanguageToggleProps {
  copy: ConverterCopy;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageToggle({
  copy,
  language,
  onLanguageChange,
}: LanguageToggleProps): ReactElement {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-400 flex items-center gap-2">
        <Languages className="w-3.5 h-3.5" />
        {copy.languageToggle.label}
      </span>
      <div className="inline-flex rounded-2xl border border-neutral-200 bg-white p-1 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => onLanguageChange('en')}
          className={getButtonClassName(language === 'en')}
          type="button"
        >
          {copy.languageToggle.english}
        </button>
        <button
          onClick={() => onLanguageChange('zh')}
          className={getButtonClassName(language === 'zh')}
          type="button"
        >
          {copy.languageToggle.chinese}
        </button>
      </div>
    </div>
  );
}

function getButtonClassName(isActive: boolean): string {
  if (isActive) {
    return 'px-3 py-2 rounded-xl bg-neutral-900 text-white text-[11px] font-bold tracking-tight transition-all';
  }

  return 'px-3 py-2 rounded-xl text-[11px] font-bold tracking-tight text-neutral-500 hover:text-neutral-700 transition-all';
}
