/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState } from 'react';
import type { ReactElement } from 'react';

import { LanguageToggle } from './features/converter/components/LanguageToggle';
import { QueueList } from './features/converter/components/QueueList';
import { SettingsPanel } from './features/converter/components/SettingsPanel';
import { UploadDropzone } from './features/converter/components/UploadDropzone';
import { converterCopy, type Language } from './features/converter/copy';
import { useConverter } from './features/converter/hooks/useConverter';
import { formatSize } from './features/converter/utils';

export default function App(): ReactElement {
  const [language, setLanguage] = useState<Language>('en');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
  const copy = converterCopy[language];
  const {
    completedFilesCount,
    errorMessage,
    files,
    format,
    isConverting,
    quality,
    successMessage,
    totalUploadSize,
    clearAll,
    handleConvert,
    handleFiles,
    handleSingleDownload,
    handleZipDownload,
    removeFile,
    setFormat,
    setQuality,
  } = useConverter({ apiBaseUrl, copy });

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1D1D1F] font-sans p-8 md:p-16 selection:bg-neutral-200">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-8">
          <header className="min-h-10 flex items-center justify-between gap-6 flex-wrap">
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">{copy.appTitle}</h1>
            <LanguageToggle copy={copy} language={language} onLanguageChange={setLanguage} />
          </header>

          <UploadDropzone
            fileInputRef={fileInputRef}
            prompt={copy.uploadPrompt}
            onFilesSelected={handleFiles}
          />
          <QueueList
            copy={copy}
            files={files}
            isConverting={isConverting}
            onDownloadFile={handleSingleDownload}
            onRemoveFile={removeFile}
          />
        </div>

        <SettingsPanel
          completedCount={completedFilesCount}
          copy={copy}
          error={errorMessage}
          filesCount={files.length}
          format={format}
          isConverting={isConverting}
          quality={quality}
          successMessage={successMessage}
          totalUploadSize={formatSize(totalUploadSize)}
          onClearAll={clearAll}
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
