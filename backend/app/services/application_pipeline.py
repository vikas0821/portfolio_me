"""Generates the on-disk artifacts (tailored resume PDF + cover letter PDF) for
a job application, and scores ATS match before/after tailoring.

Extracted out of routers/applications.py so the route handler stays a thin
HTTP-shape layer and this logic can be unit-tested without FastAPI/Mongo.
"""
import json
import os
import re
from datetime import date

from .resume_ats import analyze_keywords, tailor_resume
from .resume_render import render_resume_html, html_to_pdf_bytes


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


def generate_resume_artifacts(run_dir, folder, resume_dict, jd_text, template):
    """Tailor `resume_dict` against `jd_text`, render + write resume.html/.pdf.

    Returns (generated_files_fragment, ats_before, ats_after).
    """
    ats_before = analyze_keywords(jd_text, json.dumps(resume_dict))
    tailored = tailor_resume(resume_dict, ats_before["matched"])
    ats_after = analyze_keywords(jd_text, json.dumps(tailored))
    html = render_resume_html(tailored, template)
    with open(os.path.join(run_dir, "resume.html"), "w", encoding="utf-8") as f:
        f.write(html)
    with open(os.path.join(run_dir, "resume.pdf"), "wb") as f:
        f.write(html_to_pdf_bytes(html))
    gen = {
        "folderName": folder,
        "pdf": f"/api/output/applications/{folder}/resume.pdf",
        "html": f"/api/output/applications/{folder}/resume.html",
    }
    return gen, ats_before, ats_after
