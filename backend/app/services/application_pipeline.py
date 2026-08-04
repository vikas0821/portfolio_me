"""Generates the on-disk artifacts (cover letter PDF) for a job application.

Extracted out of routers/applications.py so the route handler stays a thin
HTTP-shape layer and this logic can be unit-tested without FastAPI/Mongo.
"""
import os
import re
from datetime import date

from .resume_render import html_to_pdf_bytes


def _ensure(path):
    os.makedirs(path, exist_ok=True)
    return path


def _safe(name):
    return re.sub(r"[^a-zA-Z0-9_-]+", "_", (name or "").strip())[:60] or "x"


def make_application_folder(output_dir, company, role):
    """<output_dir>/applications/<date>_<company>_<role>, created if missing."""
    folder = f"{date.today().isoformat()}_{_safe(company)}_{_safe(role)}"
    run_dir = _ensure(os.path.join(output_dir, "applications", folder))
    return folder, run_dir


def write_cover_letter(run_dir, text):
    esc = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    html = (f'<!DOCTYPE html><html><head><meta charset="utf-8"></head><body '
            f'style="font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#1f2937;'
            f'padding:30px;white-space:pre-wrap;">{esc}</body></html>')
    with open(os.path.join(run_dir, "cover-letter.pdf"), "wb") as f:
        f.write(html_to_pdf_bytes(html))


EMPTY_ATS = {"score": 0, "matched": [], "missing": []}
