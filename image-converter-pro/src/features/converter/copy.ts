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
  autoCompressLabel: string;
  autoCompressDescription: (limit: string) => string;
  convertNow: string;
  processing: string;
  downloadZip: string;
  clearQueue: string;
  emptyQueue: string;
  queueItems: (count: number) => string;
  currentQueueSize: (size: string) => string;
  downloadFile: (fileName: string) => string;
  removeFile: (fileName: string) => string;
  uploadingFile: (progress: number) => string;
  backendStatus: {
    title: string;
    checking: string;
    connected: string;
    disconnected: string;
    apiBaseLabel: string;
    localProxyValue: string;
    uploadLimitLabel: string;
    connectedDescription: string;
    disconnectedDescription: string;
  };
  notices: {
    conversionFailed: string;
    convertedSuccess: (count: number) => string;
    convertedSomeFailed: (count: number, failedFiles: string[]) => string;
    rejectedOversize: (limit: string, rejectedFiles: string[]) => string;
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
  shared: {
    on: string;
    off: string;
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
    autoCompressLabel: 'Oversize Uploads',
    autoCompressDescription: (limit) =>
      `Optionally recompress images in the browser before upload so oversized files can try to fit within the ${limit} single-image cap.`,
    convertNow: 'Convert Now',
    processing: 'Processing',
    downloadZip: 'Download ZIP',
    clearQueue: 'Clear Queue',
    emptyQueue: 'No images in queue',
    queueItems: (count) => `${count} items`,
    currentQueueSize: (size) => `Current queue size: ${size}`,
    downloadFile: (fileName) => `Download ${fileName}`,
    removeFile: (fileName) => `Remove ${fileName}`,
    uploadingFile: (progress) => `Loading into queue ${progress}%`,
    backendStatus: {
      title: 'Backend Status',
      checking: 'Checking handshake',
      connected: 'Handshake complete',
      disconnected: 'Handshake failed',
      apiBaseLabel: 'API base',
      localProxyValue: 'Same-origin /api proxy',
      uploadLimitLabel: 'Single image limit',
      connectedDescription: 'The frontend has connected to the backend health endpoint successfully.',
      disconnectedDescription: 'The backend health endpoint is not responding yet. Check the local API service.',
    },
    notices: {
      conversionFailed: 'Conversion failed. Please try again.',
      convertedSuccess: (count) => `Converted ${count} file(s). Use the queue or ZIP button to download.`,
      convertedSomeFailed: (count, failedFiles) =>
        `Converted ${count} file(s), but some failed: ${failedFiles.join(' | ')}`,
      rejectedOversize: (limit, rejectedFiles) =>
        `Skipped ${rejectedFiles.join(' | ')} because each image must stay within ${limit} for this deployment.`,
    },
    apiErrors: {
      failedToFetch:
        'The API request failed before the server responded. Check the backend deployment, use the backend site root as the API URL (not a /api path), review the CORS allowlist, and confirm the host upload-size limit is not being hit.',
      tooLarge: 'This image is larger than the current deployment upload limit.',
      responseStatus: (status) => `Conversion failed with status ${status}.`,
    },
    languageToggle: {
      label: 'Language',
      english: 'EN',
      chinese: '中文',
    },
    shared: {
      on: 'On',
      off: 'Off',
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
    autoCompressLabel: '超限图片处理',
    autoCompressDescription: (limit) =>
      `可选在浏览器上传前重新压缩超限图片，尽量让文件符合当前 ${limit} 的单图限制。`,
    convertNow: '立即转换',
    processing: '处理中',
    downloadZip: '打包下载',
    clearQueue: '清空队列',
    emptyQueue: '队列中还没有图片',
    queueItems: (count) => `${count} 项`,
    currentQueueSize: (size) => `当前队列大小：${size}`,
    downloadFile: (fileName) => `下载 ${fileName}`,
    removeFile: (fileName) => `移除 ${fileName}`,
    uploadingFile: (progress) => `加载到队列中 ${progress}%`,
    backendStatus: {
      title: '后端状态',
      checking: '正在握手检测',
      connected: '握手成功',
      disconnected: '握手失败',
      apiBaseLabel: 'API 地址',
      localProxyValue: '当前站点同源 /api 代理',
      uploadLimitLabel: '单图限制',
      connectedDescription: '前端已成功连接后端健康检查接口。',
      disconnectedDescription: '后端健康检查接口暂未响应，请检查本地 API 服务是否启动。',
    },
    notices: {
      conversionFailed: '转换失败，请重试。',
      convertedSuccess: (count) => `已完成 ${count} 个文件转换，可在队列中单独下载或点击打包下载。`,
      convertedSomeFailed: (count, failedFiles) =>
        `已完成 ${count} 个文件转换，但部分文件失败：${failedFiles.join(' | ')}`,
      rejectedOversize: (limit, rejectedFiles) =>
        `已跳过 ${rejectedFiles.join(' | ')}，当前部署要求单张图片不超过 ${limit}。`,
    },
    apiErrors: {
      failedToFetch: '请求在服务器响应前失败，请检查后端部署、API 地址是否填写为站点根地址（不要带 /api 路径）、CORS 配置，以及是否触发了部署平台的上传大小限制。',
      tooLarge: '当前图片体积过大，超出当前部署的上传限制。',
      responseStatus: (status) => `转换失败，状态码 ${status}。`,
    },
    languageToggle: {
      label: '语言',
      english: 'EN',
      chinese: '中文',
    },
    shared: {
      on: '开',
      off: '关',
    },
  },
};
