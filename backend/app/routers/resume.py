"""Resume Builder API (role: resume) — resume variants, ATS scoring.
Mounted at /api/* to match the merged resume frontend's axios baseURL.

Applications and email live in routers/applications.py and routers/email.py —
split out of here so each file covers one sub-domain of the resume builder."""
import os
import json
from datetime import datetime
from fastapi import APIRouter, Depends, Body, HTTPException
from fastapi.responses import JSONResponse
from pymongo import DESCENDING
from ..database import db, find, get_by_id, insert, update_by_id, delete_by_id
from ..auth import require_role
from ..config import settings
from ..services.resume_ats import analyze_keywords
from ..services.resume_render import render_resume_html, html_to_pdf_bytes

router = APIRouter(prefix="/api", tags=["resume"])
resume_only = Depends(require_role("resume"))


def _ensure(path):
    os.makedirs(path, exist_ok=True)
    return path


# ── Serializers ─────────────────────────────────────────────────────────────
RESUME_JSON = ["name", "headline", "email", "phone", "location", "linkedin", "summary",
               "languages", "gender", "nationality"]
RESUME_LIST = ["skills", "certifications", "projects", "employment", "experience", "education"]


def resume_out(r):
    d = {"_id": r.id, "id": r.id, "variantName": r.variant_name, "isDefault": r.is_default,
         "template": r.template, "updatedAt": r.updated_at.isoformat() if r.updated_at else None}
    for f in RESUME_JSON:
        d[f] = r.get(f, "")
    for f in RESUME_LIST:
        d[f] = r.get(f) or []
    return d


resume_dict = resume_out  # alias used for rendering / ATS / application generation


def _resume_doc(b, base):
    doc = {
        "variant_name": b.get("variantName", base.get("variant_name", "")),
        "is_default": bool(b.get("isDefault", base.get("is_default", False))),
        "template": b.get("template", base.get("template", "classic")),
        "updated_at": datetime.utcnow(),
    }
    for f in RESUME_JSON:
        doc[f] = (b[f] or "") if f in b else base.get(f, "")
    for f in RESUME_LIST:
        doc[f] = (b[f] or []) if f in b else base.get(f, [])
    return doc


# ── Resumes ─────────────────────────────────────────────────────────────────
@router.get("/resumes", dependencies=[resume_only])
def list_resumes():
    rows = find("resumes", sort=[("updated_at", DESCENDING)])
    return [{"_id": r.id, "variantName": r.variant_name, "isDefault": r.is_default,
             "template": r.template, "name": r.name, "headline": r.headline,
             "updatedAt": r.updated_at.isoformat() if r.updated_at else None} for r in rows]


@router.get("/resumes/{rid}", dependencies=[resume_only])
def get_resume(rid: str):
    r = get_by_id("resumes", rid)
    if not r:
        raise HTTPException(404, "Resume not found")
    return resume_out(r)


@router.post("/resumes", dependencies=[resume_only])
def create_resume(data: dict = Body(...)):
    r = insert("resumes", _resume_doc(data, {}))
    return JSONResponse(status_code=201, content=resume_out(r))


@router.put("/resumes/{rid}", dependencies=[resume_only])
def update_resume(rid: str, data: dict = Body(...)):
    base = get_by_id("resumes", rid)
    if not base:
        raise HTTPException(404, "Resume not found")
    return resume_out(update_by_id("resumes", rid, _resume_doc(data, base)))


@router.delete("/resumes/{rid}", dependencies=[resume_only])
def delete_resume(rid: str):
    if not delete_by_id("resumes", rid):
        raise HTTPException(404, "Resume not found")
    return {"ok": True}


@router.post("/resumes/{rid}/default", dependencies=[resume_only])
def set_default(rid: str):
    r = get_by_id("resumes", rid)
    if not r:
        raise HTTPException(404, "Resume not found")
    db.resumes.update_many({}, {"$set": {"is_default": False}})
    return resume_out(update_by_id("resumes", rid, {"is_default": True}))


@router.post("/resumes/{rid}/render", dependencies=[resume_only])
def render_resume(rid: str, data: dict = Body(default={})):
    r = get_by_id("resumes", rid)
    if not r:
        raise HTTPException(404, "Resume not found")
    template = (data or {}).get("template") or r.template or "classic"
    html = render_resume_html(resume_dict(r), template)
    d = _ensure(os.path.join(settings.output_dir, "resumes", r.id))
    with open(os.path.join(d, "resume.html"), "w", encoding="utf-8") as f:
        f.write(html)
    with open(os.path.join(d, "resume.pdf"), "wb") as f:
        f.write(html_to_pdf_bytes(html))
    return {"files": {
        "html": f"/api/output/resumes/{r.id}/resume.html",
        "pdf": f"/api/output/resumes/{r.id}/resume.pdf",
    }}


# ── ATS ─────────────────────────────────────────────────────────────────────
@router.post("/ats/analyze", dependencies=[resume_only])
def ats_analyze(data: dict = Body(...)):
    resume_text = ""
    if data.get("resumeVariantId"):
        r = get_by_id("resumes", data["resumeVariantId"])
        if r:
            resume_text = json.dumps(resume_dict(r))
    return analyze_keywords(data.get("jdText", ""), resume_text)
