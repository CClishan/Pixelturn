# Batch Image Converter

Local desktop tool for bulk image format conversion.

This repo now supports three ways of running:
- Tk desktop app from the repo root
- React + Python local web app
- Split Vercel deployment with separate frontend and backend projects

## Features

- Convert folders of images to JPG, PNG, WEBP, BMP, or TIFF.
- Process nested folders recursively.
- Optionally preserve the original folder structure.
- Adjustable quality for JPEG and WEBP output.
- Skip or overwrite existing files.
- Live log panel for converted and failed files.

## Supported input formats

- JPG / JPEG
- PNG
- WEBP
- BMP
- TIFF / TIF
- GIF

## Install

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
python3 app.py
```

## Web UI (React) + Python API

This repo also includes a browser UI at `image-converter-pro/` that talks to a local Python API.

1. Install backend dependencies:

```bash
python3 -m pip install -r requirements.txt
```

2. Start the API server (port `8000`):

```bash
python3 api_server.py
```

3. In a second terminal, run the frontend:

```bash
cd image-converter-pro
npm install
npm run dev
```

4. Open `http://localhost:3000`, add images, and click **Convert Now**.

### Sync start (backend + frontend)

Run both services with one command from repo root:

```bash
python3 dev_start.py
```

Press `Ctrl+C` to stop both.

Notes:
- Dev mode proxies `/api/*` from Vite to `http://127.0.0.1:8000`.
- Set `VITE_API_PROXY_TARGET` to change backend target in local dev.
- Set `VITE_API_BASE_URL` only if frontend is deployed separately from the API.

## GitHub

Initialize and push this folder as a new GitHub repository:

```bash
git init -b main
git add .
git commit -m "Prepare GitHub and Vercel deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

If the repo is already initialized locally, skip `git init`.

## Vercel deployment

Deploy this repo as two Vercel projects from the same GitHub repository.

### 1) Backend project

- Import the repo into Vercel.
- Set the Root Directory to the repository root.
- Vercel will use `index.py`, which exposes the Flask app from `api_server.py`.
- Optional environment variable:
  - `ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app`
  - You can provide multiple origins as a comma-separated list.

Backend routes:
- `/`
- `/api/health`
- `/api/convert-file`
- `/api/convert`

### 2) Frontend project

- Import the same GitHub repo into Vercel again.
- Set the Root Directory to `image-converter-pro`.
- Framework preset: Vite.
- Environment variable:
  - `VITE_API_BASE_URL=https://your-backend-domain.vercel.app`

### 3) Recommended order

1. Deploy the backend project first.
2. Copy the backend production URL into the frontend project's `VITE_API_BASE_URL`.
3. Redeploy the frontend project.
4. Add the frontend URL back into the backend `ALLOWED_ORIGINS`.

The web app now uploads files one at a time and creates the ZIP in the browser. This avoids the misleading CORS errors that can happen on Vercel when a multi-file upload is rejected before Flask can return its own headers.

### Vercel notes

- This app uploads files directly to the backend function, so Vercel is best for small to medium conversion batches.
- Local development still works the same way with `python3 dev_start.py`.

## Notes

- Converting transparent images to JPG will place them on a white background.
- The output folder must exist before starting the conversion.
