"""Transform DB rows into the JSON shapes the existing React frontend expects.
Keeps the `{responseCode, responseMessage, data}` envelope and field names
(title, tech, points, githubUrl, _id, ...) so the frontend stays unchanged."""
from datetime import date


def ok(data=None, message="SUCCESS"):
    return {"responseCode": "00", "responseMessage": message, "data": data}


def fail(message="Error", code="99"):
    return {"responseCode": code, "responseMessage": message, "data": None}


def _id(row):
    return str(row.id) if row and row.id is not None else None


def fmt_period(start, end, is_current: bool) -> str:
    def fmt(d):
        return d.strftime("%b %Y") if d else ""
    s = fmt(start)
    e = "Present" if is_current else fmt(end)
    return f"{s} – {e}"


def _iso(d):
    """date/datetime -> 'YYYY-MM-DD' (Mongo stores dates as datetimes)."""
    return d.strftime("%Y-%m-%d") if d else None


def hero(profile):
    p = profile
    if not p:
        return {}
    return {
        "name": p.name, "role": p.title, "location": p.location, "summary": p.summary,
        "email": p.email, "phone": p.phone, "linkedin": p.linkedin, "github": p.github,
        "website": p.website, "avatar": p.avatar,
    }


def contact(profile):
    p = profile
    if not p:
        return {}
    return {"email": p.email, "phone": p.phone, "linkedin": p.linkedin, "github": p.github}


def skill(s):
    return {"_id": _id(s), "id": s.id, "category": s.category, "items": s.items or []}


def project(p):
    return {
        "_id": _id(p), "id": p.id, "title": p.name, "description": p.description,
        "tech": p.tech_stack or [], "points": p.features or [], "metrics": p.metrics or {},
        "githubUrl": p.github_url, "liveUrl": p.live_url, "isFeatured": p.is_featured, "order": p.order,
    }


def experience(e):
    return {
        "_id": _id(e), "id": e.id, "company": e.company, "role": e.role, "location": e.location,
        "period": fmt_period(e.start_date, e.end_date, e.is_current),
        "responsibilities": e.responsibilities or [], "technologies": e.technologies or [],
        "startDate": _iso(e.start_date), "endDate": _iso(e.end_date), "isCurrent": e.is_current,
    }


def education(ed):
    return {
        "_id": _id(ed), "id": ed.id, "qualification": ed.qualification, "institution": ed.institution,
        "score": ed.score, "year": ed.year, "location": ed.location,
    }


def certification(c):
    return {
        "_id": _id(c), "id": c.id, "title": c.title, "issuer": c.issuer, "platform": c.platform,
        "year": c.year, "logo": c.logo, "certificateUrl": c.certificate_url,
        "credentialId": c.credential_id, "order": c.order,
    }


def settings(s):
    if not s:
        return {}
    return {
        "_id": _id(s), "accentColor": s.accent_color, "seo": s.seo or {},
        "hero": s.hero or {}, "sections": s.sections or {}, "footer": s.footer or {},
    }


def message(m):
    return {
        "_id": _id(m), "id": m.id, "name": m.name, "email": m.email, "message": m.message,
        "read": m.read, "createdAt": m.created_at.isoformat() if m.created_at else None,
    }


def blog_list(b):
    return {
        "_id": _id(b), "id": b.id, "title": b.title, "slug": b.slug, "excerpt": b.excerpt,
        "createdAt": b.created_at.isoformat() if b.created_at else None,
        "updatedAt": b.updated_at.isoformat() if b.updated_at else None,
    }


def blog_full(b):
    d = blog_list(b)
    d["content"] = b.content
    return d


def note_section(s):
    return {"_id": _id(s), "id": s.id, "title": s.title, "order": s.order}


def note(n):
    return {
        "_id": _id(n), "id": n.id, "sectionId": str(n.section_id), "title": n.title,
        "content": n.content, "order": n.order,
        "createdAt": n.created_at.isoformat() if n.created_at else None,
    }
