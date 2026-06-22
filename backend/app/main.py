"""Unified FastAPI backend — portfolio, blog, notes, resume, option, admin."""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import init_db
from .routers import auth, portfolio, admin, notes, option, apps, resume


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    os.makedirs(settings.output_dir, exist_ok=True)
    # First-boot convenience (needed on hosts without a shell, e.g. Render free):
    # seed sample data only if the database is empty.
    try:
        from .seed import seed_if_empty
        if seed_if_empty():
            print("Database was empty — seeded initial data.")
    except Exception as e:  # never block startup on a seed failure
        print(f"Auto-seed skipped: {e}")
    yield


app = FastAPI(title="Portfolio Platform API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True, "service": "portfolio-platform"}


app.include_router(auth.router)
app.include_router(portfolio.router)
app.include_router(admin.router)
app.include_router(notes.router)
app.include_router(option.router)
app.include_router(apps.router)
app.include_router(resume.router)

# Serve generated resume/cover-letter files
os.makedirs(settings.output_dir, exist_ok=True)
app.mount("/api/output", StaticFiles(directory=settings.output_dir), name="output")
