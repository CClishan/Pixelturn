import { zipSync } from 'fflate';

import type { OutputFormat } from './constants';
import { formatToApiKey } from './constants';
import type { QueuedFile } from './types';
import { getUniqueName, hasConvertedResult } from './utils';

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function downloadQueueAsZip(files: QueuedFile[], format: OutputFormat): Promise<void> {
  const completedFiles = files.filter(hasConvertedResult);
  if (completedFiles.length === 0) {
    return;
  }

  const usedZipNames = new Set<string>();
  const zipEntries: Record<string, Uint8Array> = {};

  for (const file of completedFiles) {
    const zipName = getUniqueName(file.convertedName, usedZipNames);
    zipEntries[zipName] = new Uint8Array(await file.convertedBlob.arrayBuffer());
  }

  const zipData = zipSync(zipEntries, { level: 6 });
  const zipFileName = `converted_${formatToApiKey[format].toLowerCase()}.zip`;
  downloadBlob(new Blob([zipData], { type: 'application/zip' }), zipFileName);
}
