"""Resume Builder API (role: resume) — resumes, applications, dashboard, ATS, email.
Mounted at /api/* to match the merged resume frontend's axios baseURL."""
import os
import re
import json
import uuid
from datetime import datetime, date
from fastapi import APIRouter, Depends, Body, HTTPException, Query
from fastapi.responses import JSONResponse
from pymongo import DESCENDING
from ..database import db, find, find_one, insert, get_by_id, update_by_id, delete_by_id, oid
from ..auth import require_role
from ..config import settings
from ..models import VALID_STATUSES
from ..services.resume_ats import analyze_keywords, tailor_resume
from ..services.resume_render import render_resume_html, html_to_pdf_bytes
from ..services import resume_mail as mail

router = APIRouter(prefix="/api", tags=["resume"])
resume_only = Depends(require_role("resume"))


def _ensure(path):
    os.makedirs(path, exist_ok=True)
    return path


def _safe(name):
    return re.sub(r"[^a-zA-Z0-9_-]+", "_", (name or "").strip())[:60] or "x"


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


resume_dict = resume_out  # alias used for rendering / ATS


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


def tpl_out(t):
    return {"_id": t.id, "id": t.id, "name": t.name, "subject": t.subject,
            "bodyHtml": t.body_html, "isDefault": t.is_default}


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

    folder = f"{date.today().isoformat()}_{_safe(b['company'])}_{_safe(b['role'])}"
    run_dir = _ensure(os.path.join(settings.output_dir, "applications", folder))
    gen = {"folderName": folder}
    ats_before = {"score": 0, "matched": [], "missing": []}
    ats_after = {"score": 0, "matched": [], "missing": []}

    if resume:
        rd = resume_dict(resume)
        used = b.get("template") or resume.template or "classic"
        ats_before = analyze_keywords(b.get("jdText", ""), json.dumps(rd))
        tailored = tailor_resume(rd, ats_before["matched"])
        ats_after = analyze_keywords(b.get("jdText", ""), json.dumps(tailored))
        html = render_resume_html(tailored, used)
        with open(os.path.join(run_dir, "resume.html"), "w", encoding="utf-8") as f:
            f.write(html)
        with open(os.path.join(run_dir, "resume.pdf"), "wb") as f:
            f.write(html_to_pdf_bytes(html))
        gen["pdf"] = f"/api/output/applications/{folder}/resume.pdf"
        gen["html"] = f"/api/output/applications/{folder}/resume.html"

    cover = b.get("coverLetter", "") or ""
    if cover.strip():
        _write_cover(run_dir, cover)
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


def _write_cover(run_dir, text):
    esc = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    html = (f'<!DOCTYPE html><html><head><meta charset="utf-8"></head><body '
            f'style="font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#1f2937;'
            f'padding:30px;white-space:pre-wrap;">{esc}</body></html>')
    with open(os.path.join(run_dir, "cover-letter.pdf"), "wb") as f:
        f.write(html_to_pdf_bytes(html))


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
        run_dir = _ensure(os.path.join(settings.output_dir, "applications", folder))
        _write_cover(run_dir, text)
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


# ── Email ───────────────────────────────────────────────────────────────────
@router.get("/email/templates", dependencies=[resume_only])
def list_templates():
    return [tpl_out(t) for t in find("email_templates", sort=[("created_at", 1)])]


@router.post("/email/templates", dependencies=[resume_only])
def create_template(b: dict = Body(...)):
    t = insert("email_templates", {"name": b.get("name", ""), "subject": b.get("subject", ""),
                                   "body_html": b.get("bodyHtml", ""), "is_default": bool(b.get("isDefault"))})
    return JSONResponse(status_code=201, content=tpl_out(t))


@router.put("/email/templates/{tid}", dependencies=[resume_only])
def update_template(tid: str, b: dict = Body(...)):
    base = get_by_id("email_templates", tid)
    if not base:
        raise HTTPException(404, "Template not found")
    changes = {}
    if "name" in b:
        changes["name"] = b["name"]
    if "subject" in b:
        changes["subject"] = b["subject"]
    if "bodyHtml" in b:
        changes["body_html"] = b["bodyHtml"]
    if "isDefault" in b:
        changes["is_default"] = bool(b["isDefault"])
    return tpl_out(update_by_id("email_templates", tid, changes))


@router.delete("/email/templates/{tid}", dependencies=[resume_only])
def delete_template(tid: str):
    if not delete_by_id("email_templates", tid):
        raise HTTPException(404, "Template not found")
    return {"ok": True}


@router.post("/email/preview", dependencies=[resume_only])
def email_preview(b: dict = Body(...)):
    a = get_by_id("applications", b["applicationId"])
    if not a:
        raise HTTPException(404, "Application not found")
    t = get_by_id("email_templates", b["templateId"]) if b.get("templateId") else None
    if not t:
        t = find_one("email_templates", {"is_default": True}) or find_one("email_templates")
    if not t:
        raise HTTPException(404, "No email template available")
    resume = get_by_id("resumes", a.resume_variant_id) if a.resume_variant_id else None
    ctx = mail.build_context(a, resume)
    return {
        "subject": mail.render_template(t.subject, ctx),
        "bodyText": mail.html_to_text(mail.render_template(t.body_html, ctx)),
        "to": a.recruiter_email,
    }


@router.post("/email/send", dependencies=[resume_only])
def email_send(b: dict = Body(...)):
    a = get_by_id("applications", b["applicationId"])
    if not a:
        raise HTTPException(404, "Application not found")
    to = b.get("to")
    if not to:
        raise HTTPException(400, "Recipient email (to) is required")
    subject, body_text = b.get("subject", ""), b.get("bodyText", "")
    body_html = mail.text_to_html(body_text)
    folder = (a.generated_files or {}).get("folderName")
    attachments = []
    fmts = b.get("attachFormats", ["pdf"])
    if folder:
        base = os.path.join(settings.output_dir, "applications", folder)
        if "pdf" in fmts:
            attachments.append({"filename": "Resume.pdf", "path": os.path.join(base, "resume.pdf")})
        if "coverLetter" in fmts and (a.generated_files or {}).get("coverLetter"):
            attachments.append({"filename": "Cover Letter.pdf", "path": os.path.join(base, "cover-letter.pdf")})
    if not (settings.smtp_host and settings.smtp_user and settings.smtp_pass and settings.from_email):
        raise HTTPException(
            400,
            "Email sending isn't set up yet. Add SMTP_HOST, SMTP_PORT, SMTP_USER, "
            "SMTP_PASS and FROM_EMAIL to the backend environment, then redeploy.",
        )
    log = {"application_id": a["_id"], "to": to, "subject": subject, "body_html": body_html,
           "body_text": body_text, "attachments": attachments}
    try:
        mail.send_mail(to, subject, body_text, body_html, attachments)
        insert("email_logs", {**log, "status": "sent"})
        update_by_id("applications", a.id, {"email_sent": True})
        return {"ok": True}
    except Exception as e:
        insert("email_logs", {**log, "status": "failed", "error": str(e)})
        raise HTTPException(502, f"Email failed to send — check the SMTP credentials. ({e})")
