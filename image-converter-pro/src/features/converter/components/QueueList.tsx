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
import type { QueuedFile } from '../types';
import { getFileTypeLabel } from '../utils';

interface QueueListProps {
  copy: ConverterCopy;
  files: QueuedFile[];
  isConverting: boolean;
  onDownloadFile: (fileId: string) => void;
  onRemoveFile: (fileId: string) => void;
}

export function QueueList({
  copy,
  files,
  isConverting,
  onDownloadFile,
  onRemoveFile,
}: QueueListProps): ReactElement {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] border border-neutral-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between bg-white">
        <h2 className="text-sm font-semibold flex items-center gap-2.5 text-neutral-800">
          <Layers className="w-3.5 h-3.5 text-neutral-400" />
          {copy.queueTitle}
        </h2>
        <span className="text-[9px] uppercase tracking-widest text-neutral-300 font-bold">
          {copy.queueItems(files.length)}
        </span>
      </div>

      <div className="divide-y divide-neutral-50 max-h-[400px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {files.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-100/50">
                <ImageIcon className="w-4 h-4 text-neutral-200" />
              </div>
              <p className="text-xs text-neutral-300 font-medium tracking-tight">{copy.emptyQueue}</p>
            </div>
          ) : (
            files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-6 py-3.5 flex items-center gap-4 hover:bg-neutral-50/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0 border border-neutral-100 shadow-sm transition-transform group-hover:scale-105 duration-500">
                  <img
                    src={file.thumbnail}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-neutral-800 truncate mb-0.5">{file.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">{file.size}</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-neutral-200" />
                    <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">
                      {getFileTypeLabel(file.file)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <QueueStatusActions copy={copy} file={file} onDownloadFile={onDownloadFile} />
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    disabled={isConverting}
                    className="p-2 text-neutral-200 hover:text-neutral-500 hover:bg-neutral-100 rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-40"
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

interface QueueStatusActionsProps {
  copy: ConverterCopy;
  file: QueuedFile;
  onDownloadFile: (fileId: string) => void;
}

function QueueStatusActions({
  copy,
  file,
  onDownloadFile,
}: QueueStatusActionsProps): ReactElement | null {
  if (file.status === 'converting') {
    return <Loader2 className="w-3.5 h-3.5 text-neutral-400 animate-spin" />;
  }

  if (file.status === 'completed') {
    return (
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
    );
  }

  if (file.status === 'failed') {
    return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
  }

  return null;
}
