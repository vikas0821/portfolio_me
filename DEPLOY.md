# Deploying the Unified Platform

One website = **one React frontend** (Vercel) → **one FastAPI backend** (Render) → **one MongoDB** (Atlas).
Everything (portfolio, blog, notes, resume builder, option analysis, admin) runs on this single stack.

```
Browser ──> Vercel (static SPA)
                │  API calls
                ▼
          Render (FastAPI + WeasyPrint)  ──>  MongoDB Atlas
```

---

## 1. Database — MongoDB Atlas (free tier)

1. Create a free M0 cluster at https://www.mongodb.com/atlas → create a database user.
2. Network Access → allow `0.0.0.0/0` (or Render's egress IPs).
3. Copy the connection string (the `mongodb+srv://…` form):
   ```
   mongodb+srv://USER:PASSWORD@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
   ```
   The database name (`portfolio`) is set separately via `MONGO_DB`.

---

## 2. Backend — Render (Docker)

The backend ships as a Dockerfile (`backend/Dockerfile`) that installs WeasyPrint's
system libs (Pango/Cairo) — no Puppeteer/Chromium needed.

1. New → **Web Service** → connect this repo → **Root Directory: `backend`** → Runtime **Docker**.
2. Environment variables:

   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | the Atlas `mongodb+srv://…` connection string |
   | `MONGO_DB` | database name, e.g. `portfolio` |
   | `JWT_SECRET` | a long random string |
   | `ADMIN_PASSWORD` | your admin password |
   | `NOTES_PASSWORD` | your notes password |
   | `RESUME_PASSWORD` | your resume password |
   | `OPTION_PASSWORD` | your option-analysis password |
   | `CORS_ORIGINS` | your Vercel URL, e.g. `https://yoursite.vercel.app` |
   | `OUTPUT_DIR` | `/app/output` (default; ephemeral — fine for on-the-fly PDFs) |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `FROM_EMAIL` / `FROM_NAME` | *(optional)* only if you use resume → email send |

3. The container starts uvicorn on `$PORT` automatically. Health check path: `/health`.
4. After first deploy, **seed** the production DB once (Render → *Shell*):
   ```bash
   python -m app.seed
   ```
   Note: `seed.py` wipes and re-inserts portfolio/blog/notes data. Run it only for the initial load.

> Render free tier sleeps after inactivity → first request has a ~50s cold start. WeasyPrint
> PDF generation is CPU-light (no headless browser), so it fits the free RAM budget.

---

## 3. Frontend — Vercel

The SPA reads its API base URLs at **build time**. Point them at the Render backend.

1. New Project → import repo → **Root Directory: `frontend`** → Framework **Vite**.
2. Environment variables (Production):

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://YOUR-BACKEND.onrender.com/api/v1/` |
   | `VITE_OPTION_API_URL` | `https://YOUR-BACKEND.onrender.com/api/v1/option` |
   | `VITE_RESUME_API_URL` | `https://YOUR-BACKEND.onrender.com` |

3. SPA routing — `frontend/vercel.json` must rewrite all paths to `index.html` so
   `/portfolio`, `/admin`, `/resume-builder/...` deep-link correctly:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```
4. Deploy. Then set the backend's `CORS_ORIGINS` to the final Vercel domain and redeploy the backend.

---

## 4. Local — the whole stack in one command

```bash
docker compose up --build -d
# frontend  → http://localhost:8080
# backend   → http://localhost:8002  (health: /health)
# mongodb   → localhost:27018
docker exec platform_backend python -m app.seed   # first-time data
```

Override host ports / secrets via env: `WEB_HOST_PORT`, `API_HOST_PORT`, `PG_HOST_PORT`,
`JWT_SECRET`, `ADMIN_PASSWORD`, `NOTES_PASSWORD`, `RESUME_PASSWORD`, `OPTION_PASSWORD`.

---

## Routes & gates

| Path | Section | Gate |
|------|---------|------|
| `/` | Hub launcher | — |
| `/portfolio`, `/blog` | Portfolio + blog | public |
| `/notes` | Notes workspace | `NOTES_PASSWORD` |
| `/resume-builder` | Resume builder | `RESUME_PASSWORD` |
| `/option-analysis` | Option analyzer | `OPTION_PASSWORD` |
| `/admin` | Content admin | `ADMIN_PASSWORD` |

All gates issue a per-section JWT (`role` claim) from one secret; the backend enforces the
matching role on every protected route.
