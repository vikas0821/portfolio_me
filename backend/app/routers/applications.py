"""Resume Builder API (role: resume) — job applications + dashboard stats.
Split out of routers/resume.py; artifact generation (tailored PDF + cover
letter + ATS before/after) lives in services/application_pipeline.py."""
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, Body, HTTPException, Query
from fastapi.responses import JSONResponse
from pymongo import DESCENDING
from ..database import find, get_by_id, insert, update_by_id, delete_by_id
from ..auth import require_role
from ..config import settings
from ..models import VALID_STATUSES
from ..services.application_pipeline import (
    make_application_folder, write_cover_letter, generate_resume_artifacts, EMPTY_ATS,
)
from .resume import resume_dict

router = APIRouter(prefix="/api", tags=["applications"])
resume_only = Depends(require_role("resume"))


def app_out(a):
    rv = None
    if a.resume_variant_id:
        rr = get_by_id("resumes", a.resume_variant_id)
        if rr:
            rv = {"_id": rr.id, "variantName": rr.variant_name}
    return {
        "_id": a.id, "id": a.id, "company": a.company, "role": a.role, "location": a.location,
        "jobRef": a.job_ref, "jdText": a.jd_text, "resumeVariant": rv, "atsScore": a.ats_score or {},
        "status": a.status, "recruiterName": a.recruiter_name, "recruiterEmail": a.recruiter_email,
        "source": a.source, "link": a.link, "generatedFiles": a.generated_files or {},
        "emailSent": a.email_sent, "appliedAt": a.applied_at.isoformat() if a.applied_at else None,
        "notes": a.notes, "tags": a.tags or [], "followUpDate": a.follow_up_date.isoformat() if a.follow_up_date else None,
        "followUpDone": a.follow_up_done, "noteEntries": a.note_entries or [], "coverLetter": a.cover_letter,
        "createdAt": a.created_at.isoformat() if a.created_at else None,
    }


# ── Applications ────────────────────────────────────────────────────────────
@router.get("/applications", dependencies=[resume_only])
def list_apps(q: str | None = Query(None), tag: str | None = Query(None)):
    rows = find("applications", sort=[("created_at", DESCENDING)])
    if q:
        ql = q.lower()
        rows = [a for a in rows if ql in f"{a.company} {a.role} {a.location} {a.source} {' '.join(a.tags or [])}".lower()]
    if tag:
        rows = [a for a in rows if tag in (a.tags or [])]
    return [app_out(a) for a in rows]


@router.get("/applications/{aid}", dependencies=[resume_only])
def get_app(aid: str):
    a = get_by_id("applications", aid)
    if not a:
        raise HTTPException(404, "Application not found")
    return app_out(a)


@router.post("/applications", dependencies=[resume_only])
def create_app(b: dict = Body(...)):
    if not (b.get("company") and b.get("role")):
        raise HTTPException(400, "company and role are required")
    status = b.get("status")
    if status and status not in VALID_STATUSES:
        raise HTTPException(400, f"status must be one of: {', '.join(VALID_STATUSES)}")

    resume = None
    if b.get("resumeVariantId"):
        resume = get_by_id("resumes", b["resumeVariantId"])
        if not resume:
            raise HTTPException(404, "Resume variant not found")

    folder, run_dir = make_application_folder(settings.output_dir, b["company"], b["role"])
    gen = {"folderName": folder}
    ats_before = dict(EMPTY_ATS)
    ats_after = dict(EMPTY_ATS)

    if resume:
        used = b.get("template") or resume.template or "classic"
        gen, ats_before, ats_after = generate_resume_artifacts(
            run_dir, folder, resume_dict(resume), b.get("jdText", ""), used,
        )

    cover = b.get("coverLetter", "") or ""
    if cover.strip():
        write_cover_letter(run_dir, cover)
        gen["coverLetter"] = f"/api/output/applications/{folder}/cover-letter.pdf"

    tags = b.get("tags", [])
    if not isinstance(tags, list):
        tags = [t.strip() for t in str(tags).split(",") if t.strip()]

    a = insert("applications", {
        "company": b["company"], "role": b["role"], "location": b.get("location", ""), "job_ref": b.get("jobRef", ""),
        "jd_text": b.get("jdText", ""), "resume_variant_id": resume["_id"] if resume else None,
        "ats_score": {"before": ats_before["score"], "after": ats_after["score"]},
        "recruiter_name": b.get("recruiterName", ""), "recruiter_email": b.get("recruiterEmail", ""),
        "source": b.get("source", ""), "link": b.get("link", ""), "status": status or "applied",
        "applied_at": datetime.fromisoformat(b["appliedAt"]) if b.get("appliedAt") else datetime.utcnow(),
        "tags": tags, "follow_up_date": datetime.fromisoformat(b["followUpDate"]) if b.get("followUpDate") else None,
        "follow_up_done": False, "email_sent": False, "notes": "", "note_entries": [],
        "cover_letter": cover, "generated_files": gen,
    })
    return JSONResponse(status_code=201, content={
        "application": app_out(a),
        "ats": {"before": ats_before, "after": ats_after, "missing": ats_after["missing"]},
    })


PATCH_FIELDS = {"company": "company", "role": "role", "location": "location", "status": "status",
                "recruiterName": "recruiter_name", "recruiterEmail": "recruiter_email", "source": "source",
                "link": "link", "tags": "tags", "followUpDone": "follow_up_done", "notes": "notes",
                "coverLetter": "cover_letter", "jobRef": "job_ref", "jdText": "jd_text"}


@router.patch("/applications/{aid}", dependencies=[resume_only])
def patch_app(aid: str, b: dict = Body(...)):
    if not get_by_id("applications", aid):
        raise HTTPException(404, "Application not found")
    changes = {col: b[k] for k, col in PATCH_FIELDS.items() if k in b}
    if "followUpDate" in b:
        changes["follow_up_date"] = datetime.fromisoformat(b["followUpDate"]) if b["followUpDate"] else None
    return app_out(update_by_id("applications", aid, changes))


@router.post("/applications/{aid}/notes", dependencies=[resume_only])
def add_note(aid: str, b: dict = Body(...)):
    a = get_by_id("applications", aid)
    if not a:
        raise HTTPException(404, "Application not found")
    if not b.get("text"):
        raise HTTPException(400, "text is required")
    entries = list(a.note_entries or [])
    entries.append({"_id": uuid.uuid4().hex, "text": b["text"], "createdAt": datetime.utcnow().isoformat()})
    return app_out(update_by_id("applications", aid, {"note_entries": entries}))


@router.delete("/applications/{aid}/notes/{note_id}", dependencies=[resume_only])
def del_note(aid: str, note_id: str):
    a = get_by_id("applications", aid)
    if not a:
        raise HTTPException(404, "Application not found")
    entries = [n for n in (a.note_entries or []) if n.get("_id") != note_id]
    return app_out(update_by_id("applications", aid, {"note_entries": entries}))


@router.post("/applications/{aid}/cover-letter", dependencies=[resume_only])
def save_cover(aid: str, b: dict = Body(...)):
    a = get_by_id("applications", aid)
    if not a:
        raise HTTPException(404, "Application not found")
    text = b.get("text", "")
    changes = {"cover_letter": text}
    folder = (a.generated_files or {}).get("folderName")
    if folder and text.strip():
        run_dir = os.path.join(settings.output_dir, "applications", folder)
        os.makedirs(run_dir, exist_ok=True)
        write_cover_letter(run_dir, text)
        gf = dict(a.generated_files or {})
        gf["coverLetter"] = f"/api/output/applications/{folder}/cover-letter.pdf"
        changes["generated_files"] = gf
    return app_out(update_by_id("applications", aid, changes))


@router.delete("/applications/{aid}", dependencies=[resume_only])
def delete_app(aid: str):
    if not delete_by_id("applications", aid):
        raise HTTPException(404, "Application not found")
    return {"ok": True}


# ── Dashboard ───────────────────────────────────────────────────────────────
@router.get("/dashboard/stats", dependencies=[resume_only])
def dashboard_stats():
    rows = find("applications", sort=[("created_at", DESCENDING)])
    counts = {s: 0 for s in VALID_STATUSES}
    for a in rows:
        counts[a.status] = counts.get(a.status, 0) + 1
    with_ats = [a for a in rows if (a.ats_score or {}).get("after", 0) > 0]
    avg_b = round(sum(a.ats_score["before"] for a in with_ats) / len(with_ats)) if with_ats else 0
    avg_a = round(sum(a.ats_score["after"] for a in with_ats) / len(with_ats)) if with_ats else 0
    now = datetime.utcnow()
    due = sorted([a for a in rows if not a.follow_up_done and a.follow_up_date and a.follow_up_date <= now],
                 key=lambda a: a.follow_up_date)
    return {
        "total": len(rows), "counts": counts, "recent": [app_out(a) for a in rows[:5]],
        "avgBefore": avg_b, "avgAfter": avg_a, "atsImprovement": avg_a - avg_b,
        "emailsSent": sum(1 for a in rows if a.email_sent), "followUpsDue": [app_out(a) for a in due],
    }
