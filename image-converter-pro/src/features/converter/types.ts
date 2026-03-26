export type QueueStatus = 'uploading' | 'pending' | 'converting' | 'completed' | 'failed';

export interface QueuedFile {
  id: string;
  file: File;
  errorDetail?: string;
  thumbnail?: string;
  name: string;
  bytes: number;
  size: string;
  compression?: {
    originalBytes: number;
  };
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
