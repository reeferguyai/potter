# PotGrowHub — Base44 Dev Environment

## Architecture
Static PWA frontend (HTML/CSS/JS at repo root) + Express backend API in `backend/`.
Nginx serves static files on port 3000 and proxies `/api/*` to the Node.js backend on port 8787.

## Running
```
docker compose -f docker-compose.base44.yml up -d
```
- **web** (nginx:alpine): serves static files from repo root on port 3000, proxies `/api/` to backend
- **backend** (node:22-slim): runs `backend/server/index.js` with `--watch` (live reload); installs deps on startup

## Secrets
- `OPENAI_API_KEY` — powers the GanjaGuru AI chat (`/api/guru/chat`). Optional: without it the API returns a "not configured" message. Get from https://platform.openai.com/api-keys.
- `OPENAI_MODEL` — model name (defaults to gpt-4o-mini).

## Key files
- `index.html` — main PWA entry (references CDN-hosted lucide, model-viewer, Google Fonts)
- `script.js` — frontend logic (age gate, icons, service worker registration)
- `public/potgrowhub-runtime.js` — wires navigation routes, calls `/api/knowledge`
- `public/potgrowhub-gurabridge.js` — calls `/api/guru/chat`
- `backend/server/index.js` — Express API entry
- `backend/api/` — route handlers (guru, knowledge, commerce, market)
- `backend/services/guru.js` — OpenAI integration (degrades gracefully without key)

## Notes
- The repo root has restrictive permissions (700); nginx runs as root to read mounted files.
- The root `package.json` lists many heavy deps but the app doesn't need them — the frontend is pure static HTML using CDN scripts, and the backend has its own minimal `backend/package.json`.
- Subdirectory routes (`/ai/`, `/knowledge/`, `/ghost-commerce/`, `category/`) have their own `index.html` files.
