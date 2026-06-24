"""Email helpers for the resume builder — mail-merge + Brevo/SMTP send."""
import re
import json
import base64
import smtplib
import urllib.request
import urllib.error
from email.message import EmailMessage
from jinja2 import Template
from ..config import settings


def mail_configured() -> bool:
    """True if an email sender (Brevo HTTP API or SMTP) is configured."""
    if settings.brevo_api_key and settings.from_email:
        return True
    return bool(settings.smtp_host and settings.smtp_user and settings.smtp_pass and settings.from_email)


def html_to_text(html: str) -> str:
    t = re.sub(r"</(p|div|tr|h[1-6])>", "\n", html, flags=re.I)
    t = re.sub(r"<br\s*/?>", "\n", t, flags=re.I)
    t = re.sub(r"</td>", "  ", t, flags=re.I)
    t = re.sub(r"<[^>]+>", "", t)
    t = (t.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">"))
    t = re.sub(r"[ \t]+\n", "\n", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


def text_to_html(text: str) -> str:
    esc = (text or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return f'<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap;">{esc}</div>'


def build_context(app, resume) -> dict:
    skill_values = []
    for s in (resume.skills if resume else []) or []:
        skill_values += [v.strip() for v in (s.get("value", "") or "").split(",") if v.strip()]
    top = skill_values[:6]
    return {
        "recruiterName": app.recruiter_name or "Hiring Manager",
        "recruiterEmail": app.recruiter_email, "company": app.company, "role": app.role,
        "location": app.location, "jobRef": app.job_ref,
        "candidateName": resume.name if resume else "", "candidateHeadline": resume.headline if resume else "",
        "candidateEmail": resume.email if resume else "", "candidatePhone": resume.phone if resume else "",
        "candidateLinkedin": resume.linkedin if resume else "",
        "topSkills": ", ".join(top), "topSkillsList": top,
    }


def render_template(text: str, ctx: dict) -> str:
    return Template(text or "").render(**ctx)


def _read_attachments_b64(attachments):
    out = []
    for att in attachments or []:
        try:
            with open(att["path"], "rb") as f:
                out.append({"name": att["filename"], "content": base64.b64encode(f.read()).decode()})
        except OSError:
            pass  # file may be gone on ephemeral disk; send without it
    return out


def _send_via_brevo(to, subject, text, html, attachments):
    payload = {
        "sender": {"name": settings.from_name or "Job Application", "email": settings.from_email},
        "to": [{"email": to}],
        "subject": subject,
        "htmlContent": html or text_to_html(text or ""),
        "textContent": text or "",
    }
    atts = _read_attachments_b64(attachments)
    if atts:
        payload["attachment"] = atts
    req = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=json.dumps(payload).encode(),
        headers={"api-key": settings.brevo_api_key, "content-type": "application/json", "accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            resp.read()
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="ignore")
        raise RuntimeError(f"Brevo API error {e.code}: {body}")


def send_mail(to: str, subject: str, text: str, html: str, attachments=None):
    if not mail_configured():
        raise RuntimeError("Email is not configured")
    # Prefer Brevo's HTTP API (works where outbound SMTP is blocked).
    if settings.brevo_api_key and settings.from_email:
        return _send_via_brevo(to, subject, text, html, attachments)
    msg = EmailMessage()
    msg["From"] = f"{settings.from_name} <{settings.from_email}>"
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(text or "")
    msg.add_alternative(html or text_to_html(text or ""), subtype="html")
    for att in attachments or []:
        try:
            with open(att["path"], "rb") as f:
                data = f.read()
            msg.add_attachment(data, maintype="application", subtype="octet-stream", filename=att["filename"])
        except OSError:
            pass
    # Timeout so a blocked outbound SMTP port (common on free PaaS like Render)
    # fails fast with an error instead of hanging the request forever.
    use_ssl = settings.smtp_port == 465
    if use_ssl:
        server = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=20)
    else:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20)
        server.starttls()
    with server:
        # Gmail shows App Passwords with spaces for readability — strip them so a
        # pasted "xxxx xxxx xxxx xxxx" still authenticates.
        server.login(settings.smtp_user, settings.smtp_pass.replace(" ", ""))
        server.send_message(msg)
