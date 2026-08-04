# Vikas Kannaujiya — Unified Platform

One website for everything: **portfolio, blog, notes, resume builder, option analysis, and admin** —
served by **one React frontend**, **one Python (FastAPI) backend**, and **one MongoDB database**.

```
Browser ─> React SPA (Vite + nginx)
                │  /api/*  (proxied)
                ▼
          FastAPI backend (PyMongo + WeasyPrint + pandas)
                │
                ▼
            MongoDB (one database, all sections)
```

The public portfolio renders instantly from bundled fallback data and swaps in live
data once the backend responds — so a Render free-tier cold start (backend asleep,
~1-2 min to wake) never shows a blank page. The whole site (portfolio + every private
tool) shares one comic-book/pop-art visual design system.

## Sections & gates

| Path | Section | Access |
|------|---------|--------|
| `/` | Hub launcher (cards into every section) | public |
| `/portfolio`, `/blog` | Portfolio + Markdown blog | public |
| `/notes` | Private Notion-style notes | `NOTES_PASSWORD` |
| `/resume-builder` | Resume editor (auto-filled from your portfolio data, 5 selectable designs, PDF/HTML export) + external job-application tracker + recruiter email templates | `RESUME_PASSWORD` |
| `/option-analysis` | NSE option-chain analyzer | `OPTION_PASSWORD` |
| `/admin` | Content management for all of the above | `ADMIN_PASSWORD` |

Each gate issues a per-section JWT (`role` claim) from a single `JWT_SECRET`; the backend
enforces the matching role on every protected route.

## Tech stack

- **Frontend** — React 18, Vite, TailwindCSS, Framer Motion, React Router. Built to static files, served by nginx (which also proxies `/api`).
- **Backend** — FastAPI, PyMongo, PyJWT. Resume PDFs via **WeasyPrint** (no headless browser); option analysis via **pandas/numpy**.
- **Database** — MongoDB (one database; collections accessed via the `backend/app/database.py` repository helpers).

## Run locally

```bash
docker compose up --build -d
# frontend  → http://localhost:8080
# backend   → http://localhost:8002   (health: /health)
# mongodb   → localhost:27018
docker exec platform_backend python -m app.seed   # first-time seed data
```

Secrets/ports are overridable via `.env` (see `.env.example`): `JWT_SECRET`,
`ADMIN_PASSWORD`, `NOTES_PASSWORD`, `RESUME_PASSWORD`, `OPTION_PASSWORD`,
`WEB_HOST_PORT`, `API_HOST_PORT`, `MONGO_HOST_PORT`, and optional `SMTP_*` for
sending recruiter emails from the resume builder.

## Layout

```
backend/      FastAPI app (routers, models, services, seed) + Dockerfile
frontend/     React SPA (src/routes, src/apps/{resume,option}, src/features) + nginx + Dockerfile
docker-compose.yml   MongoDB + backend + frontend
DEPLOY.md     MongoDB Atlas + Render + Vercel deploy guide
```

## Deploy

See [DEPLOY.md](DEPLOY.md) — MongoDB Atlas + Render (Docker FastAPI) + Vercel (SPA).
