export const languages = ['en', 'zh'] as const;

export type Language = (typeof languages)[number];

export interface ConverterCopy {
  appTitle: string;
  configurationTitle: string;
  queueTitle: string;
  uploadPrompt: string;
  outputFormatLabel: string;
  qualityLabel: string;
  uploadStrategyLabel: string;
  uploadStrategyDescription: string;
  convertNow: string;
  processing: string;
  downloadZip: string;
  clearQueue: string;
  emptyQueue: string;
  queueItems: (count: number) => string;
  currentQueueSize: (size: string) => string;
  downloadFile: (fileName: string) => string;
  removeFile: (fileName: string) => string;
  notices: {
    conversionFailed: string;
    convertedSuccess: (count: number) => string;
    convertedSomeFailed: (count: number, failedFiles: string[]) => string;
  };
  apiErrors: {
    failedToFetch: string;
    tooLarge: string;
    responseStatus: (status: number) => string;
  };
  languageToggle: {
    label: string;
    english: string;
    chinese: string;
  };
}

export const converterCopy: Record<Language, ConverterCopy> = {
  en: {
    appTitle: 'Converter',
    configurationTitle: 'Configuration',
    queueTitle: 'Queue List',
    uploadPrompt: 'Drag & Drop or Click to Upload',
    outputFormatLabel: 'Output Format',
    qualityLabel: 'Quality',
    uploadStrategyLabel: 'Upload Strategy',
    uploadStrategyDescription:
      'Files convert one by one, stay in the queue after completion, and can be downloaded individually or as a ZIP when you are ready.',
    convertNow: 'Convert Now',
    processing: 'Processing',
    downloadZip: 'Download ZIP',
    clearQueue: 'Clear Queue',
    emptyQueue: 'No images in queue',
    queueItems: (count) => `${count} items`,
    currentQueueSize: (size) => `Current queue size: ${size}`,
    downloadFile: (fileName) => `Download ${fileName}`,
    removeFile: (fileName) => `Remove ${fileName}`,
    notices: {
      conversionFailed: 'Conversion failed. Please try again.',
      convertedSuccess: (count) => `Converted ${count} file(s). Use the queue or ZIP button to download.`,
      convertedSomeFailed: (count, failedFiles) =>
        `Converted ${count} file(s), but some failed: ${failedFiles.join(' | ')}`,
    },
    apiErrors: {
      failedToFetch:
        'The API request failed before the server responded. Check the backend deployment, API URL, and CORS allowlist.',
      tooLarge: 'This image is too large for the current backend deployment.',
      responseStatus: (status) => `Conversion failed with status ${status}.`,
    },
    languageToggle: {
      label: 'Language',
      english: 'EN',
      chinese: '中文',
    },
  },
  zh: {
    appTitle: '转换器',
    configurationTitle: '配置',
    queueTitle: '队列列表',
    uploadPrompt: '拖拽图片到这里，或点击上传',
    outputFormatLabel: '输出格式',
    qualityLabel: '质量',
    uploadStrategyLabel: '上传策略',
    uploadStrategyDescription: '文件会逐个转换，完成后保留在队列中，你可以按需单独下载或打包下载。',
    convertNow: '立即转换',
    processing: '处理中',
    downloadZip: '打包下载',
    clearQueue: '清空队列',
    emptyQueue: '队列中还没有图片',
    queueItems: (count) => `${count} 项`,
    currentQueueSize: (size) => `当前队列大小：${size}`,
    downloadFile: (fileName) => `下载 ${fileName}`,
    removeFile: (fileName) => `移除 ${fileName}`,
    notices: {
      conversionFailed: '转换失败，请重试。',
      convertedSuccess: (count) => `已完成 ${count} 个文件转换，可在队列中单独下载或点击打包下载。`,
      convertedSomeFailed: (count, failedFiles) =>
        `已完成 ${count} 个文件转换，但部分文件失败：${failedFiles.join(' | ')}`,
    },
    apiErrors: {
      failedToFetch: '请求在服务器响应前失败，请检查后端部署、API 地址和 CORS 配置。',
      tooLarge: '当前图片体积过大，超出后端部署限制。',
      responseStatus: (status) => `转换失败，状态码 ${status}。`,
    },
    languageToggle: {
      label: '语言',
      english: 'EN',
      chinese: '中文',
    },
  },
};
