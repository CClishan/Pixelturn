import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import type { ChangeEvent, DragEvent, ReactElement, RefObject } from 'react';

interface UploadDropzoneProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  prompt: string;
  onFilesSelected: (files: FileList | null) => void;
}

export function UploadDropzone({
  fileInputRef,
  prompt,
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
