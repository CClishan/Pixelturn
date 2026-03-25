import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import type { ChangeEvent, DragEvent, ReactElement, RefObject } from 'react';

import type { VisualTheme } from '../theme';

interface UploadDropzoneProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  prompt: string;
  queueCountLabel?: string | null;
  supportingText?: string;
  theme: VisualTheme;
  onFilesSelected: (files: FileList | null) => void;
}

export function UploadDropzone({
  fileInputRef,
  prompt,
  queueCountLabel,
  supportingText,
  theme,
  onFilesSelected,
}: UploadDropzoneProps): ReactElement {
  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    onFilesSelected(event.target.files);
    event.target.value = '';
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.stopPropagation();
    onFilesSelected(event.dataTransfer.files);
  }

  if (theme === 'classic') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-neutral-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.01)] p-16 flex flex-col items-center justify-center transition-all duration-500 hover:border-neutral-300 cursor-pointer group relative overflow-hidden"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 bg-neutral-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleInputChange}
        />
        <div className="w-14 h-14 bg-neutral-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 border border-neutral-100 shadow-sm">
          <Plus className="w-5 h-5 text-neutral-400" />
        </div>
        <p className="text-neutral-400 font-medium text-sm tracking-tight">{prompt}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-[var(--panel-border)] bg-[var(--panel-bg)] p-16 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer group relative overflow-hidden shadow-[var(--surface-shadow)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          fileInputRef.current?.click();
        }
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,transparent_calc(100%-1px),rgba(17,17,17,0.08)_calc(100%-1px)),linear-gradient(180deg,transparent_0,transparent_calc(100%-1px),rgba(17,17,17,0.08)_calc(100%-1px))] bg-[length:18px_18px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/*"
        onChange={handleInputChange}
      />

      <div className="relative z-[1] flex flex-col items-center gap-5 text-center">
        <div className="flex h-14 w-14 items-center justify-center border border-[var(--panel-border)] bg-[var(--panel-muted)] shadow-[var(--button-shadow)]">
          <Plus className="h-5 w-5 text-[var(--text-primary)]" />
        </div>
        <p className="mx-auto max-w-2xl text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)]">
          {prompt}
        </p>
      </div>
    </motion.div>
  );
}
