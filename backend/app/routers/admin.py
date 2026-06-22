"""Admin CRUD — mirrors the old /api/v1/admin contract (camelCase fields)."""
import re
from datetime import date, datetime
from fastapi import APIRouter, Depends, Body
from pydantic import BaseModel
from sqlmodel import Session, select, desc
from ..database import get_session
from ..auth import login as do_login, require_role
from ..defaults import get_or_create_settings
from ..models import (
    Profile, Project, Experience, Skill, Education, Certification, ContactMessage, BlogPost,
)
from .. import serializers as S

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])
admin_only = Depends(require_role("admin"))


# ── Auth ──────────────────────────────────────────────────────────────────
class LoginIn(BaseModel):
    password: str


@router.post("/login")
def admin_login(body: LoginIn):
    return {"responseCode": "00", "token": do_login("admin", body.password)}


def _parse_date(v):
    if not v:
        return None
    try:
        return date.fromisoformat(str(v)[:10])
    except ValueError:
        return None


# ── Field mappers (frontend camelCase <-> model snake_case) ────────────────
def skill_out(s):
    return {"_id": S._id(s), "id": s.id, "category": s.category, "skills": s.items or []}


def project_out(p):
    return {
        "_id": S._id(p), "id": p.id, "name": p.name, "description": p.description,
        "features": p.features or [], "techStack": p.tech_stack or [], "githubUrl": p.github_url,
        "liveUrl": p.live_url, "isFeatured": p.is_featured, "order": p.order, "metrics": p.metrics or {},
    }


def exp_out(e):
    return {
        "_id": S._id(e), "id": e.id, "company": e.company, "role": e.role, "location": e.location,
        "startDate": e.start_date.isoformat() if e.start_date else "",
        "endDate": e.end_date.isoformat() if e.end_date else "", "isCurrent": e.is_current,
        "responsibilities": e.responsibilities or [], "technologies": e.technologies or [],
    }


def cert_out(c):
    return {
        "_id": S._id(c), "id": c.id, "title": c.title, "issuer": c.issuer, "platform": c.platform,
        "year": c.year, "logo": c.logo, "certificateUrl": c.certificate_url,
        "credentialId": c.credential_id, "order": c.order,
    }


# ── Profile ────────────────────────────────────────────────────────────────
def _profile_out(p):
    if not p:
        return None
    return {
        "_id": S._id(p), "name": p.name, "title": p.title, "location": p.location, "email": p.email,
        "phone": p.phone, "summary": p.summary, "linkedin": p.linkedin, "github": p.github,
        "website": p.website, "avatar": p.avatar,
    }


PROFILE_FIELDS = ["name", "title", "location", "email", "phone", "summary", "linkedin", "github", "website", "avatar"]


@router.get("/profile", dependencies=[admin_only])
def get_profile(session: Session = Depends(get_session)):
    return S.ok(_profile_out(session.exec(select(Profile)).first()))


@router.put("/profile", dependencies=[admin_only])
def update_profile(data: dict = Body(...), session: Session = Depends(get_session)):
    p = session.exec(select(Profile)).first() or Profile()
    for f in PROFILE_FIELDS:
        if f in data:
            setattr(p, f, data[f] or "")
    session.add(p)
    session.commit()
    session.refresh(p)
    return S.ok(_profile_out(p))


# ── Skills ────────────────────────────────────────────────────────────────
@router.get("/skills", dependencies=[admin_only])
def list_skills(session: Session = Depends(get_session)):
    return S.ok([skill_out(s) for s in session.exec(select(Skill).order_by(Skill.id)).all()])


@router.post("/skills", dependencies=[admin_only])
def create_skill(data: dict = Body(...), session: Session = Depends(get_session)):
    s = Skill(category=data.get("category", ""), items=data.get("skills", []))
    session.add(s); session.commit(); session.refresh(s)
    return S.ok(skill_out(s))


@router.put("/skills/{sid}", dependencies=[admin_only])
def update_skill(sid: int, data: dict = Body(...), session: Session = Depends(get_session)):
    s = session.get(Skill, sid)
    if not s:
        return S.fail("Not found")
    s.category = data.get("category", s.category)
    s.items = data.get("skills", s.items)
    session.add(s); session.commit(); session.refresh(s)
    return S.ok(skill_out(s))


@router.delete("/skills/{sid}", dependencies=[admin_only])
def delete_skill(sid: int, session: Session = Depends(get_session)):
    s = session.get(Skill, sid)
    if s:
        session.delete(s); session.commit()
    return S.ok({"id": sid})


# ── Projects ──────────────────────────────────────────────────────────────
def _apply_project(p, d):
    p.name = d.get("name", p.name)
    p.description = d.get("description", p.description)
    p.features = d.get("features", p.features)
    p.tech_stack = d.get("techStack", p.tech_stack)
    p.github_url = d.get("githubUrl", p.github_url)
    p.live_url = d.get("liveUrl", p.live_url)
    p.is_featured = bool(d.get("isFeatured", p.is_featured))
    p.order = int(d.get("order", p.order) or 0)
    p.metrics = d.get("metrics", p.metrics)
    return p


@router.get("/projects", dependencies=[admin_only])
def list_projects(session: Session = Depends(get_session)):
    return S.ok([project_out(p) for p in session.exec(select(Project).order_by(Project.order, Project.id)).all()])


@router.post("/projects", dependencies=[admin_only])
def create_project(data: dict = Body(...), session: Session = Depends(get_session)):
    p = _apply_project(Project(), data)
    session.add(p); session.commit(); session.refresh(p)
    return S.ok(project_out(p))


@router.put("/projects/{pid}", dependencies=[admin_only])
def update_project(pid: int, data: dict = Body(...), session: Session = Depends(get_session)):
    p = session.get(Project, pid)
    if not p:
        return S.fail("Not found")
    _apply_project(p, data)
    session.add(p); session.commit(); session.refresh(p)
    return S.ok(project_out(p))


@router.delete("/projects/{pid}", dependencies=[admin_only])
def delete_project(pid: int, session: Session = Depends(get_session)):
    p = session.get(Project, pid)
    if p:
        session.delete(p); session.commit()
    return S.ok({"id": pid})


# ── Experience ────────────────────────────────────────────────────────────
def _apply_exp(e, d):
    e.company = d.get("company", e.company)
    e.role = d.get("role", e.role)
    e.location = d.get("location", e.location)
    e.start_date = _parse_date(d.get("startDate")) if "startDate" in d else e.start_date
    e.end_date = _parse_date(d.get("endDate")) if "endDate" in d else e.end_date
    e.is_current = bool(d.get("isCurrent", e.is_current))
    e.responsibilities = d.get("responsibilities", e.responsibilities)
    e.technologies = d.get("technologies", e.technologies)
    return e


@router.get("/experience", dependencies=[admin_only])
def list_experience(session: Session = Depends(get_session)):
    return S.ok([exp_out(e) for e in session.exec(select(Experience).order_by(desc(Experience.start_date))).all()])


@router.post("/experience", dependencies=[admin_only])
def create_experience(data: dict = Body(...), session: Session = Depends(get_session)):
    e = _apply_exp(Experience(), data)
    session.add(e); session.commit(); session.refresh(e)
    return S.ok(exp_out(e))


@router.put("/experience/{eid}", dependencies=[admin_only])
def update_experience(eid: int, data: dict = Body(...), session: Session = Depends(get_session)):
    e = session.get(Experience, eid)
    if not e:
        return S.fail("Not found")
    _apply_exp(e, data)
    session.add(e); session.commit(); session.refresh(e)
    return S.ok(exp_out(e))


@router.delete("/experience/{eid}", dependencies=[admin_only])
def delete_experience(eid: int, session: Session = Depends(get_session)):
    e = session.get(Experience, eid)
    if e:
        session.delete(e); session.commit()
    return S.ok({"id": eid})


# ── Education ──────────────────────────────────────────────────────────────
EDU_FIELDS = ["qualification", "institution", "score", "year", "location"]


@router.get("/education", dependencies=[admin_only])
def list_education(session: Session = Depends(get_session)):
    return S.ok([S.education(e) for e in session.exec(select(Education).order_by(Education.id)).all()])


@router.post("/education", dependencies=[admin_only])
def create_education(data: dict = Body(...), session: Session = Depends(get_session)):
    e = Education(**{f: data.get(f, "") for f in EDU_FIELDS})
    session.add(e); session.commit(); session.refresh(e)
    return S.ok(S.education(e))


@router.put("/education/{eid}", dependencies=[admin_only])
def update_education(eid: int, data: dict = Body(...), session: Session = Depends(get_session)):
    e = session.get(Education, eid)
    if not e:
        return S.fail("Not found")
    for f in EDU_FIELDS:
        if f in data:
            setattr(e, f, data[f] or "")
    session.add(e); session.commit(); session.refresh(e)
    return S.ok(S.education(e))


@router.delete("/education/{eid}", dependencies=[admin_only])
def delete_education(eid: int, session: Session = Depends(get_session)):
    e = session.get(Education, eid)
    if e:
        session.delete(e); session.commit()
    return S.ok({"id": eid})


# ── Certifications ────────────────────────────────────────────────────────
def _apply_cert(c, d):
    c.title = d.get("title", c.title)
    c.issuer = d.get("issuer", c.issuer)
    c.platform = d.get("platform", c.platform)
    c.year = d.get("year", c.year)
    c.logo = d.get("logo", c.logo)
    c.certificate_url = d.get("certificateUrl", c.certificate_url)
    c.credential_id = d.get("credentialId", c.credential_id)
    c.order = int(d.get("order", c.order) or 0)
    return c


@router.get("/certifications", dependencies=[admin_only])
def list_certs(session: Session = Depends(get_session)):
    return S.ok([cert_out(c) for c in session.exec(select(Certification).order_by(Certification.order)).all()])


@router.post("/certifications", dependencies=[admin_only])
def create_cert(data: dict = Body(...), session: Session = Depends(get_session)):
    c = _apply_cert(Certification(), data)
    session.add(c); session.commit(); session.refresh(c)
    return S.ok(cert_out(c))


@router.put("/certifications/{cid}", dependencies=[admin_only])
def update_cert(cid: int, data: dict = Body(...), session: Session = Depends(get_session)):
    c = session.get(Certification, cid)
    if not c:
        return S.fail("Not found")
    _apply_cert(c, data)
    session.add(c); session.commit(); session.refresh(c)
    return S.ok(cert_out(c))


@router.delete("/certifications/{cid}", dependencies=[admin_only])
def delete_cert(cid: int, session: Session = Depends(get_session)):
    c = session.get(Certification, cid)
    if c:
        session.delete(c); session.commit()
    return S.ok({"id": cid})


# ── Messages ──────────────────────────────────────────────────────────────
@router.get("/messages", dependencies=[admin_only])
def list_messages(session: Session = Depends(get_session)):
    return S.ok([S.message(m) for m in session.exec(select(ContactMessage).order_by(desc(ContactMessage.created_at))).all()])


@router.delete("/messages/{mid}", dependencies=[admin_only])
def delete_message(mid: int, session: Session = Depends(get_session)):
    m = session.get(ContactMessage, mid)
    if m:
        session.delete(m); session.commit()
    return S.ok({"id": mid})


@router.patch("/messages/{mid}/read", dependencies=[admin_only])
def mark_read(mid: int, session: Session = Depends(get_session)):
    m = session.get(ContactMessage, mid)
    if m:
        m.read = True
        session.add(m); session.commit()
    return S.ok({"id": mid})


# ── Site Settings ──────────────────────────────────────────────────────────
@router.get("/settings", dependencies=[admin_only])
def get_settings(session: Session = Depends(get_session)):
    return S.ok(S.settings(get_or_create_settings(session)))


@router.put("/settings", dependencies=[admin_only])
def update_settings(data: dict = Body(...), session: Session = Depends(get_session)):
    s = get_or_create_settings(session)
    if "accentColor" in data:
        s.accent_color = data["accentColor"]
    for f in ("seo", "hero", "sections", "footer"):
        if f in data and isinstance(data[f], dict):
            current = getattr(s, f) or {}
            setattr(s, f, {**current, **data[f]})
    session.add(s); session.commit(); session.refresh(s)
    return S.ok(S.settings(s))


# ── Blog ──────────────────────────────────────────────────────────────────
def _slugify(text):
    s = re.sub(r"[^a-z0-9\s-]", "", (text or "").lower()).strip()
    s = re.sub(r"\s+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")


def _excerpt(content, fallback):
    if fallback:
        return fallback
    plain = re.sub(r"\s+", " ", re.sub(r"[#*`>_~\-]", "", content or "")).strip()
    return plain[:157] + "…" if len(plain) > 160 else plain


@router.get("/blog", dependencies=[admin_only])
def list_blog(session: Session = Depends(get_session)):
    return S.ok([S.blog_full(b) for b in session.exec(select(BlogPost).order_by(desc(BlogPost.created_at))).all()])


@router.post("/blog", dependencies=[admin_only])
def create_blog(data: dict = Body(...), session: Session = Depends(get_session)):
    return _save_blog(None, data, session)


@router.put("/blog/{bid}", dependencies=[admin_only])
def update_blog(bid: int, data: dict = Body(...), session: Session = Depends(get_session)):
    return _save_blog(bid, data, session)


@router.delete("/blog/{bid}", dependencies=[admin_only])
def delete_blog(bid: int, session: Session = Depends(get_session)):
    b = session.get(BlogPost, bid)
    if b:
        session.delete(b); session.commit()
    return S.ok({"id": bid})


def _save_blog(bid, data, session):
    title = data.get("title", "")
    content = data.get("content", "")
    slug = _slugify(data.get("slug") or title) or f"post-{int(datetime.utcnow().timestamp())}"
    # ensure unique slug
    clash = session.exec(select(BlogPost).where(BlogPost.slug == slug)).first()
    if clash and clash.id != bid:
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
    b = session.get(BlogPost, bid) if bid else BlogPost()
    b.title = title
    b.content = content
    b.excerpt = _excerpt(content, data.get("excerpt", ""))
    b.slug = slug
    b.updated_at = datetime.utcnow()
    session.add(b); session.commit(); session.refresh(b)
    return S.ok(S.blog_full(b))
