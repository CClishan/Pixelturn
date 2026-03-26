# Image Converter Pro UI / 图片转换前端界面

Frontend application for the Batch Image Converter project.

Batch Image Converter 项目的前端应用说明。

## What this frontend does / 这个前端负责什么

- EN: Provides drag-and-drop and click-to-upload entry points.
- 中文：提供拖拽上传与点击上传入口。
- EN: Manages the queue, previews, format and quality controls.
- 中文：负责队列、预览、输出格式与质量控制。
- EN: Calls the Flask backend for conversion and keeps completed items in memory for download.
- 中文：调用 Flask 后端完成转换，并在前端内存中保存已完成结果用于下载。
- EN: Builds ZIP downloads in the browser with `fflate`.
- 中文：使用 `fflate` 在浏览器端完成 ZIP 打包下载。
- EN: Includes optional browser-side recompression for oversized uploads.
- 中文：包含可选的浏览器端超限图片预压缩能力。

## UI interaction model / 交互模型

### Main flow / 主流程

1. EN: Add one or more images.
   中文：加入一张或多张图片。
2. EN: Review the queue and remove anything you do not want.
   中文：检查队列并移除不需要的文件。
3. EN: Adjust output format and quality.
   中文：调整输出格式与质量。
4. EN: Optionally enable `Oversize Uploads` if you need best-effort browser recompression.
   中文：如需尽量适配上传限制，可开启 `Oversize Uploads`。
5. EN: Click `Convert Now` after backend health is ready.
   中文：待后端状态正常后，点击 `Convert Now`。
6. EN: Download individual files or export a ZIP.
   中文：下载单个结果文件或导出 ZIP。

### Queue behavior / 队列行为

- EN: Each file shows status, preview, file size, and file type.
- 中文：每个文件都会显示状态、预览、文件大小和文件类型。
- EN: Auto-compressed items show a badge and original-to-compressed size comparison.
- 中文：自动压缩过的文件会显示标记及压缩前后大小对比。
- EN: Failed items stay visible in the queue and can display detailed failure reasons.
- 中文：失败项会保留在队列中，并显示具体失败原因。
- EN: Successful items can be downloaded individually.
- 中文：成功项支持单独下载。

### Upload option cards / 上传功能卡片

- EN: `Upload Strategy` explains that uploads are converted one by one and ZIP creation happens in the browser.
- 中文：`Upload Strategy` 说明当前采用逐文件转换、浏览器端 ZIP 打包的策略。
- EN: `Oversize Uploads` controls whether oversized files should be recompressed in the browser before upload.
- 中文：`Oversize Uploads` 控制超限文件是否在上传前先于浏览器中尝试重新压缩。

## Diagnostics / 诊断能力

- EN: Backend health is checked through `/api/health`.
- 中文：通过 `/api/health` 检查后端健康状态。
- EN: The UI shows current backend status, API base URL, and single-image upload cap.
- 中文：界面会显示当前后端状态、API 地址和单图上传限制。
- EN: API URL normalization protects against common deployment misconfiguration such as adding `/api` to the base URL.
- 中文：前端会自动修正常见部署错误，例如把 `/api` 错填进基础地址。

## Local run / 本地运行

### Install / 安装

```bash
npm install
```

### Start / 启动

```bash
npm run dev
```

Open `http://localhost:3000`.

访问 `http://localhost:3000`。

### Start with backend together / 与后端一起启动

Run from repo root:

在仓库根目录执行：

```bash
python3 scripts/dev_start.py
```

## Frontend environment variables / 前端环境变量

- `VITE_API_PROXY_TARGET`
  - EN: Dev proxy target. Default `http://127.0.0.1:8000`
  - 中文：开发代理目标，默认 `http://127.0.0.1:8000`
- `VITE_API_BASE_URL`
  - EN: Optional direct backend root URL for deployed frontend.
  - 中文：部署场景下前端直连后端时使用的可选根地址。
  - EN: Use the backend root only. Do not append `/api`, `/api/health`, or `/api/convert-file`.
  - 中文：只能填后端根地址，不要附加 `/api`、`/api/health` 或 `/api/convert-file`。
- `VITE_SINGLE_FILE_LIMIT_MB`
  - EN: Frontend single-image limit in MB. Default `4`
  - 中文：前端单图上传限制，单位 MB，默认 `4`

## Tech stack / 技术栈

- React 19
- Vite
- TypeScript
- Tailwind CSS 4 (via Vite plugin)
- Motion
- Lucide React
- fflate

## Related files / 相关文件

- `/Users/a003/batch-image-converter/image-converter-pro/src/App.tsx`
  - EN: Main page composition.
  - 中文：页面主结构与模块组合。
- `/Users/a003/batch-image-converter/image-converter-pro/src/features/converter/hooks/useConverter.ts`
  - EN: Queue state, upload preparation, conversion flow, and download logic.
  - 中文：队列状态、上传准备、转换流程与下载逻辑。
- `/Users/a003/batch-image-converter/image-converter-pro/src/features/converter/components/QueueList.tsx`
  - EN: Queue item rendering and status feedback.
  - 中文：队列项渲染与状态反馈。
- `/Users/a003/batch-image-converter/image-converter-pro/src/features/converter/components/UploadOptionCards.tsx`
  - EN: Upload strategy and oversize-upload controls.
  - 中文：上传策略与超限上传控制卡片。

## Related backend guide / 后端关联说明

See `/Users/a003/batch-image-converter/README.md` for the full project architecture and deployment guide.

完整项目架构和部署说明请查看 `/Users/a003/batch-image-converter/README.md`。
