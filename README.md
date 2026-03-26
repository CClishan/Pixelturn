# Batch Image Converter / 批量图片转换器

A React + Vite frontend paired with a Flask + Pillow backend for batch image conversion in the browser.

一个基于 React + Vite 前端、Flask + Pillow 后端的批量图片转换项目，主要面向浏览器使用场景。

## Overview / 项目概览

- EN: Users add multiple images into a queue, choose output format and quality, convert files one by one, then download individual outputs or a browser-generated ZIP.
- 中文：用户可将多张图片加入队列，选择输出格式和质量，逐张转换，并单独下载结果或下载浏览器端生成的 ZIP。
- EN: The current product shape is a web app first. The frontend manages queue state, previews, retry-friendly UX, and ZIP packaging. The backend focuses on image conversion APIs.
- 中文：当前产品形态以 Web 应用为主。前端负责队列状态、预览、偏重可恢复的交互体验以及 ZIP 打包；后端专注图片转换 API。

## Architecture / 架构说明

### High-level flow / 高层流程

1. EN: The browser uploads one file at a time to the Flask API.
   中文：浏览器以“单文件请求”的方式向 Flask API 上传图片。
2. EN: The backend converts the image with Pillow and returns the converted binary directly.
   中文：后端使用 Pillow 执行转换，并直接返回转换后的二进制文件。
3. EN: The frontend stores successful results in memory, keeps failed items visible in the queue, and creates a ZIP in the browser when requested.
   中文：前端将成功结果保存在内存中，失败项继续留在队列中可见，并在需要时于浏览器端生成 ZIP。

### Responsibility split / 职责划分

- `image-converter-pro/`
  - EN: Vite + React UI, queue state, file previews, health checks, error handling, browser ZIP generation, optional client-side recompression.
  - 中文：Vite + React 界面、队列状态、文件预览、健康检查、错误处理、浏览器端 ZIP 生成，以及可选的前端预压缩。
- `backend/api_server.py`
  - EN: Flask API, CORS handling, upload-size guard, health endpoint, single-file and batch conversion endpoints.
  - 中文：Flask API、CORS 处理、上传大小保护、健康检查接口，以及单文件/批量转换接口。
- `backend/converter_core.py`
  - EN: Pillow-based conversion logic shared by the API.
  - 中文：由 API 复用的 Pillow 图片转换核心逻辑。
- `scripts/dev_start.py`
  - EN: Local helper that starts frontend and backend together.
  - 中文：用于本地同时启动前后端的辅助脚本。
- `index.py`
  - EN: Deployment entry point used by the backend hosting target such as Vercel.
  - 中文：供后端部署目标（如 Vercel）使用的入口文件。

## Core capabilities / 核心功能

### Conversion / 转换能力

- EN: Output formats: JPG, PNG, WEBP, BMP, TIFF.
- 中文：输出格式支持 JPG、PNG、WEBP、BMP、TIFF。
- EN: Supported image inputs in backend core: JPG/JPEG, PNG, WEBP, BMP, TIFF/TIF, GIF.
- 中文：后端核心支持的输入格式包括 JPG/JPEG、PNG、WEBP、BMP、TIFF/TIF、GIF。
- EN: Adjustable quality for lossy targets.
- 中文：支持调整有损输出格式的质量参数。
- EN: Transparent images converted to JPG are flattened onto a white background.
- 中文：透明图片转换为 JPG 时会以白色背景进行铺底。

### Queue and download / 队列与下载

- EN: Multi-file queue with per-item preview thumbnails.
- 中文：支持多文件队列，并展示每项缩略图预览。
- EN: Per-item success or failure state remains visible in the queue.
- 中文：每个文件的成功或失败状态都会保留在队列中。
- EN: Individual download for converted items.
- 中文：支持单个已转换文件直接下载。
- EN: ZIP download built in the browser from completed outputs.
- 中文：支持将已完成结果在浏览器端打包成 ZIP 下载。

## Interaction capabilities / 交互能力

### Upload and queue UX / 上传与队列交互

- EN: Drag-and-drop or click-to-upload.
- 中文：支持拖拽上传和点击上传。
- EN: Files enter a queue before conversion starts.
- 中文：文件先进入队列，再由用户手动触发转换。
- EN: Upload progress is shown while files are being prepared locally.
- 中文：文件在本地准备阶段会显示进度。
- EN: Users can remove single items or clear the queue.
- 中文：支持删除单个文件或清空整个队列。

### Conversion controls / 转换控制

- EN: Output format buttons and quality slider.
- 中文：提供输出格式切换按钮和质量滑杆。
- EN: Convert button is guarded by backend health state and queue readiness.
- 中文：转换按钮会根据后端健康状态和队列准备状态自动启用/禁用。
- EN: Completed items can be downloaded individually without re-running the batch.
- 中文：已完成项可直接单独下载，无需重新跑整批转换。

### Upload resilience / 上传稳健性

- EN: Configurable single-image limit enforced in the frontend.
- 中文：前端可配置并执行单图上传大小限制。
- EN: Matching upload-size guard in the backend via `MAX_UPLOAD_MB`.
- 中文：后端通过 `MAX_UPLOAD_MB` 提供对应的上传大小保护。
- EN: Optional "Oversize Uploads" mode recompresses oversized images in the browser before upload.
- 中文：可选的 “Oversize Uploads” 模式会在上传前于浏览器端尝试重新压缩超限图片。
- EN: Auto-compressed items are labeled in the queue and show original vs. compressed size.
- 中文：自动压缩过的文件会在队列中被标记，并展示压缩前后大小对比。
- EN: Compression failures explain why the file was rejected, for example browser decode failure or inability to fit under the limit.
- 中文：压缩失败会给出明确原因，例如浏览器无法解码，或即使压缩后仍无法降到限制以内。

### Diagnostics / 诊断能力

- EN: Frontend health checks the backend through `/api/health`.
- 中文：前端会通过 `/api/health` 对后端进行健康检查。
- EN: The UI shows backend status, resolved API base URL, and active single-image limit.
- 中文：界面会显示后端连接状态、当前解析后的 API 地址，以及当前单图限制。
- EN: API URL normalization protects against misconfigured values such as appending `/api` to `VITE_API_BASE_URL`.
- 中文：前端会自动规范化 API 地址，避免 `VITE_API_BASE_URL` 错填成带 `/api` 路径的形式。

## Project structure / 目录结构

```text
batch-image-converter/
|-- index.py
|-- backend/
|   |-- api_server.py
|   `-- converter_core.py
|-- scripts/
|   `-- dev_start.py
`-- image-converter-pro/
    |-- package.json
    `-- src/
```

## Local development / 本地开发

### Backend setup / 后端安装

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Start backend only / 仅启动后端

```bash
python3 -m backend.api_server
```

### Start frontend only / 仅启动前端

```bash
cd image-converter-pro
npm install
npm run dev
```

Open `http://localhost:3000` after both services are running.

当前前后端都启动后，访问 `http://localhost:3000`。

### Start both together / 一键同时启动

```bash
python3 scripts/dev_start.py
```

## Environment variables / 环境变量

### Frontend / 前端

- `VITE_API_PROXY_TARGET`
  - EN: Dev proxy target. Default: `http://127.0.0.1:8000`
  - 中文：开发环境代理目标，默认值为 `http://127.0.0.1:8000`
- `VITE_API_BASE_URL`
  - EN: Direct backend base URL for split deployments. Use the backend site root only.
  - 中文：用于前后端分离部署时的后端基础地址，只能填写后端站点根地址。
  - EN: Do not append `/api`, `/api/health`, or `/api/convert-file`.
  - 中文：不要追加 `/api`、`/api/health` 或 `/api/convert-file`。
- `VITE_SINGLE_FILE_LIMIT_MB`
  - EN: Frontend single-image limit in MB. Default: `4`
  - 中文：前端单图大小限制，单位 MB，默认 `4`

### Backend / 后端

- `ALLOWED_ORIGINS`
  - EN: Comma-separated CORS allowlist.
  - 中文：逗号分隔的 CORS 白名单。
- `MAX_UPLOAD_MB`
  - EN: Backend upload cap in MB. Default: `4`
  - 中文：后端上传大小限制，单位 MB，默认 `4`

## API endpoints / API 接口

- `GET /`
  - EN: Basic backend info.
  - 中文：返回基础后端信息。
- `GET /api/health`
  - EN: Health probe used by the frontend.
  - 中文：供前端使用的健康检查接口。
- `POST /api/convert-file`
  - EN: Current primary endpoint used by the frontend.
  - 中文：当前前端主要使用的单文件转换接口。
- `POST /api/convert`
  - EN: Batch endpoint retained in the backend, currently not the primary path used by the browser UI.
  - 中文：后端保留的批量转换接口，但当前浏览器 UI 不是主要走这条路径。

## Deployment / 部署说明

### Recommended production shape / 推荐部署形态

- EN: Deploy the backend and frontend as two separate services.
- 中文：建议前后端拆分为两个独立服务部署。
- EN: Deploy backend first, then place its root URL into the frontend `VITE_API_BASE_URL`.
- 中文：先部署后端，再把后端根地址写入前端的 `VITE_API_BASE_URL`。
- EN: Add the frontend domain back into backend `ALLOWED_ORIGINS`.
- 中文：再把前端域名回填到后端的 `ALLOWED_ORIGINS` 中。

### Vercel-specific notes / Vercel 特别说明

- EN: This project can be deployed to Vercel as split frontend and backend projects from the same repository.
- 中文：本项目可以在同一个仓库下拆成前端和后端两个 Vercel 项目部署。
- EN: Keep `MAX_UPLOAD_MB` and `VITE_SINGLE_FILE_LIMIT_MB` at or below `4` on Vercel.
- 中文：如果部署在 Vercel，建议 `MAX_UPLOAD_MB` 和 `VITE_SINGLE_FILE_LIMIT_MB` 都保持在 `4` 或更低。
- EN: The frontend uploads one file at a time and creates ZIP files in the browser to reduce misleading platform-layer upload failures.
- 中文：前端采用逐文件上传、浏览器端打 ZIP 的方式，以减少平台层上传限制带来的误导性错误。

## Current limitations / 当前限制

- EN: Converted results are stored in browser memory until downloaded or cleared.
- 中文：转换结果会暂存在浏览器内存中，直到用户下载或清空队列。
- EN: Very large images may still exceed platform limits even after recompression.
- 中文：超大图片即便经过预压缩，也可能仍然超过部署平台限制。
- EN: Browser-side recompression may change file format, dimensions, or visual fidelity.
- 中文：浏览器端预压缩可能改变文件格式、分辨率或画质表现。

## Frontend-specific guide / 前端专项说明

See `/Users/a003/batch-image-converter/image-converter-pro/README.md` for the UI-focused guide.

更偏前端视角的说明可查看 `/Users/a003/batch-image-converter/image-converter-pro/README.md`。
