export const outputFormats = ['JPG', 'PNG', 'WEBP', 'BMP', 'TIFF'] as const;

export type OutputFormat = (typeof outputFormats)[number];

export const formatToApiKey: Record<OutputFormat, string> = {
  JPG: 'JPG',
  PNG: 'PNG',
  WEBP: 'WEBP',
  BMP: 'BMP',
  TIFF: 'TIFF',
};

export const outputSuffixByFormat: Record<OutputFormat, string> = {
  JPG: '.jpg',
  PNG: '.png',
  WEBP: '.webp',
  BMP: '.bmp',
  TIFF: '.tiff',
};
