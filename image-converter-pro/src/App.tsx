/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';

import { LanguageToggle } from './features/converter/components/LanguageToggle';
import { QueueList } from './features/converter/components/QueueList';
import { SettingsPanel } from './features/converter/components/SettingsPanel';
import { UploadDropzone } from './features/converter/components/UploadDropzone';
import { converterCopy, type Language } from './features/converter/copy';
import { useBackendHealth } from './features/converter/hooks/useBackendHealth';
import { useConverter } from './features/converter/hooks/useConverter';
import { cx, type PixelScheme, type VisualTheme } from './features/converter/theme';
import { formatSize } from './features/converter/utils';

const THEME_STORAGE_KEY = 'batch-image-converter-theme';
const PIXEL_SCHEME_STORAGE_KEY = 'batch-image-converter-pixel-scheme';

const themeSwitchCopy = {
  en: {
    classic: 'Native',
    pixel: 'Pixel',
  },
  zh: {
    classic: '原生',
    pixel: '像素',
  },
} as const;

const pixelSchemeCopy = {
  en: {
    dark: 'Black',
    light: 'White',
  },
  zh: {
    dark: '黑',
    light: '白',
  },
} as const;

function getInitialTheme(): VisualTheme {
  if (typeof window === 'undefined') {
    return 'classic';
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === 'pixel' ? 'pixel' : 'classic';
}

function getInitialPixelScheme(): PixelScheme {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const savedScheme = window.localStorage.getItem(PIXEL_SCHEME_STORAGE_KEY);
  return savedScheme === 'light' ? 'light' : 'dark';
}

export default function App(): ReactElement {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<VisualTheme>(getInitialTheme);
  const [pixelScheme, setPixelScheme] = useState<PixelScheme>(getInitialPixelScheme);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
  const copy = converterCopy[language];
  const themeCopy = themeSwitchCopy[language];
  const pixelToneCopy = pixelSchemeCopy[language];
  const backendStatus = useBackendHealth(apiBaseUrl);
  const {
    completedFilesCount,
    errorMessage,
    files,
    format,
    isConverting,
    quality,
    successMessage,
    totalUploadSize,
    uploadingFilesCount,
    clearAll,
    handleConvert,
    handleFiles,
    handleSingleDownload,
    handleZipDownload,
    removeFile,
    setFormat,
    setQuality,
  } = useConverter({ apiBaseUrl, copy });

  useEffect(() => {
    document.body.dataset.theme = theme;
    document.body.dataset.language = language;
    document.body.dataset.pixelScheme = pixelScheme;
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem(PIXEL_SCHEME_STORAGE_KEY, pixelScheme);
  }, [language, pixelScheme, theme]);

  return (
    <div
      className={cx(
        'min-h-screen p-8 md:p-16',
        theme === 'classic'
          ? 'bg-[#FDFDFD] text-[#1D1D1F] font-sans selection:bg-neutral-200'
          : 'bg-[var(--app-bg)] text-[var(--text-primary)] [font-family:var(--font-body)] selection:bg-[var(--selection-bg)]',
      )}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-8">
          <header className="min-h-10 flex items-center justify-between gap-6 flex-wrap">
            <h1
              className={cx(
                theme === 'classic'
                  ? 'text-xl font-semibold tracking-tight text-neutral-900'
                  : 'display-face text-lg font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)] md:text-xl',
              )}
            >
              {copy.appTitle}
            </h1>
            <div className="flex items-center gap-4 flex-wrap justify-end">
              <CompactThemeToggle copy={themeCopy} theme={theme} onThemeChange={setTheme} />
              {theme === 'pixel' ? (
                <PixelSchemeToggle copy={pixelToneCopy} pixelScheme={pixelScheme} onSchemeChange={setPixelScheme} />
              ) : null}
              <LanguageToggle
                copy={copy}
                language={language}
                onLanguageChange={setLanguage}
                theme={theme}
              />
            </div>
          </header>

          <UploadDropzone
            fileInputRef={fileInputRef}
            prompt={copy.uploadPrompt}
            theme={theme}
            onFilesSelected={handleFiles}
          />

          <QueueList
            copy={copy}
            files={files}
            isConverting={isConverting}
            theme={theme}
            onClearAll={clearAll}
            onDownloadFile={handleSingleDownload}
            onRemoveFile={removeFile}
          />
        </div>

        <SettingsPanel
          backendStatus={backendStatus}
          completedCount={completedFilesCount}
          copy={copy}
          error={errorMessage}
          filesCount={files.length}
          format={format}
          isConverting={isConverting}
          quality={quality}
          successMessage={successMessage}
          theme={theme}
          totalUploadSize={formatSize(totalUploadSize)}
          uploadingFilesCount={uploadingFilesCount}
          onConvert={() => {
            void handleConvert();
          }}
          onFormatChange={setFormat}
          onQualityChange={setQuality}
          onZipDownload={() => {
            void handleZipDownload();
          }}
        />
      </div>
    </div>
  );
}

interface CompactThemeToggleProps {
  copy: (typeof themeSwitchCopy)[Language];
  theme: VisualTheme;
  onThemeChange: (theme: VisualTheme) => void;
}

interface PixelSchemeToggleProps {
  copy: (typeof pixelSchemeCopy)[Language];
  onSchemeChange: (scheme: PixelScheme) => void;
  pixelScheme: PixelScheme;
}

function CompactThemeToggle({ copy, theme, onThemeChange }: CompactThemeToggleProps): ReactElement {
  return (
    <div
      className={cx(
        'inline-flex p-1 transition-colors',
        theme === 'classic'
          ? 'rounded-2xl border border-neutral-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
          : 'border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-[var(--button-shadow)]',
      )}
    >
      <button
        type="button"
        onClick={() => onThemeChange('classic')}
        className={getCompactButtonClassName(theme, theme === 'classic')}
      >
        {copy.classic}
      </button>
      <button
        type="button"
        onClick={() => onThemeChange('pixel')}
        className={getCompactButtonClassName(theme, theme === 'pixel')}
      >
        {copy.pixel}
      </button>
    </div>
  );
}

function getCompactButtonClassName(theme: VisualTheme, isActive: boolean): string {
  if (theme === 'classic') {
    if (isActive) {
      return 'px-3 py-1.25 rounded-xl bg-neutral-900 text-white text-[11px] font-bold tracking-tight transition-all';
    }

    return 'px-3 py-1.25 rounded-xl text-[11px] font-bold tracking-tight text-neutral-500 hover:text-neutral-700 transition-all';
  }

  if (isActive) {
    return 'px-3 py-1.25 bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] text-[11px] font-semibold uppercase tracking-[0.14em] transition-all';
  }

  return 'px-3 py-1.25 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all';
}

function PixelSchemeToggle({ copy, onSchemeChange, pixelScheme }: PixelSchemeToggleProps): ReactElement {
  return (
    <div className="inline-flex border border-[var(--panel-border)] bg-[var(--panel-bg)] p-1 shadow-[var(--button-shadow)]">
      <button
        type="button"
        onClick={() => onSchemeChange('dark')}
        className={getPixelSchemeButtonClassName(pixelScheme === 'dark')}
      >
        {copy.dark}
      </button>
      <button
        type="button"
        onClick={() => onSchemeChange('light')}
        className={getPixelSchemeButtonClassName(pixelScheme === 'light')}
      >
        {copy.light}
      </button>
    </div>
  );
}

function getPixelSchemeButtonClassName(isActive: boolean): string {
  if (isActive) {
    return 'px-3 py-1.25 bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] text-[11px] font-semibold uppercase tracking-[0.14em] transition-all';
  }

  return 'px-3 py-1.25 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all';
}
