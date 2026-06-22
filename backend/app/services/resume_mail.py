"""Email helpers for the resume builder — mail-merge + SMTP send."""
import re
import smtplib
from email.message import EmailMessage
from jinja2 import Template
from ..config import settings


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


def send_mail(to: str, subject: str, text: str, html: str, attachments=None):
    if not (settings.smtp_host and settings.smtp_user and settings.smtp_pass and settings.from_email):
        raise RuntimeError("SMTP configuration is missing")
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
    use_ssl = settings.smtp_port == 465
    if use_ssl:
        server = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port)
    else:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        server.starttls()
    with server:
        server.login(settings.smtp_user, settings.smtp_pass)
        server.send_message(msg)
