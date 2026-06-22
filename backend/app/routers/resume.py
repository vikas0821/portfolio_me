"""Resume Builder API (role: resume) — resumes, applications, dashboard, ATS, email.
Mounted at /api/* to match the merged resume frontend's axios baseURL."""
import os
import re
import json
import uuid
from datetime import datetime, date
from fastapi import APIRouter, Depends, Body, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlmodel import Session, select, desc
from ..database import get_session
from ..auth import require_role
from ..config import settings
from ..models import Resume, Application, EmailTemplate, EmailLog, VALID_STATUSES
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


def resume_out(r: Resume):
    d = {"_id": str(r.id), "id": r.id, "variantName": r.variant_name, "isDefault": r.is_default,
         "template": r.template, "updatedAt": r.updated_at.isoformat() if r.updated_at else None}
    for f in RESUME_JSON:
        d[f] = getattr(r, f)
    for f in RESUME_LIST:
        d[f] = getattr(r, f) or []
    return d


def resume_dict(r: Resume):  # for rendering / ATS
    return resume_out(r)


def apply_resume(r: Resume, b: dict):
    r.variant_name = b.get("variantName", r.variant_name)
    r.is_default = bool(b.get("isDefault", r.is_default))
    r.template = b.get("template", r.template)
    for f in RESUME_JSON:
        if f in b:
            setattr(r, f, b[f] or "")
    for f in RESUME_LIST:
        if f in b:
            setattr(r, f, b[f] or [])
    r.updated_at = datetime.utcnow()
    return r


def app_out(a: Application, session: Session):
    rv = None
    if a.resume_variant_id:
        rr = session.get(Resume, a.resume_variant_id)
        if rr:
            rv = {"_id": str(rr.id), "variantName": rr.variant_name}
    return {
        "_id": str(a.id), "id": a.id, "company": a.company, "role": a.role, "location": a.location,
        "jobRef": a.job_ref, "jdText": a.jd_text, "resumeVariant": rv, "atsScore": a.ats_score or {},
        "status": a.status, "recruiterName": a.recruiter_name, "recruiterEmail": a.recruiter_email,
        "source": a.source, "link": a.link, "generatedFiles": a.generated_files or {},
        "emailSent": a.email_sent, "appliedAt": a.applied_at.isoformat() if a.applied_at else None,
        "notes": a.notes, "tags": a.tags or [], "followUpDate": a.follow_up_date.isoformat() if a.follow_up_date else None,
        "followUpDone": a.follow_up_done, "noteEntries": a.note_entries or [], "coverLetter": a.cover_letter,
        "createdAt": a.created_at.isoformat() if a.created_at else None,
    }


def tpl_out(t: EmailTemplate):
    return {"_id": str(t.id), "id": t.id, "name": t.name, "subject": t.subject,
            "bodyHtml": t.body_html, "isDefault": t.is_default}


# ── Resumes ─────────────────────────────────────────────────────────────────
@router.get("/resumes", dependencies=[resume_only])
def list_resumes(session: Session = Depends(get_session)):
    rows = session.exec(select(Resume).order_by(desc(Resume.updated_at))).all()
    return [{"_id": str(r.id), "variantName": r.variant_name, "isDefault": r.is_default,
             "template": r.template, "name": r.name, "headline": r.headline,
             "updatedAt": r.updated_at.isoformat() if r.updated_at else None} for r in rows]


@router.get("/resumes/{rid}", dependencies=[resume_only])
def get_resume(rid: int, session: Session = Depends(get_session)):
    r = session.get(Resume, rid)
    if not r:
        raise HTTPException(404, "Resume not found")
    return resume_out(r)


@router.post("/resumes", dependencies=[resume_only])
def create_resume(data: dict = Body(...), session: Session = Depends(get_session)):
    r = apply_resume(Resume(), data)
    session.add(r); session.commit(); session.refresh(r)
    return JSONResponse(status_code=201, content=resume_out(r))


@router.put("/resumes/{rid}", dependencies=[resume_only])
def update_resume(rid: int, data: dict = Body(...), session: Session = Depends(get_session)):
    r = session.get(Resume, rid)
    if not r:
        raise HTTPException(404, "Resume not found")
    apply_resume(r, data)
    session.add(r); session.commit(); session.refresh(r)
    return resume_out(r)


@router.delete("/resumes/{rid}", dependencies=[resume_only])
def delete_resume(rid: int, session: Session = Depends(get_session)):
    r = session.get(Resume, rid)
    if not r:
        raise HTTPException(404, "Resume not found")
    session.delete(r); session.commit()
    return {"ok": True}


@router.post("/resumes/{rid}/default", dependencies=[resume_only])
def set_default(rid: int, session: Session = Depends(get_session)):
    r = session.get(Resume, rid)
    if not r:
        raise HTTPException(404, "Resume not found")
    for other in session.exec(select(Resume)).all():
        other.is_default = False
        session.add(other)
    r.is_default = True
    session.add(r); session.commit(); session.refresh(r)
    return resume_out(r)


@router.post("/resumes/{rid}/render", dependencies=[resume_only])
def render_resume(rid: int, data: dict = Body(default={}), session: Session = Depends(get_session)):
    r = session.get(Resume, rid)
    if not r:
        raise HTTPException(404, "Resume not found")
    template = (data or {}).get("template") or r.template or "classic"
    html = render_resume_html(resume_dict(r), template)
    d = _ensure(os.path.join(settings.output_dir, "resumes", str(r.id)))
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
def ats_analyze(data: dict = Body(...), session: Session = Depends(get_session)):
    jd = data.get("jdText", "")
    rid = data.get("resumeVariantId")
    resume_text = ""
    if rid:
        r = session.get(Resume, int(rid))
        if r:
            resume_text = json.dumps(resume_dict(r))
    return analyze_keywords(jd, resume_text)


# ── Applications ────────────────────────────────────────────────────────────
@router.get("/applications", dependencies=[resume_only])
def list_apps(q: str | None = Query(None), tag: str | None = Query(None), session: Session = Depends(get_session)):
    rows = session.exec(select(Application).order_by(desc(Application.created_at))).all()
    if q:
        ql = q.lower()
        rows = [a for a in rows if ql in f"{a.company} {a.role} {a.location} {a.source} {' '.join(a.tags or [])}".lower()]
    if tag:
        rows = [a for a in rows if tag in (a.tags or [])]
    return [app_out(a, session) for a in rows]


@router.get("/applications/{aid}", dependencies=[resume_only])
def get_app(aid: int, session: Session = Depends(get_session)):
    a = session.get(Application, aid)
    if not a:
        raise HTTPException(404, "Application not found")
    return app_out(a, session)


@router.post("/applications", dependencies=[resume_only])
def create_app(b: dict = Body(...), session: Session = Depends(get_session)):
    if not (b.get("company") and b.get("role")):
        raise HTTPException(400, "company and role are required")
    status = b.get("status")
    if status and status not in VALID_STATUSES:
        raise HTTPException(400, f"status must be one of: {', '.join(VALID_STATUSES)}")

    resume = None
    if b.get("resumeVariantId"):
        resume = session.get(Resume, int(b["resumeVariantId"]))
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

    a = Application(
        company=b["company"], role=b["role"], location=b.get("location", ""), job_ref=b.get("jobRef", ""),
        jd_text=b.get("jdText", ""), resume_variant_id=resume.id if resume else None,
        ats_score={"before": ats_before["score"], "after": ats_after["score"]},
        recruiter_name=b.get("recruiterName", ""), recruiter_email=b.get("recruiterEmail", ""),
        source=b.get("source", ""), link=b.get("link", ""), status=status or "applied",
        applied_at=datetime.fromisoformat(b["appliedAt"]) if b.get("appliedAt") else datetime.utcnow(),
        tags=tags, follow_up_date=datetime.fromisoformat(b["followUpDate"]) if b.get("followUpDate") else None,
        cover_letter=cover, generated_files=gen,
    )
    session.add(a); session.commit(); session.refresh(a)
    return JSONResponse(status_code=201, content={
        "application": app_out(a, session),
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
def patch_app(aid: int, b: dict = Body(...), session: Session = Depends(get_session)):
    a = session.get(Application, aid)
    if not a:
        raise HTTPException(404, "Application not found")
    for k, col in PATCH_FIELDS.items():
        if k in b:
            setattr(a, col, b[k])
    if "followUpDate" in b:
        a.follow_up_date = datetime.fromisoformat(b["followUpDate"]) if b["followUpDate"] else None
    session.add(a); session.commit(); session.refresh(a)
    return app_out(a, session)


@router.post("/applications/{aid}/notes", dependencies=[resume_only])
def add_note(aid: int, b: dict = Body(...), session: Session = Depends(get_session)):
    a = session.get(Application, aid)
    if not a:
        raise HTTPException(404, "Application not found")
    if not b.get("text"):
        raise HTTPException(400, "text is required")
    entries = list(a.note_entries or [])
    entries.append({"_id": uuid.uuid4().hex, "text": b["text"], "createdAt": datetime.utcnow().isoformat()})
    a.note_entries = entries
    session.add(a); session.commit(); session.refresh(a)
    return app_out(a, session)


@router.delete("/applications/{aid}/notes/{note_id}", dependencies=[resume_only])
def del_note(aid: int, note_id: str, session: Session = Depends(get_session)):
    a = session.get(Application, aid)
    if not a:
        raise HTTPException(404, "Application not found")
    a.note_entries = [n for n in (a.note_entries or []) if n.get("_id") != note_id]
    session.add(a); session.commit(); session.refresh(a)
    return app_out(a, session)


@router.post("/applications/{aid}/cover-letter", dependencies=[resume_only])
def save_cover(aid: int, b: dict = Body(...), session: Session = Depends(get_session)):
    a = session.get(Application, aid)
    if not a:
        raise HTTPException(404, "Application not found")
    a.cover_letter = b.get("text", "")
    folder = (a.generated_files or {}).get("folderName")
    if folder and a.cover_letter.strip():
        run_dir = _ensure(os.path.join(settings.output_dir, "applications", folder))
        _write_cover(run_dir, a.cover_letter)
        gf = dict(a.generated_files or {})
        gf["coverLetter"] = f"/api/output/applications/{folder}/cover-letter.pdf"
        a.generated_files = gf
    session.add(a); session.commit(); session.refresh(a)
    return app_out(a, session)


@router.delete("/applications/{aid}", dependencies=[resume_only])
def delete_app(aid: int, session: Session = Depends(get_session)):
    a = session.get(Application, aid)
    if not a:
        raise HTTPException(404, "Application not found")
    session.delete(a); session.commit()
    return {"ok": True}


# ── Dashboard ───────────────────────────────────────────────────────────────
@router.get("/dashboard/stats", dependencies=[resume_only])
def dashboard_stats(session: Session = Depends(get_session)):
    rows = session.exec(select(Application).order_by(desc(Application.created_at))).all()
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
        "total": len(rows), "counts": counts, "recent": [app_out(a, session) for a in rows[:5]],
        "avgBefore": avg_b, "avgAfter": avg_a, "atsImprovement": avg_a - avg_b,
        "emailsSent": sum(1 for a in rows if a.email_sent), "followUpsDue": [app_out(a, session) for a in due],
    }


# ── Email ───────────────────────────────────────────────────────────────────
@router.get("/email/templates", dependencies=[resume_only])
def list_templates(session: Session = Depends(get_session)):
    return [tpl_out(t) for t in session.exec(select(EmailTemplate).order_by(EmailTemplate.created_at)).all()]


@router.post("/email/templates", dependencies=[resume_only])
def create_template(b: dict = Body(...), session: Session = Depends(get_session)):
    t = EmailTemplate(name=b.get("name", ""), subject=b.get("subject", ""),
                      body_html=b.get("bodyHtml", ""), is_default=bool(b.get("isDefault")))
    session.add(t); session.commit(); session.refresh(t)
    return JSONResponse(status_code=201, content=tpl_out(t))


@router.put("/email/templates/{tid}", dependencies=[resume_only])
def update_template(tid: int, b: dict = Body(...), session: Session = Depends(get_session)):
    t = session.get(EmailTemplate, tid)
    if not t:
        raise HTTPException(404, "Template not found")
    t.name = b.get("name", t.name)
    t.subject = b.get("subject", t.subject)
    t.body_html = b.get("bodyHtml", t.body_html)
    t.is_default = bool(b.get("isDefault", t.is_default))
    session.add(t); session.commit(); session.refresh(t)
    return tpl_out(t)


@router.delete("/email/templates/{tid}", dependencies=[resume_only])
def delete_template(tid: int, session: Session = Depends(get_session)):
    t = session.get(EmailTemplate, tid)
    if not t:
        raise HTTPException(404, "Template not found")
    session.delete(t); session.commit()
    return {"ok": True}


@router.post("/email/preview", dependencies=[resume_only])
def email_preview(b: dict = Body(...), session: Session = Depends(get_session)):
    a = session.get(Application, int(b["applicationId"]))
    if not a:
        raise HTTPException(404, "Application not found")
    t = None
    if b.get("templateId"):
        t = session.get(EmailTemplate, int(b["templateId"]))
    if not t:
        t = (session.exec(select(EmailTemplate).where(EmailTemplate.is_default == True)).first()
             or session.exec(select(EmailTemplate)).first())
    if not t:
        raise HTTPException(404, "No email template available")
    resume = session.get(Resume, a.resume_variant_id) if a.resume_variant_id else None
    ctx = mail.build_context(a, resume)
    subject = mail.render_template(t.subject, ctx)
    body_html = mail.render_template(t.body_html, ctx)
    return {"subject": subject, "bodyText": mail.html_to_text(body_html), "to": a.recruiter_email}


@router.post("/email/send", dependencies=[resume_only])
def email_send(b: dict = Body(...), session: Session = Depends(get_session)):
    a = session.get(Application, int(b["applicationId"]))
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
    try:
        mail.send_mail(to, subject, body_text, body_html, attachments)
        log = EmailLog(application_id=a.id, to=to, subject=subject, body_html=body_html, body_text=body_text,
                       attachments=attachments, status="sent")
        session.add(log)
        a.email_sent = True
        session.add(a); session.commit()
        return {"ok": True}
    except Exception as e:
        log = EmailLog(application_id=a.id, to=to, subject=subject, body_html=body_html, body_text=body_text,
                       attachments=attachments, status="failed", error=str(e))
        session.add(log); session.commit()
        raise HTTPException(500, str(e))
