# Vikas Kannaujiya — Portfolio

A full-stack personal portfolio: a React (Vite) frontend backed by a single Node.js/Express
API that stores all content in MongoDB. **Everything is editable from an admin dashboard** —
profile, projects, experience, skills, a Markdown **blog**, section text, SEO, and even the
accent color. The downloadable **résumé is generated on the fly from the live data**, so it's
always in sync. Runs locally with one Docker command and deploys to free hosting
(Render + Vercel + MongoDB Atlas).

---

## Features

- **Fully editable content** — manage profile, skills, projects, experience, education,
  certifications and contact messages from `/admin`.
- **Site Settings** — edit section headings/subtitles, hero text & button labels, footer,
  SEO (page title + meta description), and the **accent color** (live, no rebuild).
- **Blog** — write posts in **Markdown** (with code highlighting) from the admin; published
  to a dedicated `/blog` page and `/blog/:slug` post pages.
- **Self-updating résumé** — the "Download Resume" button generates a formatted PDF in the
  browser from your current data (`@react-pdf/renderer`) — every admin edit is reflected.
- **Light/Dark theme**, smooth animations, and a contact form that stores messages in the DB.

---

## Architecture

```
                 Browser
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐        ┌────────────────────────────┐
│  Frontend    │        │  Backend (Express)         │
│  React + Vite│ ─────▶ │  ├── /api/v1/portfolio     │
│  (static SPA)│  HTTP  │  ├── /api/v1/admin (JWT)   │
└──────────────┘        │  └── portfolio domain      │
                        │      (Mongoose models)     │
                        └─────────────┬──────────────┘
                                      │
                                      ▼
                        ┌────────────────────────────┐
                        │  MongoDB (Atlas / local)   │
                        │  Database: portfolio       │
                        └────────────────────────────┘
```

The backend is a **single Express process** — HTTP routes call the portfolio domain layer
(handlers → model services → Mongoose models) as in-process function calls.

> Earlier versions split this into an API gateway + a Seneca TCP microservice. It was
> consolidated into one service so it can run on free serverless/PaaS hosting, which doesn't
> support persistent TCP RPC between processes.

---

## Tech Stack

### Frontend (`newclient/`)
React 18 · Vite 5 · Tailwind CSS 3 · DaisyUI 4 · Framer Motion 11 · React Router 6 ·
Axios · React Hot Toast · Lucide React · **react-markdown + remark-gfm + rehype-highlight**
(blog) · **@react-pdf/renderer** (résumé PDF)

### Backend (`apigateway/`)
Node.js 20 · Express 5 · Mongoose 8 · MongoDB 7 · jsonwebtoken (admin JWT) · pino · dotenv

### Infrastructure
Docker + Compose (local) · Nginx (frontend static server) · Render (backend) ·
Vercel (frontend) · MongoDB Atlas (database)

---

## Project Structure

```
portfolio_me/
├── apigateway/                    # The single backend service
│   ├── Dockerfile
│   ├── server.mjs                 # Entry — connects Mongo, starts HTTP server
│   ├── app.mjs                    # Express app (CORS, JSON, routes)
│   ├── config/config.mjs          # Env-driven config (port, mongo, admin secrets)
│   ├── middlewares/adminAuth.mjs  # JWT verify + token signing
│   ├── src/
│   │   ├── routes.mjs             # Mounts /api/v1/portfolio and /api/v1/admin
│   │   └── api/
│   │       ├── portfolio.mjs      # Public endpoints (incl. blog + resume)
│   │       └── admin.mjs          # Admin CRUD endpoints (JWT-protected)
│   └── domain/                    # Portfolio business logic (was the microservice)
│       ├── db.mongo.mjs           # Mongoose connection helper
│       ├── controller/handlers.mjs
│       ├── modelservices/         # DB query functions (portfolio, admin, settings, blog)
│       ├── models/                # Mongoose schemas
│       └── utils/logger.mjs
│
├── newclient/                     # React frontend (Vite → Nginx in Docker)
│   ├── Dockerfile
│   ├── nginx.conf                 # SPA routing + /api proxy to backend
│   └── src/
│       ├── App.jsx                # Routes + persistent Navbar
│       ├── routes/                # portfolioHome, AdminPage, BlogPage, BlogPostPage
│       ├── features/portfolio/    # Hero, Skill, Projects, …, Navbar, Footer, SectionHeader
│       ├── components/Markdown.jsx
│       ├── lib/                   # accent.js, resume.jsx, resumeDoc.mjs
│       ├── hooks/usePortfolio.js
│       └── api/                   # portfolioService.js, adminService.js
│
├── scripts/
│   ├── Dockerfile.seed
│   └── seed.mjs                   # Populates MongoDB with sample data (+ a sample blog post)
│
├── resume/Vikas_Kannaujiya_Resume.pdf   # legacy static file (UI now generates the PDF live)
├── docker-compose.yml
├── package.json                   # Backend deps + scripts
└── .env.example
```

---

## Running with Docker (local, recommended)

Prerequisite: [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
cp .env.example .env          # optional: set your admin secrets (compose reads it)
docker compose up --build -d
```

| URL | What it is |
|-----|-----------|
| http://localhost | Portfolio website |
| http://localhost/blog | Blog |
| http://localhost/admin | Admin dashboard |
| http://localhost:3000 | Backend API (direct) |

```bash
docker compose ps          # status
docker compose logs -f     # logs
docker compose down        # stop
docker compose down -v     # stop + wipe DB volume
```

Services: `mongodb`, `backend` (Express), `seed` (runs once), `frontend` (Nginx).
If port 27017 is taken locally, set `MONGO_HOST_PORT=27018` before `docker compose up`.

---

## Running locally without Docker

Prerequisites: Node.js 20+, MongoDB running on `localhost:27017`.

```bash
npm install
cd newclient && npm install && cd ..

cp .env.example .env       # then edit values

npm run seed               # populate the database
npm start                  # start the backend on :3000

# in another terminal — frontend dev server on :5173 (proxies /api → :3000)
cd newclient && npm run dev
```

---

## Environment Variables

### Backend
| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment |
| `HTTP_PORT` | `3000` | HTTP listen port |
| `HOST_NAME` | `0.0.0.0` | Bind address |
| `MONGO_URI` | `mongodb://localhost:27017/portfolio` | MongoDB connection string |
| `CORS_ORIGIN` | `*` | Allowed origin — set to your frontend URL in production |
| `ADMIN_PASSWORD` | `admin123` | Admin login password — **change in production** |
| `ADMIN_JWT_SECRET` | `change-me-...` | JWT signing secret — **change in production** |

### Frontend (build-time, `newclient`)
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api/v1/` | API base URL. In production set to `https://<backend>/api/v1/` |

### Docker Compose (local only)
| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_HOST_PORT` | `27017` | Host port mapped to the Mongo container |

---

## Deploying to Free Hosting (Atlas + Render + Vercel)

### 1. Database — MongoDB Atlas (free M0)
1. Create a free cluster at https://www.mongodb.com/atlas (M0 tier).
2. Create a database user (username + password).
3. Network Access → allow `0.0.0.0/0` (Render uses dynamic IPs).
4. Connection string: `mongodb+srv://<user>:<pass>@cluster.mongodb.net/portfolio`.
5. Seed it once from your machine: `MONGO_URI="mongodb+srv://..." npm run seed`

### 2. Push to GitHub
```bash
git init && git add . && git commit -m "Portfolio"
git remote add origin https://github.com/<you>/portfolio.git
git push -u origin main
```

### 3. Backend — Render (free Web Service)
- New → Web Service → connect the repo.
- **Build command:** `npm install` · **Start command:** `npm start`
- **Env vars:** `NODE_ENV=production`, `MONGO_URI` (Atlas), `ADMIN_PASSWORD`,
  `ADMIN_JWT_SECRET` (32+ chars), `CORS_ORIGIN` (your Vercel URL).
- Free tier sleeps after ~15 min idle (~50s cold start). Health check path: `/health`.

### 4. Frontend — Vercel (free)
- New Project → import repo → **Root Directory** = `newclient`.
- Framework: **Vite** · Build: `npm run build` · Output: `dist`.
- Env var: `VITE_API_URL=https://<your-render-app>.onrender.com/api/v1/`
- After deploy, put the Vercel URL into Render's `CORS_ORIGIN` and redeploy the backend.

---

## API Reference

### Public (`/api/v1/portfolio`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/getPortfolio` | Full portfolio data **+ site settings** |
| POST | `/sendContactMessage` | Submit contact form |
| GET | `/getCertificates` | Certifications list |
| GET | `/getBlogPosts` | Published blog posts (list) |
| GET | `/getBlogPost/:slug` | A single blog post (Markdown content) |
| GET | `/downloadResume` | Legacy static PDF (UI generates the PDF client-side) |
| GET | `/health` | Health check |

### Admin (`/api/v1/admin`, JWT required except `/login`)
`POST /login` → `{ token }` (12h). All other routes need `Authorization: Bearer <token>`.

- Full CRUD: `profile`, `skills`, `projects`, `experience`, `education`, `certifications`
- Messages: list / delete / mark-read
- `GET`/`PUT` **`/settings`** — site settings (text, SEO, accent color)
- **`/blog`** — `GET` list, `POST` create, `PUT /:id`, `DELETE /:id`

Auth flow: token is stored in `localStorage` as `admin_token`; on a 401 it's cleared and the
login screen is shown.

---

## MongoDB Data Models

```js
Profile        { name, title, location, email, phone, summary, linkedin, github, website, avatar }
Experience     { company, role, location, startDate, endDate, isCurrent, responsibilities[], technologies[] }
Project        { name, description, features[], techStack[], githubUrl, liveUrl, isFeatured, order, metrics{uptime,latency,scale} }
Skill          { category, skills[] }
Education       { qualification, institution, score, year, location }
Certification  { title, issuer, platform, year, logo, certificateUrl, credentialId, order }
ContactMessage { name, email, message, read, createdAt }
BlogPost       { title, slug, excerpt, content (Markdown), createdAt, updatedAt }
SiteSettings   { accentColor, seo{title,description}, hero{badge,ctaPrimaryLabel,ctaSecondaryLabel},
                 sections.{skills,projects,experience,education,certifications,contact}{eyebrow,heading,subtitle},
                 footer{tagline,ctaText,copyright} }   // single document, auto-created with defaults
```

---

## Admin Dashboard

Access at `/admin`. Log in with the `ADMIN_PASSWORD` you configured (no default password is
published — set your own via env). Tabs: **Profile, Skills, Projects, Experience, Education,
Certifications, Blog, Messages, Site Settings**.

---

## License

MIT — free to use as a template for your own portfolio.
