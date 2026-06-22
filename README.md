# Vikas Kannaujiya — Unified Platform

One website for everything: **portfolio, blog, notes, resume builder, option analysis, and admin** —
served by **one React frontend**, **one Python (FastAPI) backend**, and **one Postgres database**.

```
Browser ─> React SPA (Vite + nginx)
                │  /api/*  (proxied)
                ▼
          FastAPI backend (SQLModel + WeasyPrint + pandas)
                │
                ▼
            Postgres (one schema, all sections)
```

## Sections & gates

| Path | Section | Access |
|------|---------|--------|
| `/` | Hub launcher (cards into every section) | public |
| `/portfolio`, `/blog` | Portfolio + Markdown blog | public |
| `/notes` | Private Notion-style notes | `NOTES_PASSWORD` |
| `/resume-builder` | Resume builder + ATS + PDF export | `RESUME_PASSWORD` |
| `/option-analysis` | NSE option-chain analyzer | `OPTION_PASSWORD` |
| `/admin` | Content management for all of the above | `ADMIN_PASSWORD` |

Each gate issues a per-section JWT (`role` claim) from a single `JWT_SECRET`; the backend
enforces the matching role on every protected route.

## Tech stack

- **Frontend** — React 18, Vite, TailwindCSS, Framer Motion, React Router. Built to static files, served by nginx (which also proxies `/api`).
- **Backend** — FastAPI, SQLModel, psycopg2, PyJWT. Resume PDFs via **WeasyPrint** (no headless browser); option analysis via **pandas/numpy**.
- **Database** — PostgreSQL (one schema; `backend/app/models/` defines all tables).

## Run locally

```bash
docker compose up --build -d
# frontend  → http://localhost:8080
# backend   → http://localhost:8002   (health: /health)
# postgres  → localhost:5433
docker exec platform_backend python -m app.seed   # first-time seed data
```

Secrets/ports are overridable via `.env` (see `.env.example`): `JWT_SECRET`,
`ADMIN_PASSWORD`, `NOTES_PASSWORD`, `RESUME_PASSWORD`, `OPTION_PASSWORD`,
`WEB_HOST_PORT`, `API_HOST_PORT`, `PG_HOST_PORT`, and optional `SMTP_*` for resume email.

## Layout

```
backend/      FastAPI app (routers, models, services, seed) + Dockerfile
newclient/    React SPA (src/routes, src/apps/{resume,option}, src/features) + nginx + Dockerfile
docker-compose.yml   Postgres + backend + frontend
DEPLOY.md     Neon Postgres + Render + Vercel deploy guide
```

## Deploy

See [DEPLOY.md](DEPLOY.md) — Neon (Postgres) + Render (Docker FastAPI) + Vercel (SPA).
