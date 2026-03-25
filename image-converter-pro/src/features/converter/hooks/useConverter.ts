import { useMemo, useState } from 'react';

import { convertQueuedFile, getFriendlyErrorMessage } from '../api';
import { downloadBlob, downloadQueueAsZip } from '../download';
import type { ConverterCopy } from '../copy';
import type { OutputFormat } from '../constants';
import type { QueuedFile } from '../types';
import { createQueuedFile, hasConvertedResult } from '../utils';

interface UseConverterOptions {
  apiBaseUrl: string;
  copy: ConverterCopy;
}

type ConverterNotice =
  | { type: 'error'; code: 'plain'; message: string }
  | { type: 'error'; code: 'partial_failure'; convertedCount: number; failedFiles: string[] }
  | { type: 'success'; code: 'converted'; convertedCount: number };

interface UseConverterResult {
  completedFilesCount: number;
  errorMessage: string | null;
  files: QueuedFile[];
  format: OutputFormat;
  isConverting: boolean;
  quality: number;
  successMessage: string | null;
  totalUploadSize: number;
  clearAll: () => void;
  handleConvert: () => Promise<void>;
  handleFiles: (newFiles: FileList | null) => void;
  handleSingleDownload: (fileId: string) => void;
  handleZipDownload: () => Promise<void>;
  removeFile: (fileId: string) => void;
  setFormat: (format: OutputFormat) => void;
  setQuality: (quality: number) => void;
}

export function useConverter({ apiBaseUrl, copy }: UseConverterOptions): UseConverterResult {
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [format, setFormat] = useState<OutputFormat>('JPG');
  const [quality, setQuality] = useState(85);
  const [isConverting, setIsConverting] = useState(false);
  const [notice, setNotice] = useState<ConverterNotice | null>(null);

  const totalUploadSize = useMemo(() => {
    return files.reduce((totalSize, file) => totalSize + file.bytes, 0);
  }, [files]);
  const completedFilesCount = useMemo(() => {
    return files.filter(hasConvertedResult).length;
  }, [files]);
  const { errorMessage, successMessage } = useMemo(() => {
    return getNoticeMessages(notice, copy);
  }, [copy, notice]);

  function handleFiles(newFiles: FileList | null): void {
    if (!newFiles) {
      return;
    }

    setNotice(null);
    setFiles((previousFiles) => [...previousFiles, ...Array.from(newFiles, createQueuedFile)]);
  }

  function removeFile(fileId: string): void {
    setFiles((previousFiles) => {
      const removedFile = previousFiles.find((file) => file.id === fileId);
      if (removedFile) {
        URL.revokeObjectURL(removedFile.thumbnail);
      }

      return previousFiles.filter((file) => file.id !== fileId);
    });
  }

  function clearAll(): void {
    files.forEach((file) => URL.revokeObjectURL(file.thumbnail));
    setFiles([]);
    setNotice(null);
  }

  function updateFile(fileId: string, updater: (file: QueuedFile) => QueuedFile): void {
    setFiles((previousFiles) => {
      return previousFiles.map((file) => (file.id === fileId ? updater(file) : file));
    });
  }

  async function handleConvert(): Promise<void> {
    if (files.length === 0) {
      return;
    }

    const queuedFiles = [...files];
    const failedFiles: string[] = [];

    setNotice(null);
    setIsConverting(true);
    setFiles((previousFiles) => {
      return previousFiles.map((file) => ({
        ...file,
        status: 'pending',
        convertedBlob: undefined,
        convertedName: undefined,
      }));
    });

    try {
      for (const queuedFile of queuedFiles) {
        updateFile(queuedFile.id, (file) => ({ ...file, status: 'converting' }));

        try {
          const conversionResult = await convertQueuedFile({
            apiBaseUrl,
            errorMessages: copy.apiErrors,
            file: queuedFile,
            format,
            quality,
          });

          updateFile(queuedFile.id, (file) => ({
            ...file,
            status: 'completed',
            convertedBlob: conversionResult.blob,
            convertedName: conversionResult.downloadName,
          }));
        } catch (error) {
          failedFiles.push(`${queuedFile.name}: ${getFriendlyErrorMessage(error, copy.apiErrors)}`);
          updateFile(queuedFile.id, (file) => ({
            ...file,
            status: 'failed',
            convertedBlob: undefined,
            convertedName: undefined,
          }));
        }
      }

      const convertedCount = queuedFiles.length - failedFiles.length;
      if (convertedCount === 0) {
        throw new Error(failedFiles[0] || copy.notices.conversionFailed);
      }

      if (failedFiles.length > 0) {
        setNotice({
          type: 'error',
          code: 'partial_failure',
          convertedCount,
          failedFiles,
        });
        return;
      }

      setNotice({
        type: 'success',
        code: 'converted',
        convertedCount,
      });
    } catch (error) {
      setFiles((previousFiles) => {
        return previousFiles.map((file) => {
          if (file.status === 'converting') {
            return { ...file, status: 'pending' };
          }

          return file;
        });
      });
      setNotice({
        type: 'error',
        code: 'plain',
        message: getFriendlyErrorMessage(error, copy.apiErrors),
      });
    } finally {
      setIsConverting(false);
    }
  }

  function handleSingleDownload(fileId: string): void {
    const targetFile = files.find((file) => file.id === fileId);
    if (!targetFile || !hasConvertedResult(targetFile)) {
      return;
    }

    downloadBlob(targetFile.convertedBlob, targetFile.convertedName);
  }

  async function handleZipDownload(): Promise<void> {
    await downloadQueueAsZip(files, format);
  }

  return {
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
  };
}

function getNoticeMessages(
  notice: ConverterNotice | null,
  copy: ConverterCopy,
): { errorMessage: string | null; successMessage: string | null } {
  if (!notice) {
    return { errorMessage: null, successMessage: null };
  }

  if (notice.type === 'success') {
    return {
      errorMessage: null,
      successMessage: copy.notices.convertedSuccess(notice.convertedCount),
    };
  }

  if (notice.code === 'partial_failure') {
    return {
      errorMessage: copy.notices.convertedSomeFailed(notice.convertedCount, notice.failedFiles),
      successMessage: null,
    };
  }

  return {
    errorMessage: notice.message,
    successMessage: null,
  };
}
