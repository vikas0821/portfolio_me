"""Render a resume to HTML (Jinja2) then PDF (WeasyPrint) — replaces Puppeteer.
The actual design templates live in resume_templates.py."""
from .resume_templates import TEMPLATES, DEFAULT_TEMPLATE


def render_resume_html(data: dict, template: str = DEFAULT_TEMPLATE) -> str:
    tpl = TEMPLATES.get(template, TEMPLATES[DEFAULT_TEMPLATE])
    return tpl.render(r=data)


def html_to_pdf_bytes(html: str) -> bytes:
    from weasyprint import HTML
    return HTML(string=html).write_pdf()
