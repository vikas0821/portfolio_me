"""Render a resume to HTML (Jinja2) then PDF (WeasyPrint) — replaces Puppeteer."""
from jinja2 import Template

RESUME_HTML = Template("""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Liberation Sans', Arial, sans-serif; color: #1f2937; font-size: 10.5px; line-height: 1.45; }
  .name { font-size: 22px; font-weight: 700; color: #111827; }
  .headline { color: {{ accent }}; font-weight: 700; font-size: 11px; margin-top: 2px; }
  .contact { color: #4b5563; font-size: 8.5px; margin-top: 5px; }
  .contact span { margin-right: 10px; }
  hr { border: 0; border-top: 1.2px solid {{ accent }}; margin: 9px 0 10px; }
  h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: {{ accent }}; margin: 12px 0 5px; }
  .entry { margin-bottom: 8px; }
  .row { display: flex; justify-content: space-between; }
  .title { font-weight: 700; color: #111827; }
  .sub { color: {{ accent }}; }
  .meta { color: #6b7280; font-size: 9px; }
  ul { margin: 3px 0 0; padding-left: 14px; }
  li { margin-top: 2px; }
  .skillrow { display: flex; margin-bottom: 3px; }
  .skilllabel { width: 130px; font-weight: 700; color: #111827; }
  .skillval { flex: 1; color: #374151; }
</style></head><body>
  <div class="name">{{ r.name }}</div>
  {% if r.headline %}<div class="headline">{{ r.headline }}</div>{% endif %}
  <div class="contact">
    {% for c in [r.email, r.phone, r.location, r.linkedin] if c %}<span>{{ c }}</span>{% endfor %}
  </div>
  <hr>
  {% if r.summary %}<h2>Summary</h2><div>{{ r.summary }}</div>{% endif %}

  {% if r.experience %}<h2>Experience</h2>
    {% for e in r.experience %}<div class="entry">
      <div class="row"><span class="title">{{ e.role }}</span><span class="meta">{{ e.duration }}</span></div>
      <div class="row"><span class="sub">{{ e.company }}</span><span class="meta">{{ e.location }}</span></div>
      {% if e.bullets %}<ul>{% for b in e.bullets %}<li>{{ b }}</li>{% endfor %}</ul>{% endif %}
    </div>{% endfor %}
  {% endif %}

  {% if r.projects %}<h2>Projects</h2>
    {% for p in r.projects %}<div class="entry">
      <span class="title">{{ p.name }}</span>{% if p.tech %} <span class="meta">— {{ p.tech }}</span>{% endif %}
      {% if p.bullets %}<ul>{% for b in p.bullets %}<li>{{ b }}</li>{% endfor %}</ul>{% endif %}
    </div>{% endfor %}
  {% endif %}

  {% if r.skills %}<h2>Skills</h2>
    {% for s in r.skills %}<div class="skillrow"><div class="skilllabel">{{ s.label }}</div><div class="skillval">{{ s.value }}</div></div>{% endfor %}
  {% endif %}

  {% if r.education %}<h2>Education</h2>
    {% for ed in r.education %}<div class="entry">
      <div class="row"><span class="title">{{ ed.degree }}</span><span class="meta">{{ ed.year }} {{ ed.score }}</span></div>
      <div class="sub">{{ ed.institute }}</div>
    </div>{% endfor %}
  {% endif %}

  {% if r.certifications %}<h2>Certifications</h2><ul>
    {% for c in r.certifications %}<li>{{ c.label }}{% if c.value %} — {{ c.value }}{% endif %}</li>{% endfor %}
  </ul>{% endif %}
</body></html>""")


def render_resume_html(data: dict, template: str = "classic") -> str:
    return RESUME_HTML.render(r=data, accent="#0d9488" if template == "modern" else "#1f3a5f")


def html_to_pdf_bytes(html: str) -> bytes:
    from weasyprint import HTML
    return HTML(string=html).write_pdf()
