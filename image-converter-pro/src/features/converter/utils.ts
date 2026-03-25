import type { OutputFormat } from './constants';
import { outputSuffixByFormat } from './constants';
import type { QueuedFile } from './types';

export const defaultSingleFileLimitBytes = 4 * 1024 * 1024;

export function formatSize(bytes: number): string {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const unitBase = 1024;
  const sizeUnits = ['Bytes', 'KB', 'MB', 'GB'];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(unitBase));

  return `${parseFloat((bytes / Math.pow(unitBase, unitIndex)).toFixed(2))} ${sizeUnits[unitIndex]}`;
}

export function getFileTypeLabel(file: File): string {
  return file.type.split('/')[1]?.toUpperCase() || 'FILE';
}

const knownApiSuffixes = ['/api/health', '/api/convert-file', '/api/convert', '/api'];

function stripKnownApiSuffix(value: string): string {
  const trimmedValue = value.replace(/\/+$/, '');
  if (!trimmedValue) {
    return '';
  }

  const lowerCasedValue = trimmedValue.toLowerCase();
  const matchedSuffix = knownApiSuffixes.find((suffix) => lowerCasedValue.endsWith(suffix));
  if (!matchedSuffix) {
    return trimmedValue;
  }

  return trimmedValue.slice(0, -matchedSuffix.length);
}

export function normalizeApiBaseUrl(rawApiBaseUrl: string): string {
  const trimmedValue = rawApiBaseUrl.trim();
  if (!trimmedValue) {
    return '';
  }

  try {
    const parsedUrl = new URL(trimmedValue);
    const normalizedPathname = stripKnownApiSuffix(parsedUrl.pathname);
    parsedUrl.pathname = normalizedPathname || '/';
    parsedUrl.search = '';
    parsedUrl.hash = '';

    return `${parsedUrl.origin}${parsedUrl.pathname === '/' ? '' : parsedUrl.pathname}`;
  } catch {
    return stripKnownApiSuffix(trimmedValue);
  }
}

export function getSingleFileLimitBytes(rawLimitMb: string | undefined): number {
  const parsedLimitMb = Number(rawLimitMb);
  if (!Number.isFinite(parsedLimitMb) || parsedLimitMb <= 0) {
    return defaultSingleFileLimitBytes;
  }

  return Math.round(parsedLimitMb * 1024 * 1024);
}

export function buildApiUrl(apiBaseUrl: string, path: string): string {
  return apiBaseUrl ? `${apiBaseUrl}${path}` : path;
}

export function getOutputName(fileName: string, format: OutputFormat): string {
  const lastDot = fileName.lastIndexOf('.');
  const baseName = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;

  return `${baseName || 'image'}${outputSuffixByFormat[format]}`;
}

export function getUniqueName(fileName: string, usedNames: Set<string>): string {
  if (!usedNames.has(fileName)) {
    usedNames.add(fileName);
    return fileName;
  }

  const lastDot = fileName.lastIndexOf('.');
  const baseName = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
  const extension = lastDot > 0 ? fileName.slice(lastDot) : '';

  let duplicate = 1;
  let candidate = `${baseName}_${duplicate}${extension}`;

  while (usedNames.has(candidate)) {
    duplicate += 1;
    candidate = `${baseName}_${duplicate}${extension}`;
  }

  usedNames.add(candidate);
  return candidate;
}

export function createQueuedFile(file: File): QueuedFile {
  return {
    id: Math.random().toString(36).substring(7),
    file,
    name: file.name,
    bytes: file.size,
    size: formatSize(file.size),
    status: 'uploading',
    uploadProgress: 0,
  };
}

export function hasConvertedResult(
  file: QueuedFile,
): file is QueuedFile & Required<Pick<QueuedFile, 'convertedBlob' | 'convertedName'>> {
  return file.status === 'completed' && Boolean(file.convertedBlob) && Boolean(file.convertedName);
}
