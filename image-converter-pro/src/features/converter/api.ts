import type { OutputFormat } from './constants';
import { formatToApiKey } from './constants';
import type { ConversionResult, QueuedFile } from './types';
import { buildApiUrl, getOutputName } from './utils';

interface ApiErrorMessages {
  failedToFetch: string;
  tooLarge: string;
  responseStatus: (status: number) => string;
}

export function getFriendlyErrorMessage(
  error: unknown,
  messages: ApiErrorMessages,
): string {
  if (error instanceof Error) {
    if (/Failed to fetch/i.test(error.message)) {
      return messages.failedToFetch;
    }

    return error.message;
  }

  return messages.responseStatus(500);
}

export async function checkBackendHealth(apiBaseUrl: string): Promise<boolean> {
  const response = await fetch(buildApiUrl(apiBaseUrl, '/api/health'));
  return response.ok;
}

export async function convertQueuedFile(options: {
  apiBaseUrl: string;
  errorMessages: ApiErrorMessages;
  file: QueuedFile;
  format: OutputFormat;
  quality: number;
}): Promise<ConversionResult> {
  const { apiBaseUrl, errorMessages, file, format, quality } = options;
  const formData = new FormData();
  formData.append('file', file.file);
  formData.append('format', formatToApiKey[format]);
  formData.append('quality', String(quality));

  const response = await fetch(buildApiUrl(apiBaseUrl, '/api/convert-file'), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessageFromResponse(response, errorMessages));
  }

  const blob = new Blob([await response.arrayBuffer()], {
    type: response.headers.get('Content-Type') || file.file.type || 'application/octet-stream',
  });
  const downloadName =
    getDownloadNameFromHeader(response.headers.get('Content-Disposition')) ||
    getOutputName(file.name, format);

  return { blob, downloadName };
}

async function getErrorMessageFromResponse(
  response: Response,
  messages: ApiErrorMessages,
): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload.error) {
      return payload.error;
    }
  } catch {
    // Response body is not JSON.
  }

  if (response.status === 413) {
    return messages.tooLarge;
  }

  return messages.responseStatus(response.status);
}

function getDownloadNameFromHeader(header: string | null): string | null {
  if (!header) {
    return null;
  }

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = header.match(/filename="?([^";]+)"?/i);
  return basicMatch?.[1] || null;
}
