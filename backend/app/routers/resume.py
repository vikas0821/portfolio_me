"""Resume Builder API (role: resume) — the single resume: always read live
from portfolio data, render (HTML/PDF) from whatever the caller posts.
Mounted at /api/* to match the merged resume frontend's axios baseURL.

Applications and email live in routers/applications.py and routers/email.py —
split out of here so each file covers one sub-domain of the resume builder."""
import os
from fastapi import APIRouter, Depends, Body
from ..auth import require_role
from ..config import settings
from ..services.resume_from_portfolio import build_resume_from_portfolio
from ..services.resume_render import render_resume_html, html_to_pdf_bytes

router = APIRouter(prefix="/api", tags=["resume"])
resume_only = Depends(require_role("resume"))


def _ensure(path):
    os.makedirs(path, exist_ok=True)
    return path


@router.get("/resume", dependencies=[resume_only])
def get_resume():
    return build_resume_from_portfolio()


@router.post("/resume/render", dependencies=[resume_only])
def render_resume(data: dict = Body(...)):
    template = data.get("template") or "classic"
    html = render_resume_html(data, template)
    d = _ensure(os.path.join(settings.output_dir, "resumes", "current"))
    with open(os.path.join(d, "resume.html"), "w", encoding="utf-8") as f:
        f.write(html)
    with open(os.path.join(d, "resume.pdf"), "wb") as f:
        f.write(html_to_pdf_bytes(html))
    return {"files": {
        "html": "/api/output/resumes/current/resume.html",
        "pdf": "/api/output/resumes/current/resume.pdf",
    }}
