"""Five self-contained résumé designs. Each is an independent Jinja2 template
(own <style> block) so tweaking one design can't affect another. All of them
consume the same `r` data shape: name, headline, email, phone, location,
linkedin, summary, experience[], projects[], skills[], education[],
certifications[] — see backend/app/services/resume_from_portfolio.py."""
from jinja2 import Template

# ── Classic — traditional single column, navy accent ────────────────────────
CLASSIC = Template("""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Liberation Sans', Arial, sans-serif; color: #1f2937; font-size: 10.5px; line-height: 1.45; }
  .name { font-size: 22px; font-weight: 700; color: #111827; }
  .headline { color: #1f3a5f; font-weight: 700; font-size: 11px; margin-top: 2px; }
  .contact { color: #4b5563; font-size: 8.5px; margin-top: 5px; }
  .contact span { margin-right: 10px; }
  hr { border: 0; border-top: 1.2px solid #1f3a5f; margin: 9px 0 10px; }
  h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #1f3a5f; margin: 12px 0 5px; }
  .entry { margin-bottom: 8px; page-break-inside: avoid; }
  .row { display: flex; justify-content: space-between; }
  .title { font-weight: 700; color: #111827; }
  .sub { color: #1f3a5f; }
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

# ── Modern — teal accent, bold headers with an underline bar ────────────────
MODERN = Template("""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 15mm 13mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Liberation Sans', Arial, sans-serif; color: #1f2937; font-size: 10.5px; line-height: 1.55; }
  .name { font-size: 25px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; }
  .headline { color: #0d9488; font-weight: 700; font-size: 11.5px; margin-top: 3px; }
  .contact { color: #4b5563; font-size: 8.5px; margin-top: 7px; }
  .contact span { margin-right: 12px; padding-right: 12px; border-right: 1px solid #d1d5db; }
  .contact span:last-child { border-right: none; }
  h2 { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #0f172a;
       margin: 16px 0 7px; padding-bottom: 4px; border-bottom: 2.5px solid #0d9488; }
  .entry { margin-bottom: 10px; page-break-inside: avoid; }
  .row { display: flex; justify-content: space-between; }
  .title { font-weight: 700; color: #0f172a; font-size: 10.8px; }
  .sub { color: #0d9488; font-weight: 600; }
  .meta { color: #6b7280; font-size: 9px; font-weight: 600; }
  ul { margin: 4px 0 0; padding-left: 15px; }
  li { margin-top: 3px; }
  .skillrow { display: flex; margin-bottom: 4px; align-items: baseline; }
  .skilllabel { width: 135px; font-weight: 700; color: #0f172a; }
  .skillval { flex: 1; color: #374151; }
</style></head><body>
  <div class="name">{{ r.name }}</div>
  {% if r.headline %}<div class="headline">{{ r.headline }}</div>{% endif %}
  <div class="contact">
    {% for c in [r.email, r.phone, r.location, r.linkedin] if c %}<span>{{ c }}</span>{% endfor %}
  </div>
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

# ── Minimal — monochrome, small-caps labels, thin hairlines ─────────────────
MINIMAL = Template("""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Liberation Sans', Arial, sans-serif; color: #27272a; font-size: 10px; line-height: 1.6; }
  .name { font-size: 20px; font-weight: 400; letter-spacing: 1px; color: #18181b; }
  .headline { color: #52525b; font-size: 10.5px; margin-top: 4px; letter-spacing: 0.3px; }
  .contact { color: #71717a; font-size: 8.5px; margin-top: 8px; }
  .contact span { margin-right: 14px; }
  hr { border: 0; border-top: 0.75px solid #d4d4d8; margin: 12px 0 12px; }
  h2 { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 2.5px; color: #52525b;
       margin: 16px 0 8px; padding-bottom: 3px; border-bottom: 0.75px solid #e4e4e7; }
  .entry { margin-bottom: 9px; page-break-inside: avoid; }
  .row { display: flex; justify-content: space-between; }
  .title { font-weight: 600; color: #18181b; }
  .sub { color: #52525b; font-style: italic; }
  .meta { color: #a1a1aa; font-size: 8.5px; }
  ul { margin: 4px 0 0; padding-left: 13px; }
  li { margin-top: 3px; color: #3f3f46; }
  .skillrow { display: flex; margin-bottom: 4px; }
  .skilllabel { width: 130px; color: #52525b; }
  .skillval { flex: 1; color: #3f3f46; }
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

# ── ATS-Friendly (Compact) — plain black/white, dense, parser-safe ──────────
ATS_COMPACT = Template("""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 12mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Liberation Sans', Arial, sans-serif; color: #000000; font-size: 10px; line-height: 1.35; }
  .name { font-size: 16px; font-weight: 700; color: #000000; }
  .headline { font-size: 10.5px; margin-top: 1px; }
  .contact { font-size: 9px; margin-top: 4px; }
  .contact span { margin-right: 10px; }
  h2 { font-size: 10.5px; font-weight: 700; text-transform: none; margin: 10px 0 3px; }
  h2::after { content: ":"; }
  .entry { margin-bottom: 6px; page-break-inside: avoid; }
  .row { display: flex; justify-content: space-between; }
  .title { font-weight: 700; }
  .sub { font-weight: 400; }
  .meta { font-size: 9px; }
  ul { margin: 2px 0 0; padding-left: 14px; }
  li { margin-top: 1px; }
  .skillrow { margin-bottom: 2px; }
  .skilllabel { font-weight: 700; display: inline; }
  .skillval { display: inline; }
</style></head><body>
  <div class="name">{{ r.name }}</div>
  {% if r.headline %}<div class="headline">{{ r.headline }}</div>{% endif %}
  <div class="contact">
    {% for c in [r.email, r.phone, r.location, r.linkedin] if c %}<span>{{ c }}</span>{% endfor %}
  </div>

  {% if r.summary %}<h2>Summary</h2><div>{{ r.summary }}</div>{% endif %}

  {% if r.experience %}<h2>Experience</h2>
    {% for e in r.experience %}<div class="entry">
      <div class="row"><span class="title">{{ e.role }}, {{ e.company }}</span><span class="meta">{{ e.duration }}</span></div>
      {% if e.location %}<div class="meta">{{ e.location }}</div>{% endif %}
      {% if e.bullets %}<ul>{% for b in e.bullets %}<li>{{ b }}</li>{% endfor %}</ul>{% endif %}
    </div>{% endfor %}
  {% endif %}

  {% if r.projects %}<h2>Projects</h2>
    {% for p in r.projects %}<div class="entry">
      <span class="title">{{ p.name }}</span>{% if p.tech %} ({{ p.tech }}){% endif %}
      {% if p.bullets %}<ul>{% for b in p.bullets %}<li>{{ b }}</li>{% endfor %}</ul>{% endif %}
    </div>{% endfor %}
  {% endif %}

  {% if r.skills %}<h2>Skills</h2>
    {% for s in r.skills %}<div class="skillrow"><span class="skilllabel">{{ s.label }}: </span><span class="skillval">{{ s.value }}</span></div>{% endfor %}
  {% endif %}

  {% if r.education %}<h2>Education</h2>
    {% for ed in r.education %}<div class="entry">
      <div class="row"><span class="title">{{ ed.degree }}, {{ ed.institute }}</span><span class="meta">{{ ed.year }} {{ ed.score }}</span></div>
    </div>{% endfor %}
  {% endif %}

  {% if r.certifications %}<h2>Certifications</h2><ul>
    {% for c in r.certifications %}<li>{{ c.label }}{% if c.value %} — {{ c.value }}{% endif %}</li>{% endfor %}
  </ul>{% endif %}
</body></html>""")

# ── Two-Column (Sidebar) — contact/skills/education on the left ─────────────
SIDEBAR = Template("""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { font-family: 'Liberation Sans', Arial, sans-serif; color: #1f2937; font-size: 10px; line-height: 1.5; margin: 0; }
  .wrap { display: flex; min-height: 100%; }
  .side { width: 34%; background: #0f172a; color: #e2e8f0; padding: 16mm 8mm 14mm 12mm; }
  .main { width: 66%; padding: 16mm 12mm 14mm 8mm; }
  .name { font-size: 19px; font-weight: 800; color: #ffffff; line-height: 1.25; }
  .headline { color: #5eead4; font-weight: 600; font-size: 10px; margin-top: 4px; }
  .side h2 { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #5eead4;
             margin: 16px 0 6px; }
  .side .contact div { font-size: 8.5px; color: #cbd5e1; margin-bottom: 4px; word-break: break-word; }
  .side .skillrow { margin-bottom: 6px; }
  .side .skilllabel { font-size: 8.5px; font-weight: 700; color: #f1f5f9; }
  .side .skillval { font-size: 8.5px; color: #94a3b8; margin-top: 1px; }
  .side .entry { margin-bottom: 8px; page-break-inside: avoid; }
  .side .title { font-size: 9px; font-weight: 700; color: #f1f5f9; }
  .side .sub { font-size: 8.5px; color: #94a3b8; }
  .side .meta { font-size: 8px; color: #64748b; }
  .main h2 { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #0f172a;
             margin: 14px 0 6px; padding-bottom: 3px; border-bottom: 2px solid #0f172a; }
  .main h2:first-child { margin-top: 0; }
  .entry { margin-bottom: 9px; page-break-inside: avoid; }
  .row { display: flex; justify-content: space-between; }
  .title { font-weight: 700; color: #0f172a; }
  .sub { color: #334155; font-weight: 600; }
  .meta { color: #64748b; font-size: 8.5px; }
  ul { margin: 3px 0 0; padding-left: 13px; }
  li { margin-top: 2px; }
</style></head><body>
  <div class="wrap">
    <div class="side">
      <div class="name">{{ r.name }}</div>
      {% if r.headline %}<div class="headline">{{ r.headline }}</div>{% endif %}

      <h2>Contact</h2>
      <div class="contact">
        {% for c in [r.email, r.phone, r.location, r.linkedin] if c %}<div>{{ c }}</div>{% endfor %}
      </div>

      {% if r.skills %}<h2>Skills</h2>
        {% for s in r.skills %}<div class="skillrow"><div class="skilllabel">{{ s.label }}</div><div class="skillval">{{ s.value }}</div></div>{% endfor %}
      {% endif %}

      {% if r.education %}<h2>Education</h2>
        {% for ed in r.education %}<div class="entry">
          <div class="title">{{ ed.degree }}</div>
          <div class="sub">{{ ed.institute }}</div>
          <div class="meta">{{ ed.year }} {{ ed.score }}</div>
        </div>{% endfor %}
      {% endif %}

      {% if r.certifications %}<h2>Certifications</h2>
        {% for c in r.certifications %}<div class="entry">
          <div class="title">{{ c.label }}</div>
          {% if c.value %}<div class="sub">{{ c.value }}</div>{% endif %}
        </div>{% endfor %}
      {% endif %}
    </div>

    <div class="main">
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
    </div>
  </div>
</body></html>""")

TEMPLATES = {
    "classic": CLASSIC,
    "modern": MODERN,
    "minimal": MINIMAL,
    "ats": ATS_COMPACT,
    "sidebar": SIDEBAR,
}
DEFAULT_TEMPLATE = "classic"
