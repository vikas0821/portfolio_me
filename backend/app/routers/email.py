"""Resume Builder API (role: resume) — recruiter email templates + sending.
Split out of routers/resume.py."""
import os
from fastapi import APIRouter, Depends, Body, HTTPException
from fastapi.responses import JSONResponse
from ..database import get_by_id, find, find_one, insert, update_by_id, delete_by_id
from ..auth import require_role
from ..config import settings
from ..services import resume_mail as mail
from ..services.resume_from_portfolio import build_resume_from_portfolio

router = APIRouter(prefix="/api", tags=["email"])
resume_only = Depends(require_role("resume"))


def tpl_out(t):
    return {"_id": t.id, "id": t.id, "name": t.name, "subject": t.subject,
            "bodyHtml": t.body_html, "isDefault": t.is_default}


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
    ctx = mail.build_context(a, build_resume_from_portfolio())
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
