<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Image Converter Pro UI

React + Vite frontend for the batch image converter.

## Prerequisites

- Node.js
- Python API running from the repo root (`python3 api_server.py`)

## Run locally

1. Install dependencies:
   `npm install`
2. Start dev server:
   `npm run dev`
3. Open:
   `http://localhost:3000`

## Sync start (from repo root)

Start backend + frontend together:

`python3 dev_start.py`

## API config

- Dev proxy target (default `http://127.0.0.1:8000`):
  `VITE_API_PROXY_TARGET=http://127.0.0.1:8000`
- Optional direct API base URL (for deployed frontend):
  `VITE_API_BASE_URL=https://your-api-host`
