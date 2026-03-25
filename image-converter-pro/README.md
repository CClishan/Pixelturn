<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Image Converter Pro UI

React + Vite frontend for the batch image converter.

The frontend source lives in `image-converter-pro/` and talks to the Flask backend in `../backend/`.

## Prerequisites

- Node.js
`python3 -m backend.api_server`

## Run locally

1. Install dependencies:

   `npm install`

2. Start the dev server:

   `npm run dev`

3. Open:

   `http://localhost:3000`

## Sync start (from repo root)

Start backend + frontend together:

`python3 scripts/dev_start.py`

## Related project structure

```text
batch-image-converter/
|-- backend/
|   |-- api_server.py
|   `-- converter_core.py
|-- index.py
|-- scripts/
|   `-- dev_start.py
`-- image-converter-pro/
    |-- package.json
    `-- src/
```

## API config

- Dev proxy target (default `http://127.0.0.1:8000`):
  `VITE_API_PROXY_TARGET=http://127.0.0.1:8000`
- Optional direct API base URL (for deployed frontend):
  `VITE_API_BASE_URL=https://your-api-host`
  - Use the backend site root only. Do not append `/api`, `/api/health`, or `/api/convert-file`.
- Optional single-image cap shown and enforced by the frontend:
  `VITE_SINGLE_FILE_LIMIT_MB=4`
  - Keep this aligned with the backend `MAX_UPLOAD_MB`. On Vercel, stay at or below `4`.
- Oversized files can also be recompressed in the browser from the settings panel before they enter the queue.
