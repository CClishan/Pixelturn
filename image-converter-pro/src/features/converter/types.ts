export type QueueStatus = 'uploading' | 'pending' | 'converting' | 'completed' | 'failed';

export interface QueuedFile {
  id: string;
  file: File;
  thumbnail?: string;
  name: string;
  bytes: number;
  size: string;
  status: QueueStatus;
  uploadProgress?: number;
  convertedBlob?: Blob;
  convertedName?: string;
}

export interface ConversionResult {
  blob: Blob;
  downloadName: string;
}

export type BackendConnectionState = 'checking' | 'connected' | 'disconnected';
