export type QueueStatus = 'pending' | 'converting' | 'completed' | 'failed';

export interface QueuedFile {
  id: string;
  file: File;
  thumbnail: string;
  name: string;
  bytes: number;
  size: string;
  status: QueueStatus;
  convertedBlob?: Blob;
  convertedName?: string;
}

export interface ConversionResult {
  blob: Blob;
  downloadName: string;
}
