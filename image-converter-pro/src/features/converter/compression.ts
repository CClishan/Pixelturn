const qualitySteps = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5, 0.42];
const scaleSteps = [1, 0.92, 0.84, 0.76, 0.68, 0.6, 0.52, 0.44];

export type CompressionFailureReason = 'unsupported_image' | 'browser_limit' | 'cannot_fit';

export type CompressionResult =
  | { ok: true; file: File }
  | { ok: false; reason: CompressionFailureReason };

export async function compressImageToFit(file: File, maxBytes: number): Promise<CompressionResult> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, reason: 'unsupported_image' };
  }

  const image = await loadImage(file).catch(() => null);
  if (!image) {
    return { ok: false, reason: 'browser_limit' };
  }

  const originalWidth = image.naturalWidth || image.width;
  const originalHeight = image.naturalHeight || image.height;
  if (!originalWidth || !originalHeight) {
    return { ok: false, reason: 'browser_limit' };
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    return { ok: false, reason: 'browser_limit' };
  }

  let bestBlob: Blob | null = null;
  const mimeCandidates = getMimeCandidates(file.type);

  for (const mimeType of mimeCandidates) {
    for (const scale of scaleSteps) {
      canvas.width = Math.max(1, Math.round(originalWidth * scale));
      canvas.height = Math.max(1, Math.round(originalHeight * scale));

      context.clearRect(0, 0, canvas.width, canvas.height);
      if (mimeType === 'image/jpeg') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const shouldIterateQuality = mimeType === 'image/jpeg' || mimeType === 'image/webp';
      const candidateQualities = shouldIterateQuality ? qualitySteps : [undefined];

      for (const quality of candidateQualities) {
        const nextBlob = await canvasToBlob(canvas, mimeType, quality);
        if (!nextBlob) {
          continue;
        }

        if (!bestBlob || nextBlob.size < bestBlob.size) {
          bestBlob = nextBlob;
        }

        if (nextBlob.size <= maxBytes) {
          return { ok: true, file: createFileFromBlob(file, nextBlob, mimeType) };
        }
      }
    }
  }

  if (!bestBlob || bestBlob.size > maxBytes) {
    return { ok: false, reason: 'cannot_fit' };
  }

  return { ok: true, file: createFileFromBlob(file, bestBlob, bestBlob.type || file.type) };
}

function getMimeCandidates(originalMimeType: string): string[] {
  const normalizedMimeType = originalMimeType.toLowerCase();
  const hasTransparencyRisk = ['image/png', 'image/webp', 'image/gif'].includes(normalizedMimeType);

  if (hasTransparencyRisk) {
    return ['image/webp', 'image/png', 'image/jpeg'];
  }

  return ['image/jpeg', 'image/webp', 'image/png'];
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

function createFileFromBlob(originalFile: File, blob: Blob, mimeType: string): File {
  return new File([blob], replaceExtension(originalFile.name, getExtensionForMimeType(mimeType)), {
    type: mimeType,
    lastModified: originalFile.lastModified,
  });
}

function replaceExtension(fileName: string, nextExtension: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  const stem = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;

  return `${stem || 'image'}${nextExtension}`;
}

function getExtensionForMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/webp':
      return '.webp';
    case 'image/png':
    default:
      return '.png';
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image.'));
    };
    image.src = objectUrl;
  });
}
