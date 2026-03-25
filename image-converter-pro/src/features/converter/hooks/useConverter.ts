import { useEffect, useMemo, useRef, useState } from 'react';

import { convertQueuedFile, getFriendlyErrorMessage } from '../api';
import { downloadBlob, downloadQueueAsZip } from '../download';
import type { ConverterCopy } from '../copy';
import type { OutputFormat } from '../constants';
import type { QueuedFile } from '../types';
import { createQueuedFile, hasConvertedResult } from '../utils';

interface UseConverterOptions {
  apiBaseUrl: string;
  copy: ConverterCopy;
  singleFileLimitBytes: number;
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
  uploadingFilesCount: number;
  clearAll: () => void;
  handleConvert: () => Promise<void>;
  handleFiles: (newFiles: FileList | null) => void;
  handleSingleDownload: (fileId: string) => void;
  handleZipDownload: () => Promise<void>;
  removeFile: (fileId: string) => void;
  setFormat: (format: OutputFormat) => void;
  setQuality: (quality: number) => void;
}

export function useConverter({ apiBaseUrl, copy, singleFileLimitBytes }: UseConverterOptions): UseConverterResult {
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [format, setFormat] = useState<OutputFormat>('JPG');
  const [quality, setQuality] = useState(85);
  const [isConverting, setIsConverting] = useState(false);
  const [notice, setNotice] = useState<ConverterNotice | null>(null);
  const fileReadersRef = useRef(new Map<string, FileReader>());
  const thumbnailUrlsRef = useRef(new Map<string, string>());

  useEffect(() => {
    return () => {
      fileReadersRef.current.forEach((reader) => {
        if (reader.readyState === FileReader.LOADING) {
          reader.abort();
        }
      });
      thumbnailUrlsRef.current.forEach((thumbnailUrl) => {
        URL.revokeObjectURL(thumbnailUrl);
      });
    };
  }, []);

  const totalUploadSize = useMemo(() => {
    return files.reduce((totalSize, file) => totalSize + file.bytes, 0);
  }, [files]);
  const completedFilesCount = useMemo(() => {
    return files.filter(hasConvertedResult).length;
  }, [files]);
  const uploadingFilesCount = useMemo(() => {
    return files.filter((file) => file.status === 'uploading').length;
  }, [files]);
  const { errorMessage, successMessage } = useMemo(() => {
    return getNoticeMessages(notice, copy);
  }, [copy, notice]);

  function handleFiles(newFiles: FileList | null): void {
    if (!newFiles) {
      return;
    }

    const { queuedFiles, rejectedFiles } = Array.from(newFiles).reduce(
      (result, file) => {
        if (file.size > singleFileLimitBytes) {
          result.rejectedFiles.push(file.name);
          return result;
        }

        result.queuedFiles.push(createQueuedFile(file));
        return result;
      },
      { queuedFiles: [] as QueuedFile[], rejectedFiles: [] as string[] },
    );

    setNotice(
      rejectedFiles.length > 0
        ? {
            type: 'error',
            code: 'plain',
            message: copy.notices.rejectedOversize(formatLimit(singleFileLimitBytes), rejectedFiles),
          }
        : null,
    );
    setFiles((previousFiles) => [...previousFiles, ...queuedFiles]);
    queuedFiles.forEach(prepareQueuedFile);
  }

  function prepareQueuedFile(queuedFile: QueuedFile): void {
    const reader = new FileReader();
    fileReadersRef.current.set(queuedFile.id, reader);

    reader.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const nextProgress = Math.max(5, Math.min(99, Math.round((event.loaded / event.total) * 100)));
      updateFile(queuedFile.id, (file) => ({
        ...file,
        uploadProgress: nextProgress,
      }));
    };

    reader.onload = () => {
      const thumbnail = URL.createObjectURL(queuedFile.file);
      thumbnailUrlsRef.current.set(queuedFile.id, thumbnail);
      updateFile(queuedFile.id, (file) => ({
        ...file,
        thumbnail,
        status: 'pending',
        uploadProgress: 100,
      }));
    };

    reader.onerror = () => {
      updateFile(queuedFile.id, (file) => ({
        ...file,
        status: 'failed',
        uploadProgress: undefined,
      }));
    };

    reader.onloadend = () => {
      fileReadersRef.current.delete(queuedFile.id);
    };

    reader.readAsArrayBuffer(queuedFile.file);
  }

  function removeFile(fileId: string): void {
    const activeReader = fileReadersRef.current.get(fileId);
    if (activeReader?.readyState === FileReader.LOADING) {
      activeReader.abort();
    }
    fileReadersRef.current.delete(fileId);

    const thumbnailUrl = thumbnailUrlsRef.current.get(fileId);
    if (thumbnailUrl) {
      URL.revokeObjectURL(thumbnailUrl);
      thumbnailUrlsRef.current.delete(fileId);
    }

    setFiles((previousFiles) => previousFiles.filter((file) => file.id !== fileId));
  }

  function clearAll(): void {
    fileReadersRef.current.forEach((reader) => {
      if (reader.readyState === FileReader.LOADING) {
        reader.abort();
      }
    });
    fileReadersRef.current.clear();

    thumbnailUrlsRef.current.forEach((thumbnailUrl) => {
      URL.revokeObjectURL(thumbnailUrl);
    });
    thumbnailUrlsRef.current.clear();

    setFiles([]);
    setNotice(null);
  }

  function updateFile(fileId: string, updater: (file: QueuedFile) => QueuedFile): void {
    setFiles((previousFiles) => {
      return previousFiles.map((file) => (file.id === fileId ? updater(file) : file));
    });
  }

  async function handleConvert(): Promise<void> {
    if (files.length === 0 || uploadingFilesCount > 0) {
      return;
    }

    const queuedFiles = files.filter((file) => file.status !== 'uploading');
    const failedFiles: string[] = [];

    setNotice(null);
    setIsConverting(true);
    setFiles((previousFiles) => {
      return previousFiles.map((file) => {
        if (file.status === 'uploading') {
          return file;
        }

        return {
          ...file,
          status: 'pending',
          uploadProgress: undefined,
          convertedBlob: undefined,
          convertedName: undefined,
        };
      });
    });

    try {
      for (const queuedFile of queuedFiles) {
        updateFile(queuedFile.id, (file) => ({ ...file, status: 'converting', uploadProgress: undefined }));

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
    uploadingFilesCount,
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

function formatLimit(limitBytes: number): string {
  return `${Number((limitBytes / (1024 * 1024)).toFixed(2))} MB`;
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
